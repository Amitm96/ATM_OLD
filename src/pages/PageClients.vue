<template>
  <data-table
    title="Clients"
    collection="clients"
    :columns="columns"
    newlabel="Add Client"
    newrow="/newclient"
    bulklabel="Add/Update Clients"
    bulkrow="/newclients"
    editrow="editclient"
    editprop="client"
    rowkey="name"
    :searchField="searchFn"
    :query="query"
    :where="where"
  >
  </data-table>
</template>

<script>
import { mapState } from 'vuex'

import { listQuery } from '../utils/gql'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Client Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'gstn',
    align: 'left',
    label: 'GSTN/PAN',
    field: 'gstn'
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
  name: 'ClientList',

  data () {
    return {
      columns,
      query: listQuery('clients', `
       id
        name
        phone_number
        city
        gstn
        address1
        address2
        state
        pincode
      `)
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
            gstn: {
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
