<template>
  <div class="q-pa-md">
    <div class="q-mt-xl q-mr-md q-pt-md fixed-right">
      <q-btn to="/newtrucklist" color="primary" icon-right="add_circle_outline" label="New Truck List" />
    </div>
    <div class="q-pt-xl">
      <q-table
      :data="truck_lists"
      :columns="columns"
      :loading="$apollo.queries.truck_lists.loading"
        :pagination.sync="pagination"
        binary-state-sort
        @request="onRequest"
        title="Truck Lists"
        row-key="name">
        <template v-slot:body-cell-actions="props">
            <q-td key="actions" align="center" auto-width no-hover>
              <div class="row">
                <q-btn class="col" flat size="sm" icon="edit" :to="{name: 'edittrucklist', params: {id: props.row.id, trucklist: props.row}}">
                  <q-tooltip content-class="bg-primary">Edit</q-tooltip>
                </q-btn>
                <q-btn class="col q-pl-md q-pr-sm" flat size="sm" icon="delete" @click.native="confirmAndDeleteDocument('truck_lists', 'truck_lists', props.row.id)">
                  <q-tooltip content-class="bg-primary">Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import confirmDelete from '../mixins/confirm_delete'
import { trucklistsQuery } from '../utils/gql'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'numtrucks',
    align: 'left',
    label: 'Number Of Trucks',
    field: t => t.trucks_aggregate.aggregate.count
  },
  { name: 'actions',
    align: 'center',
    field: 'id'
  }
]

export default {
  name: 'TruckList',

  data () {
    return {
      columns,
      filter: '',
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 50,
        rowsNumber: 1
      }
    }
  },

  mixins: [
    confirmDelete
  ],

  apollo: {
    truck_lists: {
      query: trucklistsQuery,

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data.truck_lists_aggregate.aggregate.count
        console.log('We got some result!', data)
      },

      variables () {
        const obj = {
          order_by: {
            [this.pagination.sortBy]: this.pagination.descending ? 'desc_nulls_last' : 'asc_nulls_last'
          },
          where: {
            company_id: {
              _eq: this.userDetails.company.id
            }
          }
        }

        if (this.pagination.rowsPerPage) {
          obj.limit = this.pagination.rowsPerPage
          obj.offset = (this.pagination.page - 1) * this.pagination.rowsPerPage
        }

        if (this.filter) {
          obj.where.name = {
            _ilike: `%${this.filter}%`
          }
        }

        return obj
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {
    onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
    }
  }
}
</script>
