<template>
  <data-table
    title="Truck Owners"
    collection="owners"
    :columns="columns"
    newlabel="Add Owner"
    newrow="/newowner"
    bulklabel="Add/Update Owners"
    bulkrow="/newowners"
    editrow="editowner"
    editprop="owner"
    rowkey="name"
    :query="query"
    :where="where"
  >
  </data-table>
</template>

<script>
import { mapState } from 'vuex'

import { ownersQuery } from '../utils/gql'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Owner Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'gstn',
    align: 'left',
    label: 'GSTN/PAN',
    field: 'gstn_pan'
  },
  {
    name: 'phoneNumber',
    align: 'left',
    label: 'Phone Number',
    field: 'phone_number'
  },
  {
    name: 'actions',
    align: 'center',
    field: 'actions',
    no_delete: true
  }
]

export default {
  name: 'OwnerList',

  data () {
    return {
      columns,
      query: ownersQuery
    }
  },

  computed: {
    ...mapState('store', ['userDetails']),
    where () {
      return {
        companies_bridge: {
          company_id: {
            _eq: this.userDetails.company_id
          }
        }
      }
    }
  },

  components: {
    'data-table': require('components/DataTable.vue').default
  }
}
</script>
