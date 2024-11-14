require('console-stamp')(console, '[yyyy.mm.dd HH:MM:ss.l]');

const Queue = require('better-queue');

const api = require('./puppeteer');

const { firestore } = require('../common/environment')({
    db: process.env.DB_NAME || 'ta'
});

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const tagged = {};
const released = {};

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

async function processTrip(doc) {
    running = true;
    const trip = doc.data();

    const firedata = {};

    console.log('Trying to process', trip.truck_license);

    if (!trip['i3ms_tagged'] && trip.status == TripStatus.LOADING && tagged[trip.truck_license]) {
        const r = await api.tagVehicle(trip.tagVehicleHref, trip.truck_license);
        if (r) {
            tagged[trip.truck_license] = r;
            firedata.i3ms_tagged = true;
            await doc.ref.update(firedata);
        } else {
            console.log('Failed to tag', r);
            throw new Error('Failed to tag');
        }
    } else if (!trip['i3ms_released'] && trip.status == TripStatus.COMPLETED && released[trip.truck_license]) {
        const r = await api.releaseVehicle('https://i3ms.orissaminerals.gov.in/i3ms/pms/ReleaseVehicle.aspx?linkn=297&linkm=15&Openstate=0', trip.truck_license, trip.sales_order);
        if (r) {
            released[trip.truck_license] = r;
            firedata.i3ms_released = true;
            await doc.ref.update(firedata);
        } else {
            console.log('Failed to release', r);
            throw new Error('Failed to release');
        }
    }
}

let running = false;

const queue = new Queue(async (doc, cb) => {

    if (running) {
        console.log('Already running one instance trip', doc.get('truck_license'));
        //cb(null);
        cb(new Error('Alerady running'));
        return;
    }

    console.log('Processing trip', doc.get('truck_license'), doc.get('status'));

    try {
        const ret = await processTrip(doc);
        console.log('Processed trip', doc.get('truck_license'));
        running = false;
        cb(null, ret);
    } catch (ex) {
        console.log('Failed to tag/release  for trip', doc.get('truck_license'));
        console.error(ex);
        running = false;
        cb(ex);
    }

}, {
    maxRetries: 50,
    retryDelay: 60000,
    concurrent: 1,
    cancelIfRunning: true,
    merge: function (oldTask, newTask, cb) {
        cb(null, oldTask);
    }
})


const query = firestore.collection('trips')
    .where('i3ms', '==', true)
    .where('partner_id', '==', process.argv[2]);

let timer = setInterval(firestoreListener, 10 * 60 * 1000);
let unsubscribe;

function firestoreListener() {
    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = query.onSnapshot(querySnapshot => {
        clearInterval(timer);
        timer = setInterval(firestoreListener, 10 * 60 * 1000);
        querySnapshot.docs.forEach((doc) => {
            console.log('Pushing trip', doc.get('truck_license'));
            queue.push(doc);
        });
    }, function (err) {
        console.error(err);
        firestoreListener();
    });
}

firestoreListener();
