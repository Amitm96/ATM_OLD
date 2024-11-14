<template>
  <div class="q-pa-md">
    <div class="container q-px-md">
      <div class="row">
        <table class="q-table">
          <tbody>
            <tr>
              <td class="text-bold">{{ invoice.account.name.toUpperCase() }}</td>
            </tr>
            <tr>
              <td>{{ invoice.account.address1 }},</td>
            </tr>
            <tr>
              <td>{{ invoice.account.address2 }}</td>
            </tr>
            <tr>
              <td>{{ address3(invoice.account) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="row">
        <table class="q-table">
          <tbody class="float-right">
            <tr>
              <td class="text-left">Invoice No :</td>
              <td class="text-left">#{{ invoice.invoice_number }}</td>
            </tr>
            <tr>
              <td class="text-left">Invoice Date :</td>
              <td class="text-left">{{ invoice.created_at }}</td>
            </tr>
            <!-- <tr>
              <td class="text-left">Balance Due :</td>
              <td class="text-left">{{ $n(totalBalance, 'currency') }}</td>
            </tr> -->
          </tbody>
        </table>
      </div>
      <div class="row">
        <table class="q-table">
          <tbody>
            <tr>
              <td class="text-bold">{{ invoice.client.name.toUpperCase() }}</td>
            </tr>
            <tr>
              <td>{{ invoice.client.address1 }},</td>
            </tr>
            <tr>
              <td>{{ invoice.client.address2 }}</td>
            </tr>
              <tr>
              <td>{{ address3(invoice.client) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <table class="q-table q-pb-xl q-pa-md">
        <thead class="header">
          <tr>
            <th class="text-left text-weight-bolder">Item</th>
            <th class="text-right text-bold">HSN Code</th>
            <th class="text-right text-bold">Unit Cost</th>
            <th class="text-right text-bold">Quantity</th>
            <th class="text-right text-bold">Line Total</th>
          </tr>
        </thead>
        <tbody class="q-pt-xl q-pa-md">
          <tr v-for="(item, index) in invoice.items" :key="index">
            <td class="text-left">{{ item.name }}</td>
            <td class="text-right">{{ item.description }}</td>
            <td class="text-right">{{ $n(item.unitCost, 'currency') }}</td>
            <td class="text-right">{{ $n(item.quantity) }}</td>
            <td class="text-right">{{ $n(itemAmount(item), 'currency') }}</td>
          </tr>
        </tbody>
      </table>

      <div class="row q-pd-md">
        <div class="col-8">
          <table class="q-table">
            <tbody>
              <tr>
                <td class="text-bold">Terms</td>
              </tr>
              <tr class="custom" style="height:2px;" v-html="invoice.account.terms"></tr>
            </tbody>
          </table>
        </div>
        <div class="col-4 q-pl-lg q-pr-sm">
          <table class="q-table">
            <tbody>
              <tr>
                <td class="text-left text-bold">Subtotal</td>
                <td class="text-right text-bold">{{ $n(subTotal, 'currency') }}</td>
              </tr>
              <tr>
                <td class="text-left">IGST</td>
                <td class="text-right">{{ $n(igstAmount, 'currency') }}</td>
              </tr>
              <tr>
                <td class="text-left">CGST</td>
                <td class="text-right">{{ $n(cgstAmount, 'currency') }}</td>
              </tr>
              <tr>
                <td class="text-left">SGST</td>
                <td class="text-right">{{ $n(sgstAmount, 'currency') }}</td>
              </tr>
              <tr class="grand">
                <td class="text-left text-bold">Grandtotal</td>
                <td class="text-right text-bold">{{ $n(totalBalance, 'currency') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="row q-pt-lg">
        <table class="q-table">
          <tbody class="float-right text-bold">
            <tr>
              <td>For {{ invoice.account.name.toUpperCase() }}</td>
            </tr>
            <tr class="text-center">
              <td class="text-caption">Signature</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div id="container" class="q-ma-xl">
      <q-btn color="primary" @click="printPdf()" icon-right="print" label="Print" />
    </div>
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex'

export default {

  props: {
    invoice: {
      type: Object
    }
  },

  // async created () {
  //   console.log(this.$route.params, this.invoices)
  //   this.invoice = this.invoices.find(inv => inv.invoiceNo === this.$route.params.invoice)
  //   console.log(this.invoice)
  // },

  // data () {
  //   return {
  //     invoice: {}
  //   }
  // },

  computed: {
    ...mapState('store', ['invoices', 'userDetails']),

    igstAmount () { return this.subTotal * this.invoice.igst / 100 },

    cgstAmount () { return this.subTotal * this.invoice.cgst / 100 },

    sgstAmount () { return this.subTotal * this.invoice.sgst / 100 },

    subTotal () {
      let amount = 0
      for (let item of this.invoice.items) {
        amount += item.quantity * item.unitCost
      }

      return amount
    },

    totalBalance () {
      return this.subTotal + this.igstAmount + this.cgstAmount + this.sgstAmount
    }
  },

  methods: {
    ...mapActions('store', ['getAll']),
    printPdf () {
      window.print()
    },

    address3 (obj) {
      return `${obj.city}, ${obj.state} - ${obj.pincode}`
    },

    itemAmount (item) {
      return item.unitCost * item.quantity
    }
  }
}
</script>

<style lang="scss">
#container {
  text-align: center;
}

thead {
  background-color: $grey-13;
}
.grand {
  background-color: $grey-13;
}
.q-table tbody td {
  height: 5px;
}
@media print {
  .q-header,
  .q-drawer {
    display: none;
  }
  thead,
  .grand {
    -webkit-print-color-adjust: exact;
  }
}
</style>
