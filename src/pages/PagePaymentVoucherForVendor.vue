<template>
  <div class="q-pa-sm">
      <div class="container">
        <div class="text-weight-medium text-center">
          Payment Vocher
        </div>
        <div class="text-h5 text-center text-weight-bold">
          {{payment.account.name.toUpperCase()}}
        </div>
        <div class="address text-center">
          <div>{{payment.account.address1}}</div>
          <div>{{payment.account.address2}}</div>
        </div>

        <div class="row q-pa-sm">
          <div class="col-6">
              <span class="text-left text-bold">Vocher No : </span>
              <span class="text-left">{{payment.id}}</span>
          </div>

          <div class="col-6">
              <span class="text-left text-bold">Vocher Date :  </span>
              <span class="text-left">{{ formatDate(payment.created_at) }}</span>
          </div>
        </div>

         <div class="row q-pa-sm">
          <div class="col-6">
              <span class="text-left text-bold">Paid To :  </span>
              <span class="text-left">{{ payment.vendor.name.toUpperCase()}}</span>
          </div>

          <div class="col-6">
              <span class="text-left text-bold">Pancard No : </span>
              <span class="text-left">{{ payment.vendor.gstn_pan }}</span>
          </div>
        </div>

        <!-- <q-separator color="grey" inset/> -->
        <table class="q-table main-table">
          <thead>
            <tr>
              <th class="text-left text-bolder">Souce-Dest.</th>
              <th style="border-right: 0px solid grey;"></th>
              <th class="text-middle text-bold">{{ i3ms ? 'TP No' : 'Challan No'}}</th>
              <th class="text-right text-bold">Loading Dt</th>
              <th class="text-right text-bold">Vehicle No</th>
              <th class="text-right text-bold">Qty</th>
              <th class="text-right text-bold">Rate</th>
              <th class="text-right text-bold">Gross</th>
              <th class="text-right text-bold">Cash</th>
              <th class="text-right text-bold">Bank</th>
              <th class="text-right text-bold">Diesel</th>
              <th class="text-right text-bold">Short</th>
              <th class="text-right text-bold">Comm</th>
              <th class="text-right text-bold">Other</th>
              <th class="text-right text-bold">Net</th>
            </tr>
          </thead>
          <tbody class="q-pt-md q-pa-sm">
            <tr v-for="trip in paying_trips" :key="trip.tp_number">
              <td class="text-left" colspan="2">{{ i3ms ? trip.permit.source_destination :  trip.order.source_destination }}</td>
              <td class="text-right">{{ i3ms ? trip.tp_number : trip.invoice_number }}</td>
              <td class="text-right">{{ formatDate(trip.tp_date || trip.trip_date) }}</td>
              <td class="text-right">{{ trip.truck_number }}</td>
              <td class="text-right">{{ qty(trip).toFixed(2) }}</td>
              <td class="text-right">{{ i3ms ? trip.permit.owner_rate_per_tonne : trip.order.owner_rate_per_tonne }}</td>
              <td class="text-right">{{ gross(trip).toFixed(2) }}</td>
              <td class="text-right">{{ totalAdvance(trip) }}</td>
              <td class="text-right">0</td>
              <td class="text-right">{{ totalFuel(trip) }}</td>
              <td class="text-right">{{ shortageAmount(trip).toFixed(2) }}</td>
              <td class="text-right">{{ trip.discount }}</td>
              <td class="text-right">0</td>
              <td class="text-right">{{ net(trip).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="row border-bottom q-pa-sm">
          <div class="col-4">
              <span class="text-left text-bold">Total trips : </span>
              <span class="text-left">{{ paying_trips.length }}</span>
          </div>
          <div class="col-2">
              <span class="text-left text-bold">Tonne : </span>
              <span class="text-left">{{ totalQuantity.toFixed(2) }}</span>
          </div>
          <div class="col-2">
              <span class="text-left text-bold">Gross : </span>
              <span class="text-left"> {{ $n(totalGross, 'currency') }}</span>
          </div>
          <div class="col-2">
              <span class="text-left text-bold">Ded : </span>
              <span class="text-left">{{ $n(totalDeduction, 'currency') }}</span>
          </div>
          <div class="col-2">
              <span class="text-left text-bold">Net : </span>
              <span class="text-left">{{ $n(totalNet, 'currency') }}</span>
          </div>
        </div>
        <div class="row q-pa-sm">
            <div class="col-6">
            </div>
            <div class="col-2">
                <span class="text-left text-bold">Tds (%) : </span>
                <span class="text-left text-bold">{{ payment.gst_tds.toFixed(2) }}</span>
            </div>
            <div class="col-2">
                <span class="text-left text-bold">Tdsamt : </span>
                <span class="text-left text-bold">{{ tds }}</span>
            </div>
            <div class="col-2">
              <span class="text-left text-bold">Net : </span>
              <span class="text-left text-bold">{{ $n(afterTds, 'currency') }}</span>
      </div>
        </div>
         <div class="row q-pa-sm">
            <div class="col-3">
                <span class="text-left text-bold">Paymode : </span>
                <span class="text-left">{{payment.mode ? (payment.mode == 'cash' ? 'CASH' : 'NEFT') : ''}}</span>
            </div>
            <div class="col-3">
                <span class="text-left text-bold">Bank : </span>
                <span class="text-left">{{ payment.bank_name }}</span>
            </div>
            <div class="col-3">
              <span class="text-left text-bold">Cheque No : </span><span>{{ payment.transaction_ref }}</span>
            </div>
            <div class="col-3">
              <span class="text-left text-bold">Cheque Date : </span><span>{{ formatDate(payment.payment_date) }}</span>
            </div>
        </div>
        <div class="row q-pa-sm border-bottom q-mt-md">
          <div class="col-8">
              <span class="text-left text-bold">Amount In Words: </span>
              <span>{{ totalNet | toWords }} Only</span>
          </div>
          <div class="col-4">
          </div>
        </div>
      <div class="row q-mt-lg">
        <div class="col-3 text-bold">
          Prepared By
        </div>
        <div class="col-3 text-bold">
          Verified By
        </div>
        <div class="col-3  text-bold">
          Authorised Signature
        </div>
        <div class="col-3 text-bold">
          Received By
        </div>
      </div>
      <div id="container" class="q-ma-xl">
        <q-btn color="primary" @click="printPdf" icon-right="print" label="Print" />
      </div>
    </div>
  </div>
</template>

<script>

import converter from '../utils/currency_to_words'
import moment from 'moment'
import PaymentVoucher from '../mixins/payment_voucher'

export default {
  props: {
    payment: {
      required: true
    }
  },

  mixins: [
    PaymentVoucher
  ],

  created () {
    this.paying_trips = this.payment.trips
    this.owner = this.payment.owner

    if (!this.paying_trips.length) {
      this.paying_trips = this.payment.normal_trips
      this.i3ms = false
    }
  },

  filters: {
    toWords: function (value) {
      if (!value) return ''
      return converter(value)
    }
  },

  data () {
    return {
      owner: null
    }
  },

  methods: {

    printPdf () {
      window.print()
    },

    formatDate (date) {
      if (!date) return ''
      return moment(date).format('DD/MM/YYYY')
    }
  }
}

</script>
<style lang="scss">

.container{
  font-family: 'Times New Roman', Times, serif;
}

.main-table {
  padding: 5px;
  border-top: 1px solid grey;
  border-bottom: 1px solid grey;
}

.border-bottom {
  border-bottom: 1px solid grey;
}

.main-table th {
  border-right: 1px solid grey;
  border-bottom: 1px solid grey;
}

#container {
  text-align: center;
}

@media print {
  .q-header,
  .q-drawer-container {
    display: none;
  }
  .q-page-container {
    padding: 0px !important;
  }
  .q-btn{
    display: none;
  }
  .container{
    -webkit-print-color-adjust: exact;
  }
}
</style>
