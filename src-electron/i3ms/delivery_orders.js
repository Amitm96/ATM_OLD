const moment = require('moment');
const _ = require('lodash');

const { union } = require('./set_operations');
const i3ms = require('./puppeteer');
const util = require('./util');
const { firestore } = require('./environment')({
    db: process.env.DB_NAME || 'ta'
});

const companies = {};
const companyCollection = firestore.collection('companies');
const reqCollection = firestore.collection('requirements');
const ordersCollection = firestore.collection('orders');
const usersCollection = firestore.collection('users');

const RequirementStatus = {
    PARTIAL: 0,
    NEW: 1,
    ORDER_CREATED: 2,
    AUCTION_STARTED: 3,
    AUCTION_COMPLETED: 4,
    WINNER_SELECTED: 5,
    INPROGRESS: 6,
    DELIVERED: 7,
    PAYMENT_PENDING: 8,
    COMPLETED: 9,
}

const TripStatus = {
    NEW: 0,
    ENTRYOPERATOR: 1,
    LOADING: 2,
    GROSSWEIGHT: 3,
    EXITOPERATOR: 4,
    STARTED: 5,
    COMPLETED: 6,
    CANCELLED: 7,
};


const DeliveryOrderStatus = { NEW: 0, INPROGRESS: 1, COMPLETED: 2 };

const DeliveryOrder = {
    assignTransporters: async (order, oldOrder, ts) => {

        oldOrder = oldOrder || {
            activeTransporters: [],
            client_ids: [],
        };

        ts = ts.map((t) => t.data());

        try {
            const newTransporters = ts.map((t) => t.company_id);
            order.activeTransporters = [...(union(newTransporters, oldOrder.activeTransporters))];
            console.log('assigning transporters is called', ts.length, order.client_ids, order.activeTransporters);
            order.client_ids = [...(union(order.client_ids, order.activeTransporters))];

            ts.forEach((selected) => {
                if (!oldOrder[selected.company_id]) {
                    order[selected.company_id] = {
                        'name': selected.name,
                        'phoneNumber': selected.phoneNumber,
                        'companyName': selected.companyName,
                        'gstin': selected.companyGstin || null,
                        'delivered': 0.0,
                        'onroad': 0.0,
                        'assigned': 0.0,
                        'unloaded_quantity': 0.0
                    };
                }
            });

            order.status = DeliveryOrderStatus.NEW;
            console.log('after assigned client ids', order.client_ids);
            console.log('after assigned active transporters', order.activeTransporters);

        } catch (ex) {
            console.log('assigning transporters', ex);
        }
    }
}

async function populateCompany(name) {
    if (!companies[name]) {
        const snapshot = await companyCollection.where('name', '==', name).get();
        if (snapshot.docs.length) {
            companies[name] = snapshot.docs[0];
        } else {
            await companyCollection.add({
                name: name,
                type: 'client',
            });
            const snapshot = await companyCollection.where('name', '==', name).get();
            if (snapshot.docs.length) {
                companies[name] = snapshot.docs[0];
            }
        }
    }

    return Promise.resolve();
}

async function deliveryOrders() {
    try {
        await i3ms.init();
        const result = await i3ms.getDeliveryOrders('https://i3ms.orissaminerals.gov.in/i3ms/pms/ViewTransporterAction.aspx');
        console.log(result);


        let out = result.map((r) => {
            const data = {};
            data['createDate'] = moment(r['Request On'], 'DD MMM YYYY').toDate();
            data['sales_order'] = r['Permit No.'];
            data['start_date'] = new Date();
            data['uom'] = 'MT';
            data['requestedBy'] = util.companyName(r['Lessee/Licensee Name']);
            data['tagVehicleHref'] = r['Tag New Vehicle'];
            data['vehicleDetailsHref'] = r['Vehicle Details'];
            data['final_weightment'] = .0;
            data.i3ms = true;
            data.ta_customer = true;
            return data;
        });


        await out.reduce(async (p, obj) => {
            await p;
            const doc = await reqCollection.doc(obj.sales_order).get();

            if (!doc.exists) {
                const r = await i3ms.getPermitDetails(obj.vehicleDetailsHref);
                obj.quantity = parseFloat(r['Permit Qty.'].replace(/[^\d\.]/g, ''));
                obj.permitValidity = r['Permit Validity'];
                obj.transportedFrom = r['Transported From'];
            }

            return Promise.resolve();
        }, Promise.resolve());

        //populate client_id and client_ids
        await out.reduce(async (p, order) => {
            await p;
            const doc = await reqCollection.doc(order.sales_order).get();

            if (!doc.exists) {

                await populateCompany(order.transportedFrom);
                order.client_id = companies[order.transportedFrom].id;
                order.customerName = order.transportedFrom;
                order.client_ids = [order.client_id];

                if (order.requestedBy != order.transportedFrom) {
                    await populateCompany(order.requestedBy);
                    order.other_client_id = companies[order.requestedBy].id;
                    order.other_client_name = order.requestedBy;
                    order.client_ids.push(order.other_client_id);
                }

            } else {
                order.client_id = doc.get('client_id');
                order.client_ids = doc.get('client_ids');
            }
            return Promise.resolve();
        }, Promise.resolve());

        console.log(out);

        //saving
        await Promise.all(out.map(async (order) => {
            const req = _.clone(order);
            const snapshot = await ordersCollection.where('sales_order', '==', order.sales_order).get();
            if (!snapshot.docs.length) {
                const ts = await usersCollection.where('user_type', '==', 'transporter').where('company_id', '==', process.argv[2]).get();
                //console.log(ts);
                if (!ts.empty) {
                    console.log('assigning transporters')
                    await DeliveryOrder.assignTransporters(order, null, ts.docs);
                }

                order.req_id = order.sales_order;
                order.status = DeliveryOrderStatus.NEW;
                await ordersCollection.add(order);
            } else {
                //update order
                const ts = await usersCollection.where('user_type', '==', 'transporter').where('company_id', '==', process.argv[2]).get();
                //console.log(ts);
                if (!ts.empty) {
                    console.log('assigning transporters')
                    await DeliveryOrder.assignTransporters(order, null, ts.docs);
                }
                order.req_id = order.sales_order;
                await snapshot.docs[0].ref.set(order, { merge: true });
            }
            order['status'] = RequirementStatus.INPROGRESS;
            return reqCollection.doc(order.sales_order).set(req, { merge: true });
        }));

    } catch (ex) {
        console.error(ex);
    }
}

if (require.main == module) {
    deliveryOrders();
}
