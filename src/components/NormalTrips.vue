<template>
  <div>
    <q-table
      title="Trips"
      :loading="loading"
      :pagination.sync="tableData.pagination"
      :data="trips"
      :columns="tableData.columns"
      row-key="invoice_number"
      :sort-method="customSort"
      binary-state-sort
      :selected-rows-label="getSelectedString"
      :selection="selection"
      :selected.sync="selected"
      :visible-columns="visibleColumns"
      filter="filter"
      :filter-method="filterInput">
      <template v-slot:top-right>
        <div class="row items-center">
           <div class="col" v-if="trips.length">
            <p class="text-bold">Quantity: {{ totalQuantity.toFixed(2) }} MT</p>
          </div>
          <div class="col" v-if="toShowAmount">
              <p class="text-bold">Amount: {{ $n(totalAmount, 'currency') }}</p>
          </div>
          <div class="col">
            <q-input
          clearable
           clear-icon="clear"
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>

        </q-input>

          </div>

          <div class="col">

          <q-select
            v-model="visibleColumns"
            multiple
            outlined
            dense
            options-dense
            :display-value="$q.lang.table.columns"
            emit-value
            map-options
            :options="tableData.columns"
            option-value="name"
            options-cover
            style="min-width: 150px"
        />
          </div>
        </div>
      </template>

        <template v-if="!disable" v-slot:body-cell-endDate="props">
          <q-td key="end_date" :props="props">
            {{ formatDate(props.row.end_date) }}
            <q-popup-edit @save="updateEndDate(props.row)" v-model="props.row.end_date">
              <q-input type="date" v-model="props.row.end_date" dense autofocus />
            </q-popup-edit>
          </q-td>
        </template>

        <template v-if="!disable" v-slot:body-cell-lrNumber="props">
          <q-td key="lrNumber" :props="props">
            {{ props.row.lr_number }}
            <q-popup-edit @save="updatelrNumber(props.row)" v-model="props.row.lr_number">
              <q-input type="number" v-model="props.row.lr_number" dense autofocus />
            </q-popup-edit>
          </q-td>
        </template>

         <template v-if="!disable" v-slot:body-cell-unloadQty="props">
          <q-td key="unloadQty" :props="props">
            {{ props.row.unloaded_quantity || 0 }}
            <q-popup-edit @save="updateUnloadedQty(props.row)" v-model.number="props.row.unloaded_quantity">
              <q-input type="number" v-model.number="props.row.unloaded_quantity" dense autofocus />
            </q-popup-edit>
          </q-td>
        </template>

         <template v-if="!disable" v-slot:body-cell-deduction="props">
          <q-td key="deduction" :props="props" @click="editTP(props.row)">
            {{ $n(expenses(props.row), 'currency') }}
          </q-td>
        </template>

         <template v-if="!disable"  v-slot:body-cell-advance="props">
          <q-td key="advance" :props="props" @click="editTPAdvance(props.row)">
            {{ $n(totalAdvance(props.row), 'currency') }}
          </q-td>
        </template>

         <template v-if="!disable" v-slot:body-cell-fuel="props">
            <q-td key="fuel" :props="props" @click="editTPFuel(props.row)">
            {{ $n(totalFuel(props.row), 'currency') }}
          </q-td>
        </template>

    </q-table>

    <q-dialog v-model="showDialog" persistent>
      <q-card>
        <!-- <q-card-section>

          <h6>TP Details</h6>

        </q-card-section> -->
        <q-card-section>
          <p class="text-h6">TP Expenses</p>
          <q-input
              outlined
              type="number"
              prefix="₹"
              v-model.number="editingTp.discount"
              label="Discount">
          </q-input>
        </q-card-section>

        <q-card-section>
          <q-input
              outlined
              type="number"
              prefix="₹"
              v-model.number="editingTp.penalty"
              label="Others">
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup  />
          <q-btn flat label="Save" color="primary" v-close-popup @click="updateExpenses"  />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAdvanceDialog" persistent>

      <q-card>
         <q-table
          title="Advance"
          :data="advanceData"
          :columns="advanceColumns"
          row-key="name"
        />
        <q-card-section>
          <p class="text-h6">New Advance</p>
          <q-input
              outlined
              type="number"
              v-model.number="newAdvance.amount"
              label="Amount">
          </q-input>
        </q-card-section>
         <q-card-section>
           <q-input outlined v-model="newAdvance.date" mask="##/##/####" label="Date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date mask="DD/MM/YYYY" minimal v-model="newAdvance.date" @input="() => $refs.qDateProxy.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section>
          <q-select
              outlined
              :options="['cash', 'bank']"
              v-model="newAdvance.mode"
              label="Mode">
          </q-select>
        </q-card-section>

        <q-card-section>
          <q-select
              v-if="newAdvance.mode == 'bank'"
              outlined
              use-input
              :options="bankNames"
              v-model="newAdvance.bank_name"
              @filter="filterBankNames"
              label="Bank Name">
          </q-select>
        </q-card-section>

        <q-card-section>
          <q-input
              v-if="newAdvance.mode == 'bank'"
              outlined
              v-model="newAdvance.cheque_number"
              label="Cheque No.">
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" v-close-popup  @click="advanceSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showFuelDialog" persistent>
      <q-card>
        <q-table
          title="Fuel Slips"
          :data="fuelData"
          :columns="fuelColumns"
          row-key="name"
        />
        <q-card-section>
          <p class="text-h6">New Fuel Slip</p>
          <q-input
              outlined
              v-model="newFuel.slip_number"
              label="Slip No">
          </q-input>
        </q-card-section>

        <q-card-section>
          <q-select
              outlined
              v-model="newFuel.vendor"
              :options="vendors"
              @filter="filterVendors"
              option-label="name"
              use-input
              emit-value
              map-options
              option-value="name"
              input-debounce="300"
              label="Vendor">
          </q-select>
        </q-card-section>

        <q-card-section>
          <q-input
              outlined
              v-model.number="newFuel.quantity"
              label="Quantity">
          </q-input>
        </q-card-section>

        <q-card-section>
          <q-input
              outlined
              v-model.number="newFuel.rate"
              label="Rate">
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup  />
          <q-btn flat label="Save" color="primary" v-close-popup  @click="fuelSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>

import {
  Loading,
  QSpinnerIos
} from 'quasar'

import { mapState } from 'vuex'

import moment from 'moment'

import { updateString } from '../utils/gql'

import Vendors from '../mixins/vendors'
import BankNames from '../mixins/bank_names'

function serialFromTP (tp) {
  if (!tp) {
    return Number.MAX_SAFE_INTEGER
  }

  let ser = tp.trim()
  ser = ser.substr(ser.lastIndexOf('/') + 1)
  return parseInt(ser)
}

function shortageAmount (t) {
  if (!t.order || !t.order.owner_shortage_percentage) {
    return 0
  }

  const qty = t.unloaded_quantity || t.load_carrying

  let shortage = (t.load_carrying - qty)
  if (shortage < 0) {
    shortage = 0
  }

  const shortagePercentage = (shortage / t.load_carrying) * 100
  let amount = 0

  if (shortagePercentage >= t.order.owner_shortage_percentage) {
    amount = shortage * t.order.owner_shortage_per_tonne
  }

  return amount
}

function qty (v) { return v.unloaded_quantity || v.load_carrying }
function rate (v) { return v.order ? v.order.owner_rate_per_tonne : 0 }
function totalFuel (tp) {
  const d = (tp.extra || {}).payment_details || {}
  const fuelData = d.fuel || []
  return fuelData.reduce((p, t) => p + t.rate * t.quantity, 0)
}

function totalAdvance (tp) {
  const d = (tp.extra || {}).payment_details || {}
  const advanceData = d.advance || []
  return advanceData.reduce((p, t) => p + t.amount, 0)
}

function deduction (row) { return (totalAdvance(row) + totalFuel(row) + row.discount + row.penalty) }

function net (row) { return qty(row) * rate(row) - shortageAmount(row) - deduction(row) }

export default {

  mixins: [
    Vendors,
    BankNames
  ],

  props: {
    trips: {
      type: Array,
      required: true
    },

    disable: {
      type: Boolean
    },

    visibleColumnsProp: {
      type: Array,
      required: false
    },

    toShowAmount: {
      type: Boolean,
      required: false
    },

    loading: {
      type: Boolean,
      required: true
    },

    selectionProp: {
      type: String,
      required: false
    },

    value: {
      type: Array,
      required: false
    }
  },

  created () {
    if (this.selectionProp) {
      this.selection = this.selectionProp
    }

    if (this.trips) {
      this.trips.forEach(t => {
        if (typeof (t.extra) === 'string') {
          t.extra = JSON.parse(t.extra)
        }
      })
    }

    console.log('columns', this.visibleColumnsProp)

    if (!this.visibleColumnsProp) {
      this.visibleColumns = ['invoiceNumber', 'tripDate', 'truckNumber', 'lrNumber', 'loadQty', 'unloadQty', 'advance', 'fuel', 'deduction']
      console.log(this.visibleColumns)
    } else {
      this.visibleColumns = this.visibleColumnsProp.map(t => t)
    }
  },

  data () {
    return {
      selection: 'none',
      showDialog: false,
      showAdvanceDialog: false,
      showFuelDialog: false,
      quantity: 0,
      visibleColumns: [],
      fuelData: [],
      fuelColumns: [
        { name: 'serial_number', field: 'serial_number', label: 'Sr. No.', align: 'left' },
        { name: 'slip_number', field: 'slip_number', label: 'Fuel Slip No.', align: 'left' },
        { name: 'vendor', field: 'vendor', label: 'Fuel Vendor', align: 'left' },
        { name: 'quantity', field: 'quantity', label: 'Quantity in Liter', align: 'left' },
        { name: 'rate', field: 'rate', label: 'Rate', align: 'left' },
        { name: 'amount', field: v => v.quantity * v.rate, label: 'Amount', align: 'left', format: v => v.toFixed(2) }
      ],
      newFuel: {},
      advanceData: [],
      newAdvance: {
        date: moment().format('DD/MM/YYYY'),
        mode: 'cash'
      },
      advanceColumns: [
        { name: 'serial_number', field: 'serial_number', label: 'Sr. No.', align: 'left' },
        { name: 'date', field: 'date', label: 'Date', align: 'left' },
        { name: 'amount', field: 'amount', label: 'Amount', align: 'left' },
        { name: 'mode', field: 'mode', label: 'Mode', align: 'left' },
        { name: 'bank_name', field: 'bank_name', label: 'Bank', align: 'left' },
        { name: 'cheque_number', field: 'cheque_number', label: 'Cheque/Trans Number', align: 'left' }
      ],

      filter: '',
      path: null,
      editingTp: {},
      editableTp: {},
      tableData: {
        columns: [
          { name: 'invoiceNumber', label: 'Invoice Number', field: 'invoice_number', align: 'left', sortable: true },
          { name: 'tripDate', field: 'trip_date', label: 'Trip Date', align: 'left', format: v => moment(v).format('DD/MM/YYYY') },
          { name: 'endDate', field: 'end_date', label: 'End Date', align: 'left', format: v => moment(v).format('DD/MM/YYYY') },
          { name: 'truckNumber', field: 'truck_number', label: 'Truck Number', align: 'left' },
          { name: 'lrNumber', field: 'lr_number', label: 'LR Number', align: 'left' },
          { name: 'qty', field: v => qty(v), label: 'Qty', format: val => val || 0 },
          { name: 'rate', field: v => rate(v), label: 'Rate', align: 'left', format: val => this.$n(val, 'currency') },
          { name: 'gross', field: v => qty(v) * rate(v), label: 'Gross', align: 'left', format: val => this.$n(val, 'currency') },
          { name: 'loadQty', field: 'load_carrying', label: 'Load Qty' },
          { name: 'unloadQty', field: 'unloaded_quantity', label: 'Unload Qty', format: val => val || 0 },
          { name: 'shortage', field: row => shortageAmount(row), label: 'Shortage', format: val => this.$n(val, 'currency') },
          { name: 'deduction', field: row => (row.discount + row.penalty), label: 'Deduction', format: val => this.$n(val, 'currency') },
          { name: 'advance', field: v => totalAdvance(v), label: 'Advance', format: val => this.$n(val, 'currency') },
          { name: 'fuel', field: v => totalFuel(v), label: 'Fuel', format: val => this.$n(val, 'currency') },
          { name: 'discount', field: 'discount', label: 'Comm', format: val => this.$n(val, 'currency') },
          { name: 'penalty', field: 'penalty', label: 'Others', format: val => this.$n(val, 'currency') },
          { name: 'net', field: row => net(row), label: 'Net', format: val => this.$n(val, 'currency') }
        ],
        pagination: {
          rowsPerPage: 100,
          sortBy: 'invoiceNumber'
        }
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails']),

    totalQuantity () {
      return this.trips.reduce((p, t) => p + qty(t), 0)
    },

    totalAmount () {
      return this.trips.reduce((p, t) => {
        return p + net(t)
      }, 0)
    },

    selected: {
      get () { return this.value },
      set (val) { this.$emit('input', val) }
    }
  },

  methods: {

    totalAdvance: totalAdvance,
    totalFuel: totalFuel,

    formatDate (date) {
      if (!date) return ''
      return moment(date).format('DD/MM/YYYY')
    },

    getSelectedString () {
      return this.selected.length === 0 ? '' : `${this.selected.length} record${this.selected.length > 1 ? 's' : ''} selected of ${this.trips.length}`
    },

    filterInput (rows, terms, cols, getCellValue) {
      console.log('terms', terms)
      if (!this[terms]) {
        return rows
      }
      return rows.filter(row => row.truck_number.includes(this[terms]) ||
        (row.lr_number || '').includes(this[terms]) ||
        serialFromTP(row.invoice_number).toString().includes(this[terms]))
    },

    editTP (tpDetails) {
      this.editableTp = tpDetails
      this.editingTp = {
        ...tpDetails
      }
      this.showDialog = true
    },

    editTPAdvance (tpDetails) {
      this.editingTp = tpDetails
      this.newAdvance = {
        date: moment().format('DD/MM/YYYY'),
        mode: 'cash'
      }
      const d = (tpDetails.extra || {}).payment_details || {}
      this.advanceData = d.advance || []
      this.advanceData.forEach((v, i) => {
        v.serial_number = i + 1
      })
      this.showAdvanceDialog = true
    },

    editTPFuel (tpDetails) {
      this.editingTp = tpDetails
      this.newFuel = {}
      this.showFuelDialog = true
      const d = (tpDetails.extra || {}).payment_details || {}
      this.fuelData = d.fuel || []
      this.fuelData.forEach((v, i) => {
        v.serial_number = i + 1
      })
    },

    expenses (tp) {
      return (tp.advance || 0) +
        (tp.fuel || 0) +
        (tp.discount || 0) +
        (tp.penalty || 0)
    },

    async advanceSave () {
      const extra = (this.editingTp.extra || {})
      extra.payment_details = extra.payment_details || {}
      extra.payment_details.advance = extra.payment_details.advance || []
      extra.payment_details.advance.push(this.newAdvance)

      console.log('extra', extra)

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('normal_trips', `
            affected_rows
          `),
          variables: {
            set: {
              extra: extra
            },
            where: {
              id: {
                _eq: this.editingTp.id
              }
            }
          }
        })

        this.editingTp.extra = extra
        console.log(response)
      } catch (ex) {
        console.error(ex)
      }
    },

    async fuelSave () {
      const extra = (this.editingTp.extra || {})
      extra.payment_details = extra.payment_details || {}
      extra.payment_details.fuel = extra.payment_details.fuel || []
      extra.payment_details.fuel.push(this.newFuel)

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('normal_trips', `
            affected_rows
          `),
          variables: {
            set: {
              extra: extra
            },
            where: {
              id: {
                _eq: this.editingTp.id
              }
            }
          }
        })

        this.editingTp.extra = extra
        console.log(response)
      } catch (ex) {
        console.error(ex)
      }
    },

    async updateExpenses () {
      const tp = this.editingTp

      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      console.log(tp.discount, tp.penalty)

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('normal_trips', `
            affected_rows
            returning {
              discount
              penalty
            }
          `),
          variables: {
            set: {
              discount: tp.discount || 0,
              penalty: tp.penalty || 0
            },
            where: {
              id: {
                _eq: tp.id
              }
            }
          }
        })

        Object.assign(this.editableTp, tp)
        console.log(response)
      } catch (ex) {
        console.error(ex)
      }

      Loading.hide()
    },

    async updateUnloadedQty (tp) {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('normal_trips', `
            affected_rows
          `),
          variables: {
            set: {
              unloaded_quantity: tp.unloaded_quantity
            },
            where: {
              id: {
                _eq: tp.id
              }
            }
          }
        })
        console.log(response)
      } catch (ex) {
        console.error(ex)
      }
      Loading.hide()
    },

    async updatelrNumber (tp) {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('normal_trips', `
            affected_rows
          `),
          variables: {
            set: {
              lr_number: tp.lr_number
            },
            where: {
              id: {
                _eq: tp.id
              }
            }
          }
        })
        console.log(response)
      } catch (ex) {
        console.error(ex)
      }

      Loading.hide()
    },

    async updateEndDate (tp) {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('normal_trips', `
            affected_rows
          `),
          variables: {
            set: {
              end_date: tp.end_date
            },
            where: {
              id: {
                _eq: tp.id
              }
            }
          }
        })
        console.log(response)
      } catch (ex) {
        console.error(ex)
      }

      Loading.hide()
    },

    customSort (rows, sortBy, descending) {
      const data = [ ...rows ]

      if (sortBy) {
        const col = this.tableData.columns.find(x => x.name === sortBy)
        sortBy = col.field === void 0 ? col.name : col.field
        console.log('customSort is called', sortBy)

        data.sort((a, b) => {
          const x = descending ? b : a
          const y = descending ? a : b
          // int sort
          return serialFromTP(x[sortBy]) - serialFromTP(y[sortBy])
        })
      }

      return data
    }
  }
}
</script>
