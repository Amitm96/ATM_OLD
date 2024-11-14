
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', name: 'permits', component: () => import('pages/PagePermits.vue'), props: true, meta: { title: 'Permits' } },
      { path: '/payments', name: 'payments', component: () => import('pages/PagePayments.vue'), props: true, meta: { title: 'Owner Payments' } },
      { path: '/newpayment', name: 'newpayment', component: () => import('pages/PageNewOrEditPayment.vue'), props: true, meta: { title: 'New Payment' } },
      { path: '/paymentvoucher', name: 'paymentvoucher', component: () => import('pages/PagePaymentVoucher.vue'), props: true, meta: { title: 'Payment Voucher' } },
      {
        path: '/payment/:id',
        name: 'editpayment',
        component: () => import('pages/PageNewOrEditPayment.vue'), 
        props (route) {
          const props = { ...route.params }
          props.id = +props.id
          return props
        },
        meta: { title: 'Edit Payment' }
      },

      { path: '/paymentsvendor', name: 'paymentsvendor', component: () => import('pages/PagePaymentsForVendor.vue'), props: true, meta: { title: 'Vendor Payments' } },
      { path: '/newpaymentvendor', name: 'newpaymentvendor', component: () => import('pages/PageNewOrEditPaymentForVendor.vue'), props: true, meta: { title: 'New Vendor Payment' } },
      { path: '/paymentvouchervendor', name: 'paymentvouchervendor', component: () => import('pages/PagePaymentVoucherForVendor.vue'), props: true, meta: { title: 'Vendor Payment Voucher' } },
      {
        path: '/payment/:id',
        name: 'editpaymentvendor',
        component: () => import('pages/PageNewOrEditPaymentForVendor.vue'),
        props (route) {
          const props = { ...route.params }
          props.id = +props.id
          return props
        },
        meta: { title: 'Edit Vendor Payment' }
      },

      { path: '/newsenderid', name: 'newsenderid', component: () => import('pages/PageNewSenderID.vue'), props: true, meta: { title: 'New Sender ID' } },
      { path: '/newpermits', name: 'newpermits', component: () => import('pages/PageNewPermits.vue'), props: true, meta: { title: 'Add Permits' } },
      { path: '/newpermit', name: 'newpermit', component: () => import('pages/PageNewOrEditPermit.vue'), props: true, meta: { title: 'Add Permit' } },
      { path: '/editpermit', name: 'editpermit', component: () => import('pages/PageNewOrEditPermit.vue'), props: true, meta: { title: 'Edit Permit' } },
      { path: '/tagging', name: 'tagging', component: () => import('pages/PageI3MSTagging.vue'), props: true, meta: { title: 'I3MS Tagging' } },
      { path: '/release', name: 'release', component: () => import('pages/PageI3MSRelease.vue'), props: true, meta: { title: 'Release Vehicle' } },
      { path: '/trips/:id', name: 'trips', component: () => import('pages/PageTrips.vue'), props: true, meta: { title: 'I3MS Transport Report' } },
      { path: '/tagreport', name: 'tagreport', component: () => import('pages/PageI3MSTagReport.vue'), props: true, meta: { title: 'I3MS Tagging Reports' } },
      { path: '/newowners', name: 'newowners', component: () => import('pages/PageNewOwners.vue'), props: true, meta: { title: 'Add/Update Truck Owners' } },
      { path: '/newowner', name: 'newowner', component: () => import('pages/PageNewOrEditOwner.vue'), props: true, meta: { title: 'New Truck Owner' } },
      { path: '/editowner', name: 'editowner', component: () => import('pages/PageNewOrEditOwner.vue'), props: true, meta: { title: 'Edit Truck Owner' } },
      { path: '/owners', name: 'owners', component: () => import('pages/PageOwners.vue'), props: true, meta: { title: 'Truck Owners' } },
      { path: '/invoices', name: 'invoices', component: () => import('pages/PageInvoices.vue'), props: true, meta: { title: 'Invoices' } },
      { path: '/newinvoice', name: 'newinvoice', component: () => import('pages/PageNewInvoice.vue'), props: true, meta: { title: 'New Invoice' } },
      { path: '/invoicepdf', name: 'invoicepdf', component: () => import('pages/PageInvoicePdf.vue'), props: true, meta: { title: 'Invoice PDF' } },
      { path: '/accounts', name: 'accounts', component: () => import('pages/PageAccounts.vue'), props: true, meta: { title: 'Accounts' } },
      { path: '/newaccount', name: 'newaccount', component: () => import('pages/PageNewOrEditAccount.vue'), props: true, meta: { title: 'New Account' } },
      { path: '/editaccount', name: 'editaccount', component: () => import('pages/PageNewOrEditAccount.vue'), props: true, meta: { title: 'Edit Account' } },
      { path: '/auth', name: 'auth', component: () => import('pages/PageAuth.vue') },
      { path: '/trucklists', name: 'trucklists', component: () => import('pages/PageTruckLists.vue'), props: true, meta: { title: 'Truck Lists' } },
      { path: '/newtrucklist', name: 'newtrucklist', component: () => import('pages/PageNewOrEditTruckList.vue'), props: true, meta: { title: 'New Truck List' } },
      {
        path: '/trucklist/:id',
        name: 'edittrucklist',
        component: () => import('pages/PageNewOrEditTruckList.vue'),
        props (route) {
          const props = { ...route.params }
          props.id = +props.id
          return props
        },
        meta: { title: 'Edit Truck List' }
      },
      { path: '/trucks', name: 'trucks', component: () => import('pages/PageTrucks.vue'), props: true, meta: { title: 'Trucks' } },
      { path: '/newtruck', name: 'newtruck', component: () => import('pages/PageNewOrEditTruck.vue'), props: true, meta: { title: 'New Truck' } },
      {
        path: '/truck/:id',
        name: 'edittruck',
        component: () => import('pages/PageNewOrEditTruck.vue'),
        props (route) {
          const props = { ...route.params }
          props.id = +props.id
          return props
        },
        meta: { title: 'Edit Truck' }
      },
      { path: '/sms', name: 'sms', component: () => import('pages/PageSMS.vue'), props: true, meta: { title: 'SMS' } },
      { path: '/dashboard', name: 'dashboard', component: () => import('pages/PageDashboard.vue'), props: true, meta: { title: 'Dashboard' } },
      { path: '/users', name: 'users', component: () => import('pages/PageUsers.vue'), props: true, meta: { title: 'Users' } },
      { path: '/vendors', name: 'vendors', component: () => import('pages/PageVendors.vue'), props: true, meta: { title: 'Vendors' } },
      { path: '/newvendor', name: 'newvendor', component: () => import('pages/PageNewOrEditVendor.vue'), props: true, meta: { title: 'New Vendor' } },
      { path: '/editvendor', name: 'editvendor', component: () => import('pages/PageNewOrEditVendor.vue'), props: true, meta: { title: 'Edit Vendor' } },
      { path: '/newvendors', name: 'newvendors', component: () => import('pages/PageNewVendors.vue'), props: true, meta: { title: 'Add/Update Vendors' } },
      { path: '/clients', name: 'clients', component: () => import('pages/PageClients.vue'), props: true, meta: { title: 'Clients' } },
      { path: '/newclient', name: 'newclient', component: () => import('pages/PageNewOrEditClient.vue'), props: true, meta: { title: 'New Client' } },
      { path: '/editclient', name: 'editclient', component: () => import('pages/PageNewOrEditClient.vue'), props: true, meta: { title: 'Edit Client' } },
      { path: '/newclients', name: 'newclients', component: () => import('pages/PageNewClients.vue'), props: true, meta: { title: 'Add/Update Clients' } },
      { path: '/orders', name: 'orders', component: () => import('pages/PageOrders.vue'), props: true, meta: { title: 'Orders' } },
      { path: '/neworder', name: 'neworder', component: () => import('pages/PageNewOrder.vue'), props: true, meta: { title: 'New Order' } },
      { path: '/order/:id', name: 'editorder', component: () => import('pages/PageNewOrder.vue'), props: true, meta: { title: 'Edit Order' } },
      { path: '/assigntruck/:id', name: 'assigntruck', component: () => import('pages/PageTruckAssign.vue'), props: true, meta: { title: 'Truck Assign' } },
      { path: '/normaltrips/:id', name: 'normaltrips', component: () => import('pages/PageNormalTrips.vue'), props: true, meta: { title: 'Trips' } }

    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
