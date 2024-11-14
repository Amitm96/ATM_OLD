<template>
  <q-page>
    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
    <div class="q-pa-lg">
      <!-- <div class="text-h6">Create</div> -->
      <div class="q-pt-md q-pb-md">
        <q-card flat bordered class="my-card">
          <div class="row q-pt-ld">
            <div class="col-3">
              <q-card-section>
                <div>Account</div>
                <q-select
                  :rules="[val => !!val || 'This Field is required']"
                  outlined
                  v-model="account"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :options="accounts"
                  option-label="name"
                  @input="onAccountSelected"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">No results</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
              <q-card-section>
                <div>Permit No</div>
                <q-select
                    outlined
                    v-model="formData.permit_number"
                    :options="permitsAndOrders"
                    :rules="[val => !!val || 'This Field is required']"
                    hide-dropdown-icon
                    emit-value
                    map-options
                    input-debounce="300"
                    label="Permit Number"
                    option-label="value"
                    @input="onPermitOrOrderSelected"
                  />

              </q-card-section>
            </div>
            <div class="col-3">
              <q-card-section>
                <div>Client</div>
                <q-select
                  :rules="[val => !!val || 'This Field is required']"
                  outlined
                  v-model="client"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :options="clients"
                  option-label="name"
                  @input="onClientSelected"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">No results</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
              <q-card-section>
                <div>From Date</div>
                <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  outlined
                  v-model="formData.startDate"
                  mask="##-##-####"
                  label="(DD-MM-YYYY)"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="qtoDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="formData.startDate"
                          mask="DD-MM-YYYY"
                          @input="() => $refs.qtoDateProxy.hide()"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>
            </div>
            <div class="col-3">
              <q-card-section>
                <div>Invoice Date</div>
                <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  outlined
                  v-model="formData.invoiceDate"
                  mask="##-##-####"
                  label="(DD-MM-YYYY)"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="qtoDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="formData.invoiceDate"
                          mask="DD-MM-YYYY"
                          @input="() => $refs.qtoDateProxy.hide()"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>
              <q-card-section>
                <div>To Date</div>
                <q-input
                :rules="[val => !!val || 'This Field is required']"
                outlined v-model="formData.endDate" mask="##-##-####" label="(DD-MM-YYYY)">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="qtoDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="formData.endDate"
                          mask="DD-MM-YYYY"
                          @input="() => $refs.qtoDateProxy.hide()"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>
            </div>
            <div class="col-3">
              <q-card-section class="col-3 q-pt-md">
                <div>Invoice #</div>
                <q-input
                :rules="[val => !!val || 'This Field is required']"
                v-model="formData.invoiceNo" outlined type="text"></q-input>
              </q-card-section>
            </div>
          </div>
          <table class="q-table q-pl-md q-pr-md q-pt-lg">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Unit Cost</th>
                <th>Quantity</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.name">
                <td>
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                   style="width: 200px" outlined type="text" v-model="item.name"></q-input>
                </td>
                <td>
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  style="width: 200px" outlined type="text" v-model="item.description"></q-input>
                </td>
                <td>
                  <q-input
                    :rules="[val => !!val || 'This Field is required']"
                    style="width: 100px"
                    outlined
                    type="float"
                    prefix="₹"
                    v-model="item.unitCost"
                  ></q-input>
                </td>
                <td>
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  style="width: 100px" outlined type="number" v-model="item.quantity"></q-input>
                </td>
                <td>
                  <p>{{ $n(item.unitCost * item.quantity, 'currency') }}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="q-pa-md">
            <q-separator block />
          </div>
          <div class="row q-ml-lg q-mr-lg">
            <div class="col-4">
              <div class="row items-center">
                <div>IGST (%)</div>
                <q-input
                  class="q-ml-lg"
                  @change="igstChanged"
                  style="width: 100px"
                  v-model="formData.igst"
                  outlined
                  type="text"
                ></q-input>
              </div>
            </div>
            <div class="col-4">
              <div class="row items-center">
                <div>CGST (%)</div>
                <q-input class="q-ml-lg"
                  @change="cgstChanged"
                  style="width: 100px"
                  v-model="formData.cgst"
                  outlined
                  type="text"
                ></q-input>
              </div>
            </div>
            <div class="col-4">
              <div class="row items-center">
                <div>SGST (%)</div>
                <q-input class="q-ml-lg"
                  @change="sgstChanged"
                  style="width: 100px"
                  v-model="formData.sgst"
                  outlined
                  type="text"
                ></q-input>
              </div>
            </div>
          </div>
          <div class="q-pa-md">
            <q-separator block />
          </div>
          <div class="row">
            <div class="col-7 q-pl-md q-pb-md">
              <p>Notes</p>
              <q-editor
                v-model="formData.terms"
                :toolbar="[['unordered', 'ordered']]"
                min-height="5rem"
                placeholder="Notes-any relevant information not covered, additionl terms and conditions"
              />

              <!-- <q-input
                outlined
                type="textarea"
                placeholder="Notes-any relevant information not covered, additionl terms and conditions"
              ></q-input>-->
            </div>
            <div class="col-5 q-pa-lg">
              <table class="q-table">
                <tbody>
                  <tr>
                    <td class="text-right">Subtotal</td>
                    <td class="text-right">{{ $n(subTotal, 'currency') }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">IGST (%)</td>
                    <td class="text-right">{{ $n(igstAmount, 'currency') }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">CGST (%)</td>
                    <td class="text-right">{{ $n(cgstAmount, 'currency') }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">SGST (%)</td>
                    <td class="text-right">{{ $n(sgstAmount, 'currency') }}</td>
                  </tr>
                  <!-- <tr>
                    <td class="text-right">Paid to Date</td>
                    <td class="text-right">{{ $n(0.00, 'currency') }}</td>
                  </tr> -->
                  <tr>
                    <td class="text-bold text-right">Balance Due</td>
                    <td
                      class="text-bold text-right"
                    >{{ $n(subTotal + igstAmount + cgstAmount + sgstAmount, 'currency') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </q-card>
        <div class="q-mt-xl">
        <q-btn label="Generate" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
              <!-- <q-btn color="negative" @click="cancel()" label="Cancel" /> -->
      </div>
      </div>

      <!-- <div class="q-pa-lg">
      <q-separator block />
      </div>-->
    </div>
    </q-form>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import { date, Notify } from 'quasar'
import Accounts from '../mixins/accounts'
import Clients from '../mixins/clients'
import Permits from '../mixins/permits'
import Orders from '../mixins/orders'
import { insertString } from '../utils/gql'

export default {

  mixins: [
    Accounts({}),
    Clients,
    Permits({
      skip () {
        return !this.account || !this.client
      },
      variables () {
        const obj = {
          limit: 50,
          where: {
            account_id: {
              _eq: this.account.id
            },
            client_id: {
              _eq: this.client.id
            }
          }
        }

        if (this.permitFilter) {
          obj.where.permit_number = {
            _ilike: `%${this.permitFilter}%`
          }
        }

        return obj
      }
    }),

    Orders({
      skip () {
        return !this.account || !this.client
      },
      variables () {
        const obj = {
          limit: 50,
          where: {
            account_id: {
              _eq: this.account.id
            },
            client_id: {
              _eq: this.client.id
            }
          }
        }

        if (this.orderFilter) {
          obj.where.order_number = {
            _ilike: `%${this.orderFilter}%`
          }
        }

        return obj
      }
    })
  ],

  created () {
    if (this.permit) {
      this.formData.permit_number = this.permit.permit_number
      this.formData.startDate = this.permit.fromDate
      this.formData.endDate = this.permit.toDate
      this.account = this.permit.account
      this.onAccountSelected(this.account)

      this.items = [
        {
          name: 'Transportation Services',
          description: '',
          unitCost: 0,
          quantity: this.permit.quantity
        },
        {
          name: 'Shortages',
          description: '',
          unitCost: 0,
          quantity: 0
        }
      ]
    }

    if (this.order) {
      this.formData.order_number = this.order.order_number
      this.formData.startDate = this.order.start_date
      this.formData.endDate = this.order.end_date
      this.account = this.order.account
      this.onAccountSelected(this.account)

      this.items = [
        {
          name: 'Transportation Services',
          description: '',
          unitCost: 0,
          quantity: this.order.quantity
        },
        {
          name: 'Shortages',
          description: '',
          unitCost: 0,
          quantity: 0
        }
      ]
    }
  },

  props: {
    permit: {
      type: Object
    },

    order: {
      type: Object
    }
  },

  data () {
    return {
      formData: {
        invoiceDate: date.formatDate(Date.now(), 'DD-MM-YYYY'),
        startDate: date.formatDate(Date.now(), 'DD-MM-YYYY'),
        endDate: date.formatDate(Date.now(), 'DD-MM-YYYY'),
        invoiceNo: '',
        permit_number: '',
        order_number: '',
        terms: '',
        igst: 0,
        cgst: 0,
        sgst: 0
      },

      items: [
        {
          name: 'Transportation Services',
          description: '',
          unitCost: 0,
          quantity: 0
        },
        {
          name: 'Shortages',
          description: '',
          unitCost: 0,
          quantity: 0
        }
      ],

      client: null,
      account: null
    }
  },

  computed: {
    ...mapState('store', ['userDetails']),

    igstAmount () {
      return (this.subTotal * this.formData.igst) / 100
    },
    cgstAmount () {
      return (this.subTotal * this.formData.cgst) / 100
    },
    sgstAmount () {
      return (this.subTotal * this.formData.sgst) / 100
    },
    subTotal () {
      let amount = 0
      for (let item of this.items) {
        amount += item.quantity * item.unitCost
      }

      return amount
    },
    permitsAndOrders () {
      let orderData = this.orders.length ? this.orders.map(order => {
        return {
          id: order.id,
          value: order.order_number,
          type: 'order'
        }
      }) : []

      return [...orderData]
    }
  },

  methods: {

    igstChanged () {
      this.formData.cgst = this.formData.sgst = 0
    },

    cgstChanged () {
      this.formData.igst = 0
    },

    sgstChanged () {
      this.formData.igst = 0
    },

    onAccountSelected (value) {
      console.log('onaccountselected', this.client)

      this.formData.terms = value.terms
      if (this.client) {
        if (value.state !== this.client.state) {
          this.formData.igst = value.igst || 0
        } else {
          this.formData.cgst = value.cgst || 0
          this.formData.sgst = value.sgst || 0
        }
      }
    },
    onPermitOrOrderSelected (value) {
      let selected = this.permitsAndOrders.find(data => data.value === value)
      let type = selected['type']

    },

    onClientSelected (value) {
      console.log('onclientselected', this.account, this.formData)
      if (this.account) {
        if (value.state !== this.account.state) {
          this.formData.igst = this.account.igst || 0
        } else {
          this.formData.cgst = this.account.cgst || 0
          this.formData.sgst = this.account.sgst || 0
        }
      }
    },

    cancel () {
      this.$router.go(-1)
    },

    async createInvoice () {
      const invoice = this.formData

      invoice.client_id = this.client.id
      invoice.mode = 'cash'
      invoice.status = 0
      var dateParts = invoice.invoiceDate.split('-')
      invoice.created_at = new Date(dateParts[2], dateParts[1] - 1, dateParts[0])
      invoice.company_id = this.userDetails.company_id
      invoice.account_id = this.account.id
      invoice.igst = this.formData.igst
      invoice.sgst = this.formData.sgst
      invoice.cgst = this.formData.cgst
      invoice.invoice_number = invoice.invoiceNo
      invoice.order_number = invoice.order_number || invoice.permit_number
      invoice.quantity = this.items[0].quantity
      invoice.terms = this.formData.terms

      // delete invoice.invoiceNo
      delete invoice.startDate
      delete invoice.endDate
      delete invoice.permit_number
      // delete invoice.invoiceDate

      // Call to the graphql mutation
      this.$apollo.mutate({
      // Query
        mutation: insertString('invoices', `affected_rows`, true),
        // Parameters

        variables: {
          objects: invoice,
          on_conflict: {
            constraint: 'invoices_pkey',
            update_columns: ['bank_name']
          }
        }
      }).then((data) => {
        // Result
        console.log(data)
        Notify.create({
          message: 'Successfully created',
          color: 'positive',
          icon: 'info'
        })
      })
    },

    async onSubmit () {
      console.log(this.userDetails)

      try {
        await this.createInvoice()
      } catch (err) {
        console.error(err)
        return Notify.create({
          message: err.message,
          color: 'negative',
          icon: 'warning'
        })
      }
      const invoice = this.formData

      invoice.client = this.client
      invoice.client_id = this.client.id
      invoice.mode = 'cash'
      invoice.status = 0

      invoice.invoiceDate = date.formatDate(
        date.extractDate(invoice.invoiceDate, 'DD-MM-YYYY'),
        'DD MM YYYY'
      )
      invoice.created_at = invoice.invoiceDate
      invoice.company_id = this.userDetails.company_id
      invoice.account = this.account
      invoice.account_id = this.account.id
      invoice.igst = this.formData.igst
      invoice.sgst = this.formData.sgst
      invoice.cgst = this.formData.cgst

      invoice.startDate = date.formatDate(
        date.extractDate(invoice.startDate, 'DD-MM-YYYY'),
        'DD MM YYYY'
      )

      invoice.endDate = date.formatDate(
        date.extractDate(invoice.endDate, 'DD-MM-YYYY'),
        'DD MM YYYY'
      )
      invoice.items = this.items
      invoice.invoice_number = invoice.invoiceNo
      invoice.order_number = invoice.order_number || invoice.permit_number
      invoice.quantity = this.items[0]

      // this.$router.go(-1)
      this.$router.push({ name: 'invoicepdf', params: { invoice: invoice } })
    },

    onReset () {
      const resp = this.data()
      this.formData = resp.formData
      this.account = resp.account
      this.client = resp.client
      this.items = resp.items
    }
  }
}
</script>

<style lang="stylus">
.myInput {
  width: 240px;
  text-align: center;
}

#container {
  text-align: center;
}

thead {
  background-color: $grey-14;
  color: white;
}
</style>
