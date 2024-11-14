<template>
  <data-table
    title="Accounts"
    collection="accounts"
    :columns="columns"
    newlabel="New Account"
    newrow="/newaccount"
    editrow="editaccount"
    editprop="account"
    rowkey="name"
    searchField="name"
    :query="query"
    :where="where" />
</template>

<script>
import { mapState } from 'vuex'
import { listQuery } from '../utils/gql'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'gstn',
    align: 'left',
    label: 'GST Number',
    field: 'gstn',
    sortable: true
  },
  {
    name: 'username',
    align: 'left',
    label: 'I3MS User',
    field: 'i3ms_username'
  },
  { name: 'actions',
    align: 'center',
    label: 'Actions',
    field: 'id'
  }
]

export default {

  data () {
    return {
      columns,
      query: listQuery('accounts', `
        address1
        address2
        cgst
        city
        i3ms_password
        i3ms_username
        id
        igst
        name
        pincode
        sgst
        state
        terms
        gstn
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
