<template>
  <div class="q-pa-md">
    <div class="q-mt-xl q-mr-md q-pt-md fixed-right">

      <q-btn
        class="q-mr-md"
        @click="checkNewRequest"
        color="primary"
        icon-right="replay_10"
        label="Check New Request"
      />

      <q-btn
        class="q-mr-md"
        v-if="permits.length"
        @click="refreshSelectedPermits"
        color="primary"
        icon-right="replay"
        label="Refresh Selected"
      />
      <!-- <q-btn class="q-mr-md" v-if="permits.length" @click="refreshPermits" color="primary" icon-right="refresh" label="Refresh All" /> -->
      <q-btn
        class="q-mr-md"
        to="/newpermits"
        color="primary"
        icon-right="add_circle_outline"
        label="Fetch New"
      />
      <q-btn
        class="q-mr-md"
        to="/newpermit"
        color="primary"
        icon-right="add_circle_outline"
        label="Add New"
      />
      <!--q-btn to="/newpermit" color="primary" icon-right="add_circle_outline" label="Add New Permit" /-->
    </div>
    <div class="q-pt-xl">
      <q-table
        dense
        :data="permits"
        :loading="$apollo.queries.permits.loading"
        :columns="columns"
        :pagination.sync="pagination"
        title="Permits"
        binary-state-sort
        selection="multiple"
        :selected.sync="selected"
        @request="onRequest"
        :visible-columns="visibleColumns"
        @row-click="(evt, row) => $router.push({name: 'trips', params: {id: row.id, permitProp: row}})"
        row-key="permit_number"
      >
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
              placeholder="Search..."
            >
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
              <q-btn
                flat
                size="sm"
                icon="assignment"
                :to="{name: 'tagging', params: {permitProp: props.row}}"
              >
                <q-tooltip content-class="bg-primary">Start Tagging</q-tooltip>
              </q-btn>

              <q-btn
                flat
                size="sm"
                icon="remove_circle"
                :to="{name: 'release', params: {permitProp: props.row}}"
              >
                <q-tooltip content-class="bg-primary">Release Vehicles</q-tooltip>
              </q-btn>

              <q-btn
                flat
                size="sm"
                :loading="props.row.loading"
                icon="replay"
                @click="refreshPermit(props.row)"
              >
                <q-tooltip content-class="bg-primary">Refresh the Permit from i3ms</q-tooltip>
              </q-btn>

              <q-btn
                flat
                size="sm"
                icon="picture_as_pdf"
                :to="{name: 'trips', params: {id: props.row.id, permitProp: props.row}}"
              >
                <q-tooltip content-class="bg-primary">Transport Report</q-tooltip>
              </q-btn>

              <q-btn
                flat
                size="sm"
                icon="dashboard"
                :to="{name: 'tagreport', params: {permitProp: props.row}}"
              >
                <q-tooltip content-class="bg-primary">Tagging Reports</q-tooltip>
              </q-btn>

              <q-btn
                flat
                size="sm"
                icon="edit"
                :to="{name: 'editpermit', params: {permit: props.row}}"
              >
                <q-tooltip content-class="bg-primary">Edit Permit</q-tooltip>
              </q-btn>

              <q-btn
                flat
                size="sm"
                icon="delete"
                @click.native="confirmAndDeleteDocument('permits', 'permits', props.row.id)"
              >
                <q-tooltip content-class="bg-primary">Delete Permit</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import moment from 'moment'
import { mapState } from 'vuex'

import { Loading, QSpinnerIos } from 'quasar'

import { listQuery } from '../utils/gql'
import savePermit from '../mixins/save-permit'
import confirmDelete from '../mixins/confirm_delete'

const columns = [
  {
    name: 'permit_number',
    align: 'left',
    label: 'Permit',
    field: 'permit_number',
    sortable: true
  },
  {
    name: 'start_date',
    align: 'left',
    label: 'Requested On',
    field: 'start_date',
    format: val =>
      moment(val)
        .local()
        .format('DD MMM YYYY'),
    sortable: true
  },
  { name: 'source', align: 'left', label: 'Source', field: 'source' },
  {
    name: 'quantity',
    align: 'left',
    label: 'Quantity',
    field: 'quantity'
  },
  {
    name: 'endDate',
    align: 'left',
    label: 'Validity',
    field: 'end_date',
    format: val => moment(val).format('DD MMM YYYY')
  },
  {
    name: 'trips',
    align: 'left',
    label: 'Trips',
    field: f => (f.delivered ? f.delivered.aggregate.count : 0),
    format: val => val || 0
  },
  {
    name: 'delivered',
    align: 'left',
    label: 'Delivered',
    field: f => (f.delivered ? f.delivered.aggregate.sum.load_carrying : 0),
    format: val => (val || 0).toFixed(2)
  },
  {
    name: 'tagged',
    align: 'left',
    label: 'Tagged',
    field: f => Object.keys(f.tagged).length,
    format: val => val || 0
  },
  { name: 'actions', align: 'center', label: 'Actions', field: 'id' }
]

export default {
  name: 'PermitList',

  mixins: [savePermit, confirmDelete],

  created () {
    const self = this
    this.visibleColumns = this.columns.map(c => c.name)

    ipcRenderer.removeAllListeners('permits-details-results')
    ipcRenderer.on('permits-details-results', function (event, response) {
      Loading.hide()
    })

    ipcRenderer.removeAllListeners('permit-details-results')
    ipcRenderer.on('permit-details-results', async function (event, response) {
      console.log(response)
      delete response.loading

      const item = self.permits.find(
        v => v.permit_number === response.permit_number
      )

      response.taggedSuccess = response.taggedSuccess || []
      if (item) {
        item.loading = false
        item.tagged = response.taggedSuccess.reduce((p, t) => {
          p[t] = ''
          return p
        }, {})

        item.delivered.aggregate.sum.load_carrying = response.trips.reduce(
          (p, v) => p + v.load_carrying,
          0
        )
        item.delivered.aggregate.count = response.trips.length
      }

      await self.savePermit(response)
      self.$apollo.queries.permits.refresh()
      console.log(`hiding start`)
      Loading.hide()
      console.log(`hiding end`)
    })
  },

  data () {
    return {
      columns,
      visibleColumns: [],
      filter: '',
      permits: [],
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
    permits: {
      query () {
        return listQuery(
          'permits',
          `
          id
          permit_number
          start_date
          end_date
          tag_url
          tagged
          vehicle_details
          source
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
          client {
            id
            name
          }
          credentials: account {
            id
            name
            username: i3ms_username
            password: i3ms_password
          }
          delivered: trips_aggregate {
            aggregate {
              sum {
                load_carrying
              }
              count
            }
          }
        `
        )
      },

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error("We've got an error!", error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data.permits_aggregate.aggregate.count
        console.log('We got some result!', data, this.pagination)
        ipcRenderer.send('permit-report', {
          ...this.permits,
          credentials: {
            username: this.userDetails.company.accounts[0].i3ms_username,
            password: this.userDetails.company.accounts[0].i3ms_password
          }
        })
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
            [this.pagination.sortBy]: this.pagination.descending
              ? 'desc_nulls_last'
              : 'asc_nulls_last'
          }
        }

        if (this.pagination.rowsPerPage) {
          obj.limit = this.pagination.rowsPerPage
          obj.offset = (this.pagination.page - 1) * this.pagination.rowsPerPage
        }

        if (this.filter) {
          obj.where.permit_number = {
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
    refreshPermits () {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })
      ipcRenderer.send('permits-details', {
        permits: this.permits,
        refresh: true
      })
    },

    refreshSelectedPermits () {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })
      ipcRenderer.send('permits-details', {
        permits: this.selected,
        refresh: true
      })
      this.selected = []
    },

    checkNewRequest () {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      ipcRenderer.send('check-new-request', {
        permits: this.selected,
        account_id: this.userDetails.company.accounts[0].id,
        company_id: this.userDetails.company.id,
        refresh: true
      })
      this.selected = []
    },

    refreshPermit (permit) {
      permit.loading = true
      console.log('refreshPermit', JSON.stringify(permit))
      this.$nextTick().then(() => {
        this.$forceUpdate()
      })
      ipcRenderer.send('permit-details', permit)
    },

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
  background-color: #e9ebed;
  border-radius: 4px;
}

.q-if-label {
  text-align: right;
  color: orangeRed;
}

input[placeholder] {
  height: em;
  color: purple;
}
</style>
