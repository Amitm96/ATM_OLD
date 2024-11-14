<template>
  <data-table
    title="Invoices"
    collection="invoices"
    :columns="columns"
    newlabel="New Invoice"
    newrow="/newinvoice"
    editrow="editinvoice"
    editprop="invoice"
    rowkey=""
    :searchField="false"
    :query="query"
    :where="where"
  >
  </data-table>
</template>

<script>

import { mapState } from 'vuex'
import { listQuery } from '../utils/gql'
import moment from 'moment'

function paymentStatus (voucher) {
  switch (voucher.status) {
    case 0:
      return 'New'
    case 1:
      return 'Submitted'
    case 2:
      return 'Paid'
    case 3:
      return 'Rejected'
  }
}

const columns = [
  {
    name: 'id',
    align: 'left',
    label: 'SL No',
    field: 'id',
    sortable: true
  },
  {
    name: 'invoice_number',
    align: 'left',
    label: 'Invoice No',
    field: 'invoice_number',
    sortable: true
  },
  {
    name: 'order_number',
    align: 'left',
    label: 'Order No',
    field: 'order_number',
    sortable: true
  },
  {
    name: 'date',
    align: 'left',
    label: 'Invoice Date',
    field: 'created_at',
    sortable: true,
    format: v => moment(v).format('DD/MM/YYYY')
  },
  {
    name: 'clientName',
    align: 'left',
    label: 'Client Name',
    field: p => p.client.name
  },
  {
    name: 'phoneNumber',
    align: 'left',
    label: 'Phone Number',
    field: p => p.client.phone_number
  },
  {
    name: 'quantity',
    align: 'left',
    label: 'Quantity',
    field: 'quantity'
    // field: p => p.trips_aggregate.aggregate.sum.unloaded_quantity || p.normal_trips_aggregate.aggregate.sum.unloaded_quantity
  },
  // {
  //   name: 'numTrips',
  //   align: 'left',
  //   label: 'Number of Trips',
  //   field: p => p.trips_aggregate.aggregate.count || p.normal_trips_aggregate.aggregate.count
  // },
  {
    name: 'status',
    align: 'left',
    label: 'Status',
    field: p => paymentStatus(p)
  },
  {
    name: 'actions',
    actions: [
      // {
      //   icon: 'subject',
      //   to (props) {
      //     return { name: 'invoicepdf', params: { invoice: props.row } }
      //   },
      //   tooltip: 'View Details'
      // },
      // {
      //   icon: 'edit',
      //   to (props) {
      //     return { name: 'editinvoice',
      //       params: {
      //         id: props.row.id,
      //         invoice: props.row } }
      //   },
      //   tooltip: 'Edit'
      // },
      {
        icon: 'delete',
        tooltip: 'Delete',
        disable (props) {
          return props.row.status === 2
        }
      }
    ],

    align: 'center',
    field: 'id'
  }
]

export default {
  name: 'PaymentsList',

  data () {
    return {
      columns,
      query: listQuery('invoices', `
        id
        created_at
        status
        mode
        transaction_ref
        bank_name
        payment_date
        invoice_number
        order_number
        igst
        cgst
        sgst
        quantity

        account {
          id
          name
          address1
          address2
        }

        client {
          id
          name
          phone_number
          gstn
          address1
          address2
          state
        }

        trips {
          extra
          id
          advance
          discount
          fuel
          load_carrying
          lr_number
          penalty
          permit_id
          permit {
            id
            permit_number
            source_destination
            owner_rate_per_tonne
            owner_shortage_per_tonne
            owner_shortage_percentage
          }
          tp_date
          tp_number
          tp_url
          truck_id
          truck_number
          unloaded_quantity
        }

        trips_aggregate {
          aggregate {
            count
            sum {
              load_carrying
              unloaded_quantity
            }
          }
        }

        normal_trips {
          extra
          id
          discount
          load_carrying
          lr_number
          penalty
          order_id
          order {
            id
            order_number
            source_destination
            owner_rate_per_tonne
            owner_shortage_per_tonne
            owner_shortage_percentage
          }
          trip_date
          invoice_number
          truck_id
          truck_number
          unloaded_quantity
        }

        normal_trips_aggregate {
          aggregate {
            count
            sum {
              load_carrying
              unloaded_quantity
            }
          }
        }

        account {
          id
          name
        }
      `)
    }
  },

  computed: {
    ...mapState('store', ['userDetails']),
    where () {
      return {
        company_id: {
          _eq: this.userDetails.company_id
        }
      }
    }
  },

  components: {
    'data-table': require('components/DataTable.vue').default
  }
}
</script>
