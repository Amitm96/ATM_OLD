<template>
  <q-page padding="">
  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

    <div style="max-width: 600px" class="row justify-center">
      <q-select
        class="col-5"
        outlined
        v-model="permit"
        use-input
        hide-selected
        fill-input
        option-label="permit_number"
        input-debounce="0"
        :options="permits"
        @filter="filterPermits"
        label="Permit No"
        :rules="[val => !!val || 'Field is required']"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>

      </q-select>

      <div class="col"> </div>

      <div class="col-6 q-pt-sm">
          <q-btn class="col" label="Refresh From I3MS" @click="onSubmit" color="primary"/>
      </div>
    </div>
     <div class="q-pt-md q-pb-lg" v-if="trips.length">
        <div class="text-subtitle2">Excel Format</div>
        <img
        src="~assets/tp-update-excel.png"
        style="max-width:100%;">
      </div>
      <div style="max-width: 600px" class="row"  v-if="trips.length">
        <q-file
          class="col-5"
          outlined
          :rules="[val => !!val || 'Field is required']"
          v-model="path"
          accept=".xlsx, .xls"
          label="Update TP (Excel)"
        />

      <div class="col"> </div>

      <div class="col-6 q-pt-sm">
          <q-btn class="col" label="Submit" @click="updateTp" color="primary"/>
      </div>
      </div>
  </q-form>
  <trips-view :trips="trips"  :loading="loading" />
  </q-page>
</template>

<script>

import { ipcRenderer } from 'electron'

import {
  Loading,
  QSpinnerIos
} from 'quasar'

import XLSX from 'xlsx'
import _ from 'lodash'
import moment from 'moment'

import Permits from '../mixins/permits'

import { queryString, insertString } from '../utils/gql'

export default {
  name: 'PageTransportReport',

  props: {
    permitProp: {
      type: Object,
      required: true
    }
  },

  mixins: [
    Permits({
      skip () {
        return !this.account
      },
      returning: `
        id
        permit_number
        tagged
        account_id
        credentials: account {
          id
          name
          username: i3ms_username
          password: i3ms_password
        }
    `
    })
  ],
  async created () {
    if (this.permitProp) {
      this.permit = this.permitProp
      this.account = this.permit.credentials
    }

    ipcRenderer.removeAllListeners('permit-report-results')
    ipcRenderer.on('permit-report-results', (event, result) => {
      console.log('received from main process', result)
      this.initial = false
      this.loading = false
      this.trips = result.trucks
    })
  },

  data () {
    return {
      loading: false,
      path: null,
      trips: [],
      account: null
    }
  },

  apollo: {
    trips: {
      skip () {
        return !this.permit
      },

      query: queryString('trips', `
        extra
        advance
        discount
        fuel
        id
        load_carrying
        lr_number
        penalty
        permit_id
        tp_date
        tp_number
        tp_url
        truck_id
        truck_number
        unloaded_quantity
      `),

      fetchPolicy: 'network-only',

      variables () {
        return {
          where: {
            permit_id: {
              _eq: this.permit.id
            }
          }
        }
      }
    }
  },

  methods: {
    async  updateTp () {
      if (!this.path) {
        return this.$q.notify({
          message: 'Excel file is required',
          color: 'negative',
          icon: 'warning'
        })
      }

      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      console.log('before loading excel')
      const workbook = XLSX.readFile(this.path.path)
      const sheet = workbook.SheetNames

      let tps = XLSX.utils.sheet_to_json(workbook.Sheets[sheet[0]], {
        range: 1,
        raw: true,
        defval: null,
        header: ['tp_number', 'lr_number', 'end_date', 'unloaded_quantity', 'advance', 'fuel', 'discount', 'penalty'] })

      console.log(tps)

      tps.forEach(tp => {
        tp.lr_number = '' + tp.lr_number
        tp.end_date = (_.isString(tp.end_date)) ? tp.end_date : moment(new Date((tp.end_date - (25567 + 2)) * 86400 * 1000)).format('YYYY-MM-DD')

        const t = this.trips.find(t => t.tp_number === tp.tp_number)
        if (t) {
          Object.assign(tp, _.omit(t, ['lr_number', 'end_date', 'unloaded_quantity', 'advance', 'fuel', 'discount', 'penalty', '__typename']))
        }
      })

      tps = tps.filter(t => t.id)

      try {
        const response = await this.$apollo.mutate({
          mutation: insertString('trips', `
            affected_rows
          `, true),

          variables: {
            objects: tps,
            on_conflict: {
              constraint: 'trips_pkey',
              update_columns: ['tp_number', 'lr_number', 'end_date', 'unloaded_quantity', 'advance', 'fuel', 'discount', 'penalty']
            }
          }
        })

        console.log(response)

        this.$q.notify({
          message: 'Saved successfully',
          color: 'positive',
          icon: 'info'
        })
      } catch (ex) {
        console.error(ex)
        this.$q.notify({
          message: 'Failed to save',
          color: 'negative',
          icon: 'warning'
        })
      }

      // await this.loadFromBackend(this.permit)
      await this.$apollo.queries.trips.refetch()
      Loading.hide()
    },

    onSubmit () {
      const account = this.userDetails.company.accounts.find(a => a.id === this.permit.account_id)

      ipcRenderer.send('permit-report', {
        ...this.permit,
        credentials: {
          username: account.i3ms_username,
          password: account.i3ms_password
        }
      })
      this.loading = true
    },

    onReset () {
      this.loading = false
      this.permit = null
    }
  },

  components: {
    'trips-view': require('components/Trips.vue').default
  }
}
</script>
