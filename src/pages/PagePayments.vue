<template>
  <data-table
    title="Payment Vouchers"
    collection="payment_vouchers"
    :columns="columns"
    newlabel="New Payment Voucher"
    newrow="/newpayment"
    editrow="editpayment"
    editprop="payment"
    rowkey=""
    :searchField="false"
    :query="query"
    :where="where"
  >
  </data-table>
</template>

<script>

import { mapState } from 'vuex'
import { listQuery, paymentFields } from '../utils/gql'
import moment from 'moment'

function paymentStatus (voucher) {
  switch (voucher.status) {
    case 0:
      return 'New'
    case 1:
      return 'Verified'
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
    label: 'Voucher Id',
    field: 'id',
    sortable: true
  },
  {
    name: 'date',
    align: 'left',
    label: 'Voucher Date',
    field: 'created_at',
    sortable: true,
    format: v => moment(v).format('DD/MM/YYYY')
  },
  {
    name: 'ownerName',
    align: 'left',
    label: 'Owner Name',
    field: p => p.owner.name
  },
  {
    name: 'phoneNumber',
    align: 'left',
    label: 'Phone Number',
    field: p => p.owner.phone_number
  },
  {
    name: 'quantity',
    align: 'left',
    label: 'Quantity',
    field: p => p.trips_aggregate.aggregate.sum.unloaded_quantity || p.normal_trips_aggregate.aggregate.sum.unloaded_quantity
  },
  {
    name: 'numTrips',
    align: 'left',
    label: 'Number of Trips',
    field: p => p.trips_aggregate.aggregate.count || p.normal_trips_aggregate.aggregate.count
  },
  {
    name: 'status',
    align: 'left',
    label: 'Status',
    field: p => paymentStatus(p)
  },
  {
    name: 'actions',
    actions: [
      {
        icon: 'subject',
        to (props) {
          return { name: 'paymentvoucher', params: { payment: props.row } }
        },
        tooltip: 'View Details'
      },
      {
        icon: 'edit',
        to (props) {
          return { name: 'editpayment',
            params: {
              id: props.row.id,
              payment: props.row } }
        },
        tooltip: 'Edit'
      },
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
      query: listQuery('payment_vouchers', paymentFields)
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
