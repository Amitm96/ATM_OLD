<template>
  <data-table
    title="Vendors"
    collection="vendors"
    :columns="columns"
    newlabel="Add Vendor"
    newrow="/newvendor"
    bulklabel="Add/Update Vendors"
    bulkrow="/newvendors"
    editrow="editvendor"
    editprop="vendor"
    rowkey="name"
    :searchField="searchFn"
    :query="query"
    :where="where"
  >
  </data-table>
</template>

<script>
import { mapState } from 'vuex'

import { vendorsQuery } from '../utils/gql'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Vendor Name',
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
  name: 'VendorList',

  data () {
    return {
      columns,
      query: vendorsQuery
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

  methods: {
    searchFn (filter) {
      return {
        _or: [
          {
            name: {
              _ilike: `%${filter}%`
            }
          },
          {
            gstn_pan: {
              _ilike: `%${filter}%`
            }
          },
          {
            phone_number: {
              _ilike: `%${filter}%`
            }
          }
        ]
      }
    }
  },

  components: {
    'data-table': require('components/DataTable.vue').default
  }
}
</script>
