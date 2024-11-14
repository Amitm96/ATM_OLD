<template>
  <q-page padding="">

  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

    <div style="max-width: 200px">
       <q-select class="q-mt-xl"
        outlined
        v-model="order"
        use-input
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

      <q-select
        label="Truck"
        outlined
        v-model="truck"
        use-input
        class="text-uppercase q-mb-md"
        :options="trucks"
        @filter="filterTrucks"
        hide-dropdown-icon
        input-debounce="0"
        option-value="truck_number"
        emit-value
        map-options
        option-label="truck_number"
        hint="Press <Enter> for new truck"
        new-value-mode="add-unique"
         :rules="[val => !!val || 'Field is required']"
      />

      <q-input
          :rules="[val => !!val || 'This Field is required']"
          outlined
          v-model="lrNumber"
          label="LR Number"
        />

      <q-input
          :rules="[val => !!val || 'This Field is required']"
          outlined
          v-model.number="loadCarrying"
          label="Load Qty"
        />

        <q-input
          :rules="[val => !!val || 'This Field is required']"
          outlined
          v-model="invoiceChallanNo"
          label="Invoice/Challan No"
        />

        <q-input
          class="q-mb-md"
          :rules="[val => !!val || 'This Field is required', val => /^\d{10}$/.test(val) || 'Invalid Phone Number']"
          outlined
          maxlength="10"
          :counter="true"
          v-model="driverPhoneNumber"
          type="tel"
          label="Driver Phone Number"
        />

        <q-input
          class="q-mb-md"
          outlined
          :readonly="true"
          :value="(expense.discount || 0) + (expense.penalty || 0)"
          type="number"
          label="Expense"
          @click="showExpense"
        />

        <q-input
                  class="q-mb-md"

          outlined
          :readonly="true"
          :value="advance.amount"
          type="number"
          label="Advance"
          @click="showAdvance"
        />

        <q-input
                  class="q-mb-md"

          outlined
          :readonly="true"
          :value="fuel.amount"
          type="number"
          label="Fuel"
          @click="showFuel"
        />
    </div>

    <div class="q-mt-xl">
      <q-btn label="Submit" type="submit" color="primary"/>
      <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
    </div>

  </q-form>

    <q-dialog v-model="showExpenseDialog" persistent>
      <q-card>
        <q-card-section>
          <p class="text-h6">Expenses</p>
          <q-input
              outlined
              type="number"
              prefix="₹"
              v-model.number="newExpense.discount"
              label="Discount">
          </q-input>
        </q-card-section>

        <q-card-section>
          <q-input
              outlined
              type="number"
              prefix="₹"
              v-model.number="newExpense.penalty"
              label="Others">
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup  />
          <q-btn flat label="Save" color="primary" v-close-popup @click="saveExpense"  />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAdvanceDialog" persistent>

      <q-card>
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
          <q-btn flat label="Save" color="primary" v-close-popup  @click="saveAdvance" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showFuelDialog" persistent>
      <q-card>
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
          <q-btn flat label="Save" color="primary" v-close-popup  @click="saveFuel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>

import { insertString } from '../utils/gql'
import { mapState } from 'vuex'
import {
  Loading,
  QSpinnerIos
} from 'quasar'

import Vendors from '../mixins/vendors'
import BankNames from '../mixins/bank_names'
import Orders from '../mixins/orders'
import Trucks from '../mixins/trucks'

export default {
  name: 'PageTruckAssign',

  mixins: [
    Orders({
      skip () {
        return !this.account
      }
    }),

    Trucks,
    Vendors,
    BankNames
  ],

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
      truck: null,
      account: null,
      lrNumber: null,
      showExpenseDialog: false,
      showFuelDialog: false,
      showAdvanceDialog: false,
      newExpense: {},
      newAdvance: {},
      newFuel: {},
      expense: {},
      advance: {},
      fuel: {},
      invoiceChallanNo: '',
      driverPhoneNumber: '',
      loadCarrying: null }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {

    showExpense () {
      this.showExpenseDialog = true
    },

    showAdvance () {
      this.showAdvanceDialog = true
    },

    showFuel () {
      this.showFuelDialog = true
    },

    saveExpense () {
      this.expense = {
        ...this.newExpense
      }
    },

    saveAdvance () {
      this.advance = {
        ...this.newAdvance
      }
    },

    saveFuel () {
      this.fuel = {
        ...this.newFuel
      }
    },

    async onSubmit () {
      console.log(this.order, this.truck.toUpperCase())
      // fully customizable
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })

      const extra = {
        payment_details: {}
      }

      if (Object.keys(this.advance).length) {
        extra.payment_details.advance = [this.advance]
      }

      if (Object.keys(this.fuel).length) {
        extra.payment_details.fuel = [this.fuel]
      }

      console.log('sending order details')
      try {
        const response = await this.$apollo.mutate({
          mutation: insertString('normal_trips', `
            affected_rows
            returning {
              id
            }
          `),
          variables: {
            objects: {
              order_id: this.order.id,
              load_carrying: this.loadCarrying,
              truck_number: this.truck,
              truck: {
                data: {
                  truck_number: this.truck,
                  companies_bridge: {
                    data: {
                      company_id: this.userDetails.company_id
                    },
                    on_conflict: {
                      constraint: 'companies_trucks_bridge_company_id_truck_id_key',
                      update_columns: 'truck_id'
                    }
                  }
                },
                on_conflict: {
                  constraint: 'trucks_truck_number_key',
                  update_columns: ['truck_number']
                }
              },
              lr_number: this.lrNumber,
              discount: this.expense.discount,
              penalty: this.expense.penalty,
              invoice_number: this.invoiceChallanNo,
              driver_phone_number: this.driverPhoneNumber,
              extra: extra
            }
          }
        })

        console.log(response)
        Loading.hide()
        this.$router.go(-1)
        // setTimeout(() => this.onReset(), 1000)
        this.$q.notify({
          message: 'Assigned successfully',
          color: 'positive',
          icon: 'info'
        })
      } catch (ex) {
        Loading.hide()
        console.error(ex)
        this.$q.notify({
          message: 'Failed to assign',
          color: 'positive',
          icon: 'info'
        })
      }
    },

    onReset () {
      this.truck = null
      this.loading = false
      this.lrNumber = null
      this.invoiceChallanNo = ''
      this.driverPhoneNumber = ''
      this.loadCarrying = 0
    }
  }
}
</script>
