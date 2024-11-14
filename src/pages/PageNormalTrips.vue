<template>
  <q-page padding="">
  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

      <q-select
        outlined
        v-model="order"
        use-input
        hide-selected
        fill-input
        option-label="order_number"
        input-debounce="0"
        :options="orders"
        @filter="filterOrders"
        label="Order No"
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
     <div class="q-pt-md q-pb-lg" v-if="trips.length">
        <div class="text-subtitle2">Excel Format</div>
        <img
        src="~assets/trip-update-excel.png"
        style="max-width:100%;">
      </div>
      <div style="max-width: 600px" class="row"  v-if="trips.length">
        <q-file
          class="col-5"
          outlined
          :rules="[val => !!val || 'Field is required']"
          v-model="path"
          accept=".xlsx, .xls"
          @input="onFileSelected"
          label="Update Trips (Excel)"
        />

      <div class="col"> </div>

      <div class="col-6 q-pt-sm">
          <q-btn class="col" label="Save" @click="updateTp" color="primary"/>
      </div>
      </div>

  </q-form>
  <trips-view :trips="trips"  :loading="loading" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex'

import {
  Loading,
  QSpinnerIos
} from 'quasar'

import XLSX from 'xlsx'
import _ from 'lodash'

import { queryString, insertString } from '../utils/gql'
import { getCurrentFinancialYear } from '../utils/util'

import Orders from '../mixins/orders'
import moment from 'moment'

export default {
  name: 'PageNormalTrips',

  props: {
    order: {
      type: Object,
      required: true
    }
  },

  created () {
    this.account = this.order.account
  },

  data () {
    return {
      loading: false,
      path: null,
      trips: [],
      account: null
    }
  },

  mixins: [
    Orders({
      skip () {
        return !this.account
      },

      returning: `
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
      `
    })
  ],

  apollo: {

    trips: {
      skip () {
        return !this.order
      },

      query: queryString('normal_trips', `
        extra
        discount
        id
        load_carrying
        lr_number
        penalty
        order_id
        trip_date
        invoice_number
        truck_id
        truck_number
        unloaded_quantity
        driver_phone_number
      `),

      update (data) {
        console.log(data)
        return data.normal_trips
      },

      fetchPolicy: 'network-only',

      variables () {
        return {
          where: {
            order_id: {
              _eq: this.order.id
            }
          }
        }
      }
    }
  },

  methods: {
    async  onFileSelected () {
      console.log('before loading excel')
      const workbook = XLSX.readFile(this.path.path)
      const sheet = workbook.SheetNames

      let tps = XLSX.utils.sheet_to_json(workbook.Sheets[sheet[0]], {
        range: 1,
        raw: true,
        defval: null,
        header: ['lr_number', 'end_date', 'unloaded_quantity', 'discount', 'penalty'] })

      console.log(tps)

      tps.forEach(tp => {
        tp.lr_number = '' + tp.lr_number
        tp.end_date = (_.isString(tp.end_date)) ? tp.end_date : moment(new Date((tp.end_date - (25567 + 2)) * 86400 * 1000)).format('YYYY-MM-DD')
        const t = this.trips.find(t => t.lr_number === tp.lr_number && getCurrentFinancialYear() === getCurrentFinancialYear(t.trip_date))
        if (t) {
          Object.assign(t, tp)
          t.dirty = true
          console.log('updating', t.lr_number)
        }
      })
    },
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

      const tps = this.trips.filter(t => t.dirty).map(t => _.omit(t, ['dirty', '__typename']))

      console.log(tps)

      try {
        const response = await this.$apollo.mutate({
          mutation: insertString('normal_trips', `
            affected_rows
          `, true),

          variables: {
            objects: tps,
            on_conflict: {
              constraint: 'normal_trips_pkey',
              update_columns: ['lr_number', 'end_date', 'unloaded_quantity', 'discount', 'penalty']
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

      Loading.hide()
    },

    onSubmit () {
      this.loading = true
    },

    onReset () {
      this.loading = false
      this.order = null
    }
  },

  components: {
    'trips-view': require('components/NormalTrips.vue').default
  },

  computed: {
    ...mapState('store', ['userDetails'])
  }
}
</script>
