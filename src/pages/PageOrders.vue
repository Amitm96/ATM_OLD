<template>
  <div class="q-pa-md">
     <div class="q-mt-xl q-mr-md q-pt-md fixed-right">
      <q-btn class="q-mr-md" to="/neworder" color="primary" icon-right="add_circle_outline" label="Add New" />
    </div>
    <div class="q-pt-xl">
      <q-table
      dense
      :data="orders"
      :loading="$apollo.queries.orders.loading"
      :columns="columns"
      :pagination.sync="pagination"
      title="Orders"
      binary-state-sort
      @request="onRequest"
      :visible-columns="visibleColumns"
      @row-click="(evt, row) => $router.push({name: 'normaltrips', params: {id: row.id, permitProp: row}})"
      row-key="order_number">

      <template v-slot:top-right>
        <div class="q-pr-md">
        <q-input
          class="q-pl-md q-pr-md searchBar"
          style="width: 200px"
          clearable
          clear-icon="clear"
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search...">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        </div>
         <q-space />

        <q-select
          v-model="visibleColumns"
          multiple
          outlined
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          options-cover
          style="min-width: 150px"
        />
      </template>

        <template v-slot:body-cell-actions="props">
            <q-td key="actions" align="center" auto-width no-hover>
              <div>
                   <q-btn flat size="sm" icon="assignment" :to="{name: 'assigntruck', params: {id: props.row.id, order: props.row}}"  >
                      <q-tooltip content-class="bg-primary">Assign Trucks</q-tooltip>
                </q-btn>
                <q-btn flat size="sm" icon="picture_as_pdf" :to="{name: 'normaltrips', params: {id: props.row.id, order: props.row}}" >
                    <q-tooltip content-class="bg-primary">Transport Report</q-tooltip>
                </q-btn>

                <q-btn flat size="sm" icon="edit" :to="{name: 'editorder', params: {id: props.row.id, order: props.row}}"  >
                      <q-tooltip content-class="bg-primary">Edit Order</q-tooltip>
                </q-btn>

                <q-btn flat size="sm" icon="delete" @click.native="confirmAndDeleteDocument('orders', 'orders', props.row.id)" >
                    <q-tooltip content-class="bg-primary">Delete Order</q-tooltip>
                </q-btn>
              </div>
            </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>

import moment from 'moment'
import { mapState } from 'vuex'

import { listQuery } from '../utils/gql'

import confirmDelete from '../mixins/confirm_delete'

const columns = [
  {
    name: 'order_number',
    align: 'left',
    label: 'Order',
    field: 'order_number',
    sortable: true
  },
  {
    name: 'start_date',
    align: 'left',
    label: 'Requested On',
    field: 'start_date',
    format: val => moment(val).local().format('DD MMM YYYY'),
    sortable: true
  },
  { name: 'client',
    align: 'left',
    label: 'Client',
    field: v => v.client ? v.client.name : ''
  },
  {
    name: 'quantity',
    align: 'left',
    label: 'Quantity',
    field: 'quantity'
  },
  {
    name: 'endDate',
    align: 'left',
    label: 'End Date',
    field: 'end_date',
    format: val => moment(val).format('DD MMM YYYY')
  },
  {
    name: 'trips',
    align: 'left',
    label: 'Trips',
    field: f => f.trips.aggregate.count,
    format: val => val || 0
  },

  {
    name: 'completed_trips',
    align: 'left',
    label: 'Completed Trips',
    field: f => f.completed_trips.aggregate.count,
    format: val => val || 0
  },
  {
    name: 'loaded',
    align: 'left',
    label: 'Loaded',
    field: f => f.trips.aggregate.sum.load_carrying,
    format: val => (val || 0).toFixed(2)
  },
  {
    name: 'unloaded',
    align: 'left',
    label: 'Unloaded',
    field: f => f.trips.aggregate.sum.unloaded_quantity,
    format: val => val || 0
  },
  { name: 'actions',
    align: 'center',
    label: 'Actions',
    field: 'id'
  }
]

export default {

  name: 'OrderList',

  created () {
    this.visibleColumns = this.columns.map(c => c.name).filter(c => !['loaded', 'unloaded', 'endDate'].includes(c))
  },

  mixins: [
    confirmDelete
  ],

  data () {
    return {
      columns,
      visibleColumns: [],
      filter: '',
      orders: [],
      selected: [],
      pagination: {
        sortBy: 'start_date',
        descending: true,
        page: 1,
        rowsPerPage: 50,
        rowsNumber: 1
      }
    }
  },

  apollo: {
    orders: {
      query () {
        return listQuery('orders', `
          id
          order_number
          start_date
          end_date
          source_destination
          quantity
          company_id
          account_id
          client_rate_per_tonne
          client_shortage_per_tonne
          client_shortage_percentage
          owner_rate_per_tonne
          owner_shortage_percentage
          owner_shortage_per_tonne

          account {
            id
            name
          }

          client {
            name
          }

          trips: normal_trips_aggregate {
            aggregate {
              count(columns: id)
              sum {
                load_carrying
                unloaded_quantity
              }
            }
          }

          completed_trips: normal_trips_aggregate {
            aggregate {
              count(columns: unloaded_quantity)
            }
          }
        `)
      },

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data.orders_aggregate.aggregate.count
        console.log('We got some result!', data, this.pagination)
      },

      variables () {
        const obj = {
          where: {
            company_id: {
              _eq: this.userDetails.company_id
            }
          }
        }

        if (this.pagination.sortBy) {
          obj.order_by = {
            [this.pagination.sortBy]: this.pagination.descending ? 'desc_nulls_last' : 'asc_nulls_last'
          }
        }

        if (this.pagination.rowsPerPage) {
          obj.limit = this.pagination.rowsPerPage
          obj.offset = (this.pagination.page - 1) * this.pagination.rowsPerPage
        }

        if (this.filter) {
          obj.where.order_number = {
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

<style lang="stylus">
.searchBar {
  background-color #e9ebed;
  border-radius 4px
}
</style>
