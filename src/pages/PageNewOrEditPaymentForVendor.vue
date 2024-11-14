<template>
  <q-page padding>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div style="max-width: 400px" class="q-mt-lg">
        <q-select
          :disable="!!payment"
          class="q-mt-md"
          outlined
          v-model="account"
          fill-input
          input-debounce="0"
          :options="accounts"
          option-label="name"
          label="Account"
          :rules="[val => !!val || 'Account is required']"
        />

        <q-select
          :disable="!!payment"
          class="q-mt-md"
          outlined
          v-model="vendor"
          :options="vendors"
          @filter="filterVendors"
          option-label="name"
          label="Vendor"
          :rules="[val => !!val || 'Vendor is required']"
        />

        <q-select
          :disable="!!payment || !!order.length"
          outlined
          v-model="permit"
          use-input
          use-chips
          multiple
          option-label="permit_number"
          input-debounce="0"
          :options="permits"
          ref="permitSelect"
          @input="onPermitSelected"
          @filter="filterPermits"
          label="Permit Nos"
          :rules="[val => !!val || 'Field is required']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          :disable="!!payment || !!permit.length"
          outlined
          v-model="order"
          use-input
          use-chips
          multiple
          option-label="order_number"
          input-debounce="0"
          :options="orders"
          ref="orderSelect"
          @input="onOrderSelected"
          @filter="filterOrders"
          label="Orders"
          :rules="[val => !!val || 'Field is required']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>

      </div>

      <trips-view
        v-if="permit.length"
        :toShowAmount="true"
        :trips="trips"
        :loading="loading"
        v-model="selected"
        :visibleColumnsProp="['passNumber', 'passDate', 'truckNumber', 'qty', 'rate', 'gross', 'shortage', 'advance', 'fuel', 'discount', 'others', 'net']"
        :selectionProp="disableSelect ? 'none' : 'multiple'"
      />

      <normal-trips-view
        v-else
        :toShowAmount="true"
        :trips="normal_trips"
        :loading="loading"
        v-model="selected"
        :visibleColumnsProp="['lrNumber', 'tripDate', 'truckNumber', 'qty', 'rate', 'gross', 'shortage', 'advance', 'fuel', 'discount', 'others', 'net']"
        :selectionProp="disableSelect ? 'none' : 'multiple'"
      />

      <div class="q-mt-lg">
        <q-btn :disable="btnDisabled" :label="submitLabel" type="submit" color="primary" />
        <q-btn
          v-if="!btnDisabled"
          :label="rejectLabel"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>

    <div id="payment-msg" v-if="paymentMessage" :class="paymentClass">{{ paymentMessage }}</div>

    <div class="q-pt-md q-pb-md">
      <q-spinner v-if="loading" color="primary" size="3em" :thickness="2" />
    </div>

    <q-dialog v-model="showDialog" persistent>
      <q-card>
        <q-card-section>
          <p class="text-h6">Payment Status</p>
          <q-input outlined type="number" v-model.number="gstTds" label="GST/TDS"></q-input>
        </q-card-section>
        <q-card-section>
          <q-select outlined :options="['cash', 'bank', 'online']" v-model="mode" label="Mode"></q-select>
        </q-card-section>

        <q-card-section>
          <q-select
            v-if="mode == 'bank'"
            outlined
            use-input
            :options="bankNames"
            v-model="bankName"
            @filter="filterBankNames"
            label="Bank Name"
          ></q-select>
        </q-card-section>

        <q-card-section>
          <q-input v-if="mode == 'bank'" outlined v-model="transactionRef" label="Cheque No."></q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup @click="cancel" />
          <q-btn flat label="Save" color="primary" v-close-popup @click="update" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>

import { mapState } from 'vuex'
import axios from 'axios'
import _ from 'lodash'

import { queryString, insertString, updateString, paymentFields } from '../utils/gql'
import { confirmDialog, getObjectById, hasPermission } from '../utils/util'
import confirmDelete from '../mixins/confirm_delete'
import Owners from '../mixins/owners'
import Vendors from '../mixins/vendors'
import Orders from '../mixins/orders'
import Permits from '../mixins/permits'
import BankNames from '../mixins/bank_names'
import Accounts from '../mixins/accounts'
import PaymentVoucher from '../mixins/payment_voucher'

import { cloudfunctionsBaseUrl } from 'boot/firebase'

export default {
  name: 'PageNewOrEditPaymentForVendor',

  props: {
    payment: {
      required: false
    },

    id: {
      type: Number
    }
  },

  mixins: [
    PaymentVoucher,
    confirmDelete,
    BankNames,
    Vendors,

    Accounts({
      skip () {
        return this.account
      },
      returning: `
        id
        name
      `
    }),

    Owners({
      skip () {
        return this.owner
      }
    }),

    Orders({
      skip () {
        return this.permit.length || this.disablePermits || !this.account
      },
      returning: `
            id
            order_number
            source_destination
            owner_rate_per_tonne
            owner_shortage_per_tonne
            owner_shortage_percentage
        `

      // where () {
      //   return {
      //     account_id: {
      //       _eq: this.account.id
      //     }
      //   }
      // }
    }),

    Permits({
      skip () {
        return this.order.length || this.disablePermits || !this.account
      },

      returning: `
            id
            permit_number
            source_destination
            owner_rate_per_tonne
            owner_shortage_per_tonne
            owner_shortage_percentage
        `
      // where () {
      //   return {
      //     account_id: {
      //       _eq: this.account.id
      //     }
      //   }
      // }
    })
  ],

  async created () {
    if (!this.payment && this.id) {
      const response = await getObjectById(this.$apollo, 'payment_vouchers', paymentFields, this.id)
      this.payment = response.data.payment_vouchers[0]
    }

    console.log('payment', this.payment)
    if (this.payment != null) {
      this.disablePermits = true
      this.disableSelect = true
      this.owner = this.payment.owner
      this.trips = this.payment.trips
      this.normal_trips = this.payment.normal_trips
      this.permit = _.unionBy(this.payment.trips.map(t => t.permit), 'permit_number')
      this.order = _.unionBy(this.payment.normal_trips.map(t => t.order), 'order_number')
      this.account = this.payment.account
      this.vendor = this.payment.vendor

      console.log(this.permit, this.order, this.type, this.vendor)

      if ((this.payment.status < 2) && hasPermission(this.userDetails, ['admin'])) {
        this.submitLabel = 'Approve'
        this.rejectLabel = 'Reject'
        this.disableSelect = true
      } else {
        switch (this.payment.status) {
          case 0:

            if (hasPermission(this.userDetails, ['authorizer'])) {
              this.submitLabel = 'Verification Pending'
              this.rejectLabel = 'Reject'
              this.btnDisabled = true
              this.disableSelect = true
            } else if (hasPermission(this.userDetails, ['verifier'])) {
              this.submitLabel = 'Verify'
              this.rejectLabel = 'Reject'
              this.disableSelect = true
            } else {
              this.btnDisabled = true
              this.disablePermits = false
            }
            break

          case 1:
            this.disableSelect = true

            if (hasPermission(this.userDetails, ['authorizer'])) {
              this.submitLabel = 'Approve'
              this.rejectLabel = 'Reject'
            } else if (hasPermission(this.userDetails, ['verifier'])) {
              this.submitLabel = 'Verified'
              this.rejectLabel = 'Reject'
              this.btnDisabled = true
            }
            break

          case 2:
            this.disableSelect = true

            this.submitLabel = 'Approved'
            this.btnDisabled = true
            break

          case 3:
            this.disableSelect = true

            this.submitLabel = 'Rejected'
            this.btnDisabled = true
            break
        }
      }
    }
  },

  data () {
    return {
      paymentMessage: '',
      paymentClass: 'text-primary',
      bankName: null,
      disablePermits: false,
      showDialog: false,
      loading: false,
      vendor: null,
      owner: null,
      btnDisabled: false,
      selected: [],
      trips: [],
      normal_trips: [],
      order: [],
      permit: [],
      account: null,
      cancelled: false,
      mode: null,
      transactionRef: '',
      gstTds: 0,
      submitLabel: 'Submit',
      rejectLabel: 'Reset',
      disableSelect: false
    }
  },

  apollo: {

    trips: {
      skip () {
        return !this.permit.length || this.disablePermits
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
        permit {
          source_destination
          owner_rate_per_tonne
          owner_shortage_per_tonne
          owner_shortage_percentage
        }
        tp_date
        tp_number
        tp_url
        truck_id
        truck_number
        unloaded_quantity
      `),

      update (data) {
        console.log('data', data)
        if (!data.trips) {
          data.trips = []
        }
        return data.trips
      },

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        console.log('We got some result!', data)
      },

      fetchPolicy: 'network-only',

      variables () {
        if (this.payment) {
          return {
            where: {
              vendor_payment_voucher_id: {
                _eq: this.payment.id
              }
            }
          }
        }

        return {
          where: {
            permit_id: {
              _in: this.permit.map(p => p.id)
            },

            vendor_payment_voucher_id: {
              _is_null: true
            }
          }
        }
      }
    },

    normal_trips: {
      skip () {
        console.log('skipping normal trips', !this.order, this.disablePermits, !this.owner)
        return !this.order.length || this.disablePermits || !this.owner
      },

      query: queryString('normal_trips', `
        extra
        id
        discount
        load_carrying
        lr_number
        penalty
        order_id
        order {
          id
          order_number
          source_destination
          owner_rate_per_tonne
          owner_shortage_per_tonne
          owner_shortage_percentage
        }
        trip_date
        invoice_number
        truck_id
        truck_number
        unloaded_quantity
      `),

      update (data) {
        console.log('data', data)
        if (!data.normal_trips) {
          data.normal_trips = []
        }
        data.normal_trips.forEach(t => {
          t.owner = this.owner
        })

        return data.normal_trips
      },

      // Error handling
      error (error) {
        console.error('We\'ve got an error in normal trips!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        console.log('We got normal trips!', data)
      },

      fetchPolicy: 'network-only',

      variables () {
        if (this.payment) {
          return {
            where: {
              vendor_payment_voucher_id: {
                _eq: this.payment.id
              }
            }
          }
        }

        return {
          where: {
            order_id: {
              _in: this.order.map(p => p.id)
            },

            vendor_payment_voucher_id: {
              _is_null: true
            }
          }
        }
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {

    // Initializing the payment request
    makePayment: function () {
      this.i3ms = this.permit.length

      this.paying_trips = this.permit.length ? this.trips : this.normal_trips

      let amount = ((this.totalNet + this.totalNet * this.userDetails.company.payment_commission / 100) * 100 | 0) /// The amount is shown in currency subunits. Actual amount is ₹599.

      //  create options object when creating order
      const options = {
        key: process.env.PROD ? 'rzp_live_kxS73b8eO58ZST' : 'rzp_test_ABQdlimY1fUW0r',
        amount, /// The amount is shown in currency subunits. Actual amount is ₹599.
        name: this.owner.name,
        description: 'Payment towards transport services',
        handler: (response) => {
          console.log('response from razorpay', response)
          this.verifySignature(response)
        },
        prefill: {
          name: this.owner.name,
          contact: this.owner.phone_number
        },
        notes: {
          address: `${this.owner.address1}\n${this.owner.address2}`
        },
        theme: {
          color: '#00ffff'
        }
      }

      // 1. GENERATE ORDER_ID using razorpay/order api
      axios.post(`${cloudfunctionsBaseUrl}/payOrder`, {
        amount,
        account: this.owner.extra.razorpay_account
      }, {
        headers: {
          Authorization: 'Bearer ' + this.userDetails.token
        }
      })
        .then((res) => {
          var rzp1 = new window.Razorpay({ ...options, order_id: res.data.id })
          rzp1.open()
        })
        .catch((err) => {
          console.log('ERR', err)
          this.$q.notify({
            message: `Unable to create payment order, ${err.message}`,
            color: 'negative',
            icon: 'warn'
          })
        })
    },
    verifySignature: function (response) {
      axios.post(`${cloudfunctionsBaseUrl}/confirmPayment`
        , response, {
          headers: {
            Authorization: 'Bearer ' + this.userDetails.token
          }
        }
      )
        .then((res) => {
          console.log('PAYMENT RESPONSE', res)
          this.paymentMessage = 'Payment Successful'
          this.payment.transaction_ref = response.razorpay_order_id + '|' + response.razorpay_payment_id
          this.updateVoucher()
        })
        .catch((err) => {
          console.log('error')
          this.paymentMessage = err.message
          this.paymentClass = 'text-warning'
        })
    },

    onPermitSelected (val) {
      console.log(val)
      this.$refs.permitSelect.updateInputValue('', true)

      if (this.permits.length === 1) {
        this.$refs.permitSelect.hidePopup()
      }
    },

    onOrderSelected (val) {
      console.log(val)
      this.$refs.orderSelect.updateInputValue('', true)

      if (this.orders.length === 1) {
        this.$refs.orderSelect.hidePopup()
      }
    },

    getSelectedString () {
      return this.selected.length === 0 ? '' : `${this.selected.length} truck${this.selected.length > 1 ? 's' : ''} selected of ${this.trips.length}`
    },

    cancel () {
      this.cancelled = true
    },

    update () {
      this.payment.mode = this.mode
      this.payment.transaction_ref = this.transactionRef
      this.payment.payment_date = new Date()
      this.payment.bank_name = this.bankName
      this.payment.gst_tds = this.gstTds

      if (this.mode === 'online') {
        this.makePayment()
      } else {
        this.updateVoucher()
      }
    },

    async updateVoucher () {
      try {
        this.loading = true

        let response = await this.$apollo.mutate({
          mutation: updateString('vendor_payment_vouchers', `
            affected_rows
            returning {
              id
            }
          `),

          variables: {
            set: {
              status: this.payment.status,
              mode: this.payment.mode,
              transaction_ref: this.payment.transaction_ref,
              bank_name: this.bankName,
              payment_date: this.payment.payment_date,
              gst_tds: this.payment.gst_tds ? this.payment.gst_tds : 0
            },
            where: {
              id: {
                _eq: this.payment.id
              }
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
          message: 'failed to save, retry again',
          color: 'negative',
          icon: 'warning'
        })
      }

      this.loading = false

      if (this.payment.status === 2) {
        this.$router.push({
          name: 'paymentvouchervendor',
          path: '/paymentvouchervendor',
          params: {
            payment: this.payment
          }
        })
      } else {
        this.$router.go(-1)
      }
    },

    async onSubmit () {
      if (this.payment) {
        let toUpdate = false

        if (hasPermission(this.userDetails, ['admin'])) {
          this.payment.status = 2
          toUpdate = true
        } else {
          switch (this.payment.status) {
            case 0:
              if (hasPermission(this.userDetails, ['verifier'])) {
                this.payment.status = 1
                toUpdate = true
              }
              break

            case 1:
              if (hasPermission(this.userDetails, ['authorizer'])) {
                this.payment.status = 2
                toUpdate = true
              }
              break
          }
        }

        if (toUpdate) {
          if (this.payment.status === 2) {
            this.showDialog = true
            return
          } else {
            const b = await confirmDialog(this.$q.dialog, 'Confirm', 'Are you sure to update the voucher?')
            if (!b) {
              return
            }
          }

          return this.updateVoucher()
        }
      }

      if (!this.selected.length || !this.selected.filter(s => !s.unloaded_quantity || !s.end_date).length) {
        return this.$q.notify({
          message: !this.selected.length ? 'Please select atleast one trip' : 'Some of the trips not completed, please complete them first',
          color: 'negative',
          icon: 'warning'
        })
      }

      this.loading = true

      this.selected.forEach(t => {
        delete t.__typename
      })

      try {
        let response = await this.$apollo.mutate({
          mutation: insertString('vendor_payment_vouchers', `
            affected_rows
            returning {
              id
            }
          `,
          true),

          variables: {
            objects: {
              vendor_id: this.vendor.id,
              company_id: this.userDetails.company_id,
              account_id: this.account.id,
              status: this.payment ? 1 : 0
            },
            on_conflict: {
              constraint: 'vendor_payment_vouchers_pkey',
              update_columns: ['status']
            }
          }
        })

        console.log(response)

        const paymentVoucherId = response.data.insert_vendor_payment_vouchers.returning[0].id

        if (this.permit.length) {
          response = await this.$apollo.mutate({
            mutation: updateString('trips', `
              affected_rows
              returning {
                id
              }
            `,
            true),

            variables: {
              set: {
                vendor_payment_voucher_id: paymentVoucherId
              },

              where: {
                id: {
                  _in: this.selected.map(t => t.id)
                }
              }
            }
          })
        } else {
          response = await this.$apollo.mutate({
            mutation: updateString('normal_trips', `
              affected_rows
              returning {
                id
              }
            `,
            true),

            variables: {
              set: {
                vendor_payment_voucher_id: paymentVoucherId
              },

              where: {
                id: {
                  _in: this.selected.map(t => t.id)
                }
              }
            }
          })
        }

        console.log(response)
      } catch (ex) {
        console.error(ex)
        this.$q.notify({
          message: `Failed to save, ${ex.message}`,
          color: 'negative',
          icon: 'warn'
        })

        this.loading = false
        return
      }

      this.$q.notify({
        message: 'Saved successfully',
        color: 'positive',
        icon: 'info'
      })

      this.loading = false

      if (this.payment && this.payment.status === 2) {
        this.$router.push({
          name: 'paymentvoucher',
          path: '/paymentvoucher',
          params: {
            payment: this.payment
          }
        })
      } else {
        this.$router.go(-1)
      }
    },

    async onReset () {
      if (this.payment) {
        if (hasPermission(this.userDetails, ['admin', 'authorizer', 'verifier'])) {
          await this.confirmAndDeleteDocument('payment_vouchers', null, this.payment.id)
          return this.$router.go(-1)
        }
      }
      this.permit = null
      this.owner = null
      this.vendor = null
      this.trips = []
    }

  },

  components: {
    'trips-view': require('components/Trips.vue').default,
    'normal-trips-view': require('components/NormalTrips.vue').default
  }
}
</script>
