<template>
  <q-page padding="">

  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <div style="max-width: 500px">

        <q-select
          v-if="!order"
          label="Account"
          outlined
          v-model="account"
          fill-input
          input-debounce="0"
          :options="accounts"
          option-label="name"
          :rules="[val => !!val || 'Account is required']"
          />

        <q-select
          v-if="!order"
          label="Client"
          outlined
          v-model="client"
          use-input
          :options="clients"
          @filter="filterClients"
          input-debounce="0"
          option-label="name"
          class="q-mb-md"
        />

        <q-input
            outlined
            v-model="orderNumber"
            class="q-mb-md"
            label="Order Number" />

        <q-input
            outlined
            v-model.number="quantity"
            class="q-mb-md"
            label="Quantity" />

        <q-input
          :rules="[val => !!val || 'This Field is required']"
          outlined
          v-model="sourceDestination"
          label="Source-Destination" />

        <q-input
          :rules="[val => !!val || 'This Field is required']"
          outlined
          v-model="startDate"
          mask="##-##-####"
          label="Start Date"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="startDate"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  minimal
                  v-model="startDate"
                  mask="DD-MM-YYYY"
                  @input="() => $refs.startDate.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          :rules="[val => !!val || 'This Field is required']"
          outlined
          v-model="endDate"
          mask="##-##-####"
          label="End Date"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="endDate"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  minimal
                  v-model="endDate"
                  mask="DD-MM-YYYY"
                  @input="() => $refs.endDate.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <div class="row">
          <div class="col q-pr-md">
          <div class="text-h6 q-mb-sm"> Truck Owner Details </div>
            <q-input
                outlined
                type="text"
                prefix="₹"
                v-model.number="ownerRatePerTonne"
                label="Price Per Tonne">
            </q-input>

            <q-input class="q-pt-md"
                outlined
                type="text"
                prefix="%"
                v-model.number="ownerShortagePercentage"
                label="Shortage Percentage">
            </q-input>

            <q-input class="q-pt-md"
                outlined
                type="text"
                prefix="₹"
                v-model.number="ownerShortagePerTonne"
                label="Shortage Price Per Tonne">
            </q-input>

          </div>
        <div class="col q-pl-md">
         <div class="text-h6 q-mb-sm"> Client Details </div>
          <q-input
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientRatePerTonne"
              label="Price Per Tonne">
          </q-input>

          <q-input class="q-pt-md"
              outlined
              type="text"
              prefix="%"
              v-model.number="clientShortagePercentage"
              label="Shortage Percentage">
          </q-input>

          <q-input class="q-pt-md"
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientShortagePerTonne"
              label="Shortage Price Per Tonne">
          </q-input>
        </div>
      </div>
    </div>

      <!-- <div class="text-h6 q-mb-xs"> Truck Owner Details </div>
          <q-input
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="ownerRatePerTonne"
              label="Price Per Tonne">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="%"
              v-model.number="ownerShortagePercentage"
              label="Shortage Percentage">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="ownerShortagePerTonne"
              label="Shortage Price Per Tonne">
          </q-input>

      <div class="text-h6 q-mb-xs"> Client Details </div>
          <q-input
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientRatePerTonne"
              label="Price Per Tonne">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="%"
              v-model.number="clientShortagePercentage"
              label="Shortage Percentage">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientShortagePerTonne"
              label="Shortage Price Per Tonne">
          </q-input> -->

      <div class="q-mt-lg">
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>

  </q-form>
  </q-page>
</template>

<script>

import { mapState } from 'vuex'
import { Loading, QSpinnerIos } from 'quasar'

import { updateString, insertString } from '../utils/gql'
import moment from 'moment'
import Clients from '../mixins/clients'
import Accounts from '../mixins/accounts'

export default {
  name: 'PageNewOrder',

  props: {
    order: {
      type: Object
    }
  },

  mixins: [
    Clients,
    Accounts({
      skip () {
        return this.account
      },
      returning: `
        id
        name
        company_id
      `
    })
  ],

  data () {
    return {
      client: null,
      clientFilter: '',
      account: null,
      quantity: 0,
      orderNumber: '',
      sourceDestination: '',
      ownerRatePerTonne: 0,
      ownerShortagePerTonne: 0,
      ownerShortagePercentage: 0,
      clientShortagePerTonne: 0,
      clientRatePerTonne: 0,
      clientShortagePercentage: 0,
      startDate: null,
      endDate: null
    }
  },

  async created () {
    console.log(this.order)
    if (this.order) {
      this.orderNumber = this.order.order_number
      this.clientRatePerTonne = this.order.client_rate_per_tonne
      this.clientShortagePerTonne = this.order.client_shortage_per_tonne
      this.clientShortagePercentage = this.order.client_shortage_percentage
      this.sourceDestination = this.order.source_destination
      this.ownerRatePerTonne = this.order.owner_rate_per_tonne
      this.ownerShortagePerTonne = this.order.owner_shortage_per_tonne
      this.ownerShortagePercentage = this.order.owner_shortage_percentage
      this.startDate = this.order.start_date
      this.endDate = this.order.end_date
      this.account = this.order.account
      this.quantity = this.order.quantity
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {

    async onSubmit () {
      console.log(this.account, this.userDetails)

      // fully customizable
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })

      const startDate = moment(this.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
      const endDate = moment(this.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD')

      if (!this.order) {
        console.log('sending order details')
        const response = await this.$apollo.mutate({
          mutation: insertString('orders', `
            affected_rows
            returning {
              id
            }
          `, true),
          variables: {
            objects: {
              order_number: this.orderNumber,
              source_destination: this.sourceDestination,
              client_rate_per_tonne: this.clientRatePerTonne,
              client_shortage_percentage: this.clientShortagePercentage,
              client_shortage_per_tonne: this.clientShortagePerTonne,
              owner_rate_per_tonne: this.ownerRatePerTonne,
              owner_shortage_per_tonne: this.ownerShortagePerTonne,
              owner_shortage_percentage: this.ownerShortagePercentage,
              start_date: startDate,
              end_date: endDate,
              quantity: this.quantity,
              company_id: this.userDetails.company_id,
              account_id: this.account.id,
              client_id: this.client.id
            },
            on_conflict: {
              constraint: 'orders_account_id_permit_number_key',
              update_columns: [
                'source_destination',
                'client_rate_per_tonne',
                'client_shortage_percentage',
                'client_shortage_per_tonne',
                'owner_rate_per_tonne',
                'owner_shortage_per_tonne',
                'owner_shortage_percentage',
                'start_date',
                'end_date'
              ]
            }
          }
        })

        console.log(response)
        Loading.hide()
        this.$router.go(-1)
      } else {
        const response = await this.$apollo.mutate({
          mutation: updateString('orders', `
            affected_rows
            returning {
              id
            }
          `),
          variables: {
            where: {
              id: {
                _eq: this.order.id
              }
            },
            set: {
              order_number: this.orderNumber,
              source_destination: this.sourceDestination,
              client_rate_per_tonne: this.clientRatePerTonne,
              client_shortage_percentage: this.clientShortagePercentage,
              client_shortage_per_tonne: this.clientShortagePerTonne,
              owner_rate_per_tonne: this.ownerRatePerTonne,
              owner_shortage_per_tonne: this.ownerShortagePerTonne,
              owner_shortage_percentage: this.ownerShortagePercentage,
              start_date: startDate,
              end_date: endDate,
              quantity: this.quantity
            }
          }
        })

        console.log(response)
        Loading.hide()
        this.$router.go(-1)
      }
    },

    onReset () {
      this.account = null
      this.tagUrl = null
      this.loading = false
      this.clientRatePerTonne = 0
      this.clientShortagePerTonne = 0
      this.clientShortagePercentage = 0
      this.ownerRatePerTonne = 0
      this.ownerShortagePerTonne = 0
      this.ownerShortagePercentage = 0
    }
  }
}
</script>
