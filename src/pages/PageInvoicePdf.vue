<template>

  <div>
    <div class="q-pa-sm">
      <div class="container q-px-sm">
        <div class="row">
          <div class="col-3"></div>
          <div class="col-6">
            <div class="main-header text-h5 text-center" contenteditable>
              TAX INVOICE
            </div>
          </div>
          <div class="col-3">
            <div class="original">
              <div class="q-pa-sm">
                  <div class="text-center text-h6 original-text" contenteditable>ORIGINAL</div>
                  <div class="text-center text-bold" contenteditable>For Recipient</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-4">
            <div class="text-bold q-pa-xs">To,</div>
            <div class="text-bold q-pa-xs" contenteditable>{{ invoice.client.name.toUpperCase() }}</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address1 }},</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address2 }},</div>
            <div class="q-pa-xs" contenteditable>{{ address3(invoice.client) }}</div>
            <table class="q-table align-left">
              <tbody>
              <tr>
                  <td class="text-left text-bold">GST NO </td>
                  <td class="text-left" contenteditable>{{ invoice.client.gstn }}</td>
                </tr>
                <tr>
                  <td class="text-left text-bold">Ref </td>
                  <td class="text-left" contenteditable></td>
                </tr>
                <tr>
                  <td class="text-left text-bold">Date </td>
                  <td class="text-left" contenteditable>{{ invoice.created_at }}</td>
                </tr>
                <tr>
                  <td class="text-left text-bold">PO Number</td>
                  <td class="text-left" contenteditable></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-8">
            <div class="row">
              <div class="col-6">
                <table class="q-table align-left">
                  <tbody>
                  </tbody>
                </table>

              </div>
              <div class="col-6">
                <table class="q-table align-right">
                  <tbody>
                    <tr>
                      <td class="text-left text-bold">Invoice No </td>
                      <td class="text-left" contenteditable>#{{ invoice.invoice_number }}</td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">Invoice Date </td>
                      <td class="text-left" contenteditable>{{ invoice.created_at }}</td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">Contact</td>
                      <td class="text-left" contenteditable></td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">Email</td>
                      <td class="text-left" contenteditable></td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">PAN No</td>
                      <td class="text-left" contenteditable></td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">CIN No</td>
                      <td class="text-left" contenteditable></td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">GSTIN Is</td>
                      <td class="text-left" contenteditable>{{ invoice.account.gstn}}</td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">Vendor Code</td>
                      <td class="text-left" contenteditable></td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
        <q-separator color="grey" inset/>
        <!-- <div class="row q-pa-sm">
          <div class="col-4">
          <div class="q-pa-xs">Customer Name</div>
          <div class="text-bold q-pa-xs" contenteditable>{{ invoice.client.name.toUpperCase() }}</div>
          <div class="q-pa-xs">Customer GSTIN</div>
          <div class="text-bold q-pa-xs" contenteditable>{{ invoice.client.gstn.toUpperCase() }}</div>
          </div>
          <div class="col-4">
            <div class="q-pa-xs">Billing Address</div>
            <div class="q-pa-xs text-bold" contenteditable>{{ invoice.client.name.toUpperCase() }}</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address1 }},</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address2 }},</div>
            <div class="q-pa-xs" contenteditable>{{ address3(invoice.client) }}</div>
          </div>
          <div class="col-4">
            <div class="q-pa-xs">Shipping Address</div>
            <div class="q-pa-xs text-bold" contenteditable>{{ invoice.client.name.toUpperCase() }}</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address1 }},</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address2 }},</div>
            <div class="q-pa-xs" contenteditable>{{ address3(invoice.client) }}</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.gstn }}</div>
          </div>
        </div> -->
        <q-separator color="grey" inset/>
        <div class="row q-pa-sm">
          <div class="col-4">
            <table class="q-table">
              <tbody>
                <tr>
                  <td class="text-bold text-left">Place of Supply :</td>
                  <td class="text-left" contenteditable>{{ invoice.client.state }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-4">
              <table class="q-table">
              <tbody>
                <tr>
                  <td class="text-bold text-left">Due Date :</td>
                  <td class="text-left" contenteditable></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <q-separator color="grey" inset/>
        <table class="q-table q-pb-md q-pa-md">
          <thead class="header">
            <tr>
              <th class="text-left text-weight-bolder">Item</th>
              <th class="text-right text-bold">Quantity</th>
              <th class="text-right text-bold">Rate/Item</th>
              <th class="text-right text-bold">Taxable Value</th>
              <th class="text-right text-bold">CGST</th>
              <th class="text-right text-bold">SGST</th>
              <th class="text-right text-bold">IGST</th>
              <th class="text-right text-bold">Total</th>
            </tr>
          </thead>
          <tbody class="q-pt-xl q-pa-md">
            <tr v-for="(item, index) in invoice.items" :key="index">
              <td class="text-left"  contenteditable>{{ item.name }}</td>
              <td class="text-right" contenteditable>{{ $n(item.unloadedQty) }}</td>
              <td class="text-right" contenteditable>{{ $n(item.unitCost, 'currency') }}</td>
              <td class="text-right" contenteditable>{{ $n(item.unitCost * item.unloadedQty - ((item.loadedQty - item.unloadedQty) > item.shortageAllowance * item.loadedQty / 100 ?  ((item.loadedQty - item.unloadedQty - item.shortageAllowance * item.loadedQty / 100) * item.shortageCost): 0), 'currency') }}</td>
            </tr>
            <tr class="total-line">
              <td class="text-right"></td>
              <td class="text-right text-subtitle2">Total</td>
              <td class="text-right"></td>
              <td class="text-right text-subtitle2" contenteditable> {{ $n(subTotal, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(cgstAmount, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(sgstAmount, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(igstAmount, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(totalBalance, 'currency') }}</td>
            </tr>
          </tbody>
        </table>

        <div class="row q-pd-md">
          <div class="col-7">

          </div>
          <div class="col-5 q-pl-lg q-pr-sm">
            <table class="q-table">
              <tbody>
                <tr>
                  <td class="text-left">Taxable Amount</td>
                  <td class="text-right" contenteditable>{{ $n(subTotal, 'currency') }}</td>
                </tr>
                <tr>
                  <td class="text-left">Total Tax</td>
                  <td class="text-right" contenteditable>{{ $n(igstAmount, 'currency') }}</td>
                </tr>
                <tr>
                  <td class="text-left">Rounding off</td>
                  <td class="text-right" contenteditable>{{ $n(cgstAmount, 'currency') }}</td>
                </tr>
                <tr class="grand">
                  <td class="text-left text-bold">Total Value</td>
                  <td class="text-right text-bold" contenteditable>{{ $n(totalBalance, 'currency') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="row">
          <div class="col-4"></div>
          <div class="col-8">
            <table class="q-table">
              <tbody>
                <tr class="text-right">
                  <td class="text-right q-pl-xl">Total Amount(In Words)</td>
                  <td class="text-left text-body1" contenteditable>{{ priceInWords(totalBalance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="row q-pt-sm">
          <div class="col-8 bank-details">
                <div class="text-bold q-pa-md">
                    Bank Details :
                </div>
                <div class="row">
                  <div class="col-6">
                    <table class="q-table">
                      <tbody>
                        <tr class="q-pb-xs">
                          <td class="text-left text-bold">Account Number</td>
                          <td class="text-left" contenteditable>123456789</td>
                        </tr>
                        <tr class="q-pb-xs">
                          <td class="text-left text-bold">Bank Name</td>
                          <td class="text-left" contenteditable>State Bank of India</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="col-6">
                    <table class="q-table">
                      <tbody>
                        <tr>
                          <td class="text-left text-bold">IFSC</td>
                          <td class="text-left" contenteditable>SBIN0001234</td>
                        </tr>
                        <tr>
                          <td class="text-left text-bold">Branch</td>
                          <td class="text-left" contenteditable>Guntur</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <!-- <table class="q-table">
                  <tbody>
                    <tr class="q-pb-xs">
                      <td class="text-left text-bold">Account Number</td>
                      <td class="text-left">123456789</td>
                      <td class="text-left text-bold">IFSC</td>
                      <td class="text-left">SBIN0001234</td>
                    </tr>
                    <tr class="q-pb-xs">
                      <td class="text-left text-bold">Bank Name</td>
                      <td class="text-left">State Bank of India</td>
                      <td class="text-left text-bold">Branch</td>
                      <td class="text-left">Guntur</td>
                    </tr>
                  </tbody>
                </table> -->
          </div>
          <div class="col-4">
            <table class="q-table q-pt-xl">
            <tbody class="float-right text-bold">
              <tr>
                <td contenteditable>For {{ invoice.account.name.toUpperCase() }}</td>
              </tr>
              <tr class="text-center">
                <td class="text-caption">Authorised Signatory</td>
              </tr>
            </tbody>
          </table>
          </div>
          <div class="row">
            <table class="q-table">
              <tbody>
                <tr>
                  <td class="text-bold">Terms</td>
                </tr>
                <tr class="custom" style="height:2px;" v-html="invoice.account.terms"></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <q-separator color="grey" inset/>
    <div class="q-pa-sm pagebreak">
      <div class="container q-px-sm">
        <div class="row">
          <div class="col-3"></div>
          <div class="col-6">
            <div class="main-header text-h5 text-center" contenteditable>
              COMMERCIAL INVOICE
            </div>
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-4">
            <div class="text-bold q-pa-xs">To,</div>
            <div class="text-bold q-pa-xs" contenteditable>{{ invoice.client.name.toUpperCase() }}</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address1 }},</div>
            <div class="q-pa-xs" contenteditable>{{ invoice.client.address2 }},</div>
            <div class="q-pa-xs" contenteditable>{{ address3(invoice.client) }}</div>
            <table class="q-table align-left">
              <tbody>
                <tr>
                  <td class="text-left text-bold">Ref </td>
                  <td class="text-left" contenteditable></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-8">
            <div class="row">
              <div class="col-6">
                <table class="q-table align-left">
                  <tbody>
                  </tbody>
                </table>

              </div>
              <div class="col-6">
                <table class="q-table align-right">
                  <tbody>
                    <tr>
                      <td class="text-left text-bold">Invoice No </td>
                      <td class="text-left" contenteditable>#{{ invoice.invoice_number }}</td>
                    </tr>
                    <tr>
                      <td class="text-left text-bold">Invoice Date </td>
                      <td class="text-left" contenteditable>{{ invoice.created_at }}</td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
        <q-separator color="grey" inset/>
        <div class="row q-pa-sm">
          <div class="col-12">
            <table class="q-table">
              <tbody>
                <tr>
                  <td class="text-left">Sub :</td>
                  <td class="text-left" contenteditable> Submission Of Transpotation Frieght From ABC to XYZ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <q-separator color="grey" inset/>
        <div class="row q-pa-sm">
          <div class="col-12" contenteditable>
           Dear Sir,
          </div>
          <div class="col-12" contenteditable>
           We are submitting below Transpotation freight bill, details are as unders
          </div>
        </div>
        <q-separator color="grey" inset/>
        <table class="q-table q-pb-md q-pa-md">
          <thead class="header">
            <tr>
              <th class="text-left text-weight-bolder">Item</th>
              <th class="text-right text-bold">Rate/Item</th>
              <th class="text-right text-bold">Taxable Value</th>
              <th class="text-right text-bold">CGST</th>
              <th class="text-right text-bold">SGST</th>
              <th class="text-right text-bold">IGST</th>
              <th class="text-right text-bold">Total</th>
            </tr>
          </thead>
          <tbody class="q-pt-xl q-pa-md">
            <tr v-for="(item, index) in invoice.items" :key="index">
              <td class="text-left"  contenteditable>{{ item.name }}</td>
              <td class="text-right" contenteditable>{{ $n(item.unitCost, 'currency') }}</td>
              <td class="text-right" contenteditable>{{ $n(item.unitCost * item.unloadedQty - ((item.loadedQty - item.unloadedQty) > item.shortageAllowance * item.loadedQty / 100 ?  ((item.loadedQty - item.unloadedQty - item.shortageAllowance * item.loadedQty / 100) * item.shortageCost): 0), 'currency') }}</td>
            </tr>
            <tr class="total-line">
              <td class="text-right text-subtitle2">Total</td>
              <td class="text-right"></td>
              <td class="text-right text-subtitle2" contenteditable> {{ $n(subTotal, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(cgstAmount, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(sgstAmount, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(igstAmount, 'currency') }}</td>
              <td class="text-right text-subtitle2" contenteditable>{{ $n(totalBalance, 'currency') }}</td>
            </tr>
          </tbody>
        </table>

        <div class="row">
          <div class="col-4"></div>
          <div class="col-8">
            <table class="q-table">
              <tbody>
                <tr class="text-right">
                  <td class="text-right q-pl-xl">Total Amount(In Words)</td>
                  <td class="text-left text-body1" contenteditable>{{ priceInWords(totalBalance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="row q-pt-sm">
          <div class="col-8 bank-details">
                <div class="text-bold q-pa-md">
                    DECLARATION :
                </div>
                <div class="row" contenteditable>
                </div>
          </div>
          <div class="col-8 bank-details">
                <div class="text-bold q-pa-md">
                    Bank Details :
                </div>
                <div class="row" contenteditable>
                </div>
          </div>
          <div class="col-8 bank-details">
                <div class="text-bold q-pa-md">
                    Amount Details :
                </div>
                <div class="row" contenteditable>
                </div>
          </div>
          <div class="col-8 bank-details">
                <div class="text-bold q-pa-md">
                    Notes :
                </div>
                <div class="row" contenteditable>
                </div>
          </div>
        </div>
        <div class="col-4">
            <table class="q-table q-pt-xl">
            <tbody class="float-left text-bold">
              <tr>
                <td contenteditable>For {{ invoice.account.name.toUpperCase() }}</td>
              </tr>
              <tr class="text-center">
                <td class="text-caption">Authorised Signatory</td>
              </tr>
            </tbody>
          </table>
        </div>
      <div id="container" class="q-ma-xl">
        <q-btn color="primary" @click="printPdf()" icon-right="print" label="Print" />
      </div>
      </div>
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
        let shartages = (item.loadedQty - item.unloadedQty) > item.shortageAllowance * item.loadedQty / 100 ? ((item.loadedQty - item.unloadedQty - item.shortageAllowance * item.loadedQty / 100) * item.shortageCost) : 0
        amount += (item.unitCost * item.unloadedQty - shartages)
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
    },

    priceInWords (price) {
      let sglDigit = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
      let dblDigit = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
      let tensPlace = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
      let handleTens = function (dgt, prevDgt) {
        return dgt === 0 ? '' : ' ' + (dgt === 1 ? dblDigit[prevDgt] : tensPlace[dgt])
      }
      let handleUtlc = function (dgt, nxtDgt, denom) {
        return (dgt !== 0 && nxtDgt !== 1 ? ' ' + sglDigit[dgt] : '') + (nxtDgt !== 0 || dgt > 0 ? ' ' + denom : '')
      }

      let str = '',
        digitIdx = 0,
        digit = 0,
        nxtDigit = 0,
        words = []
      price += ''
      if (isNaN(parseInt(price))) str = ''
      else if (parseInt(price) > 0 && price.length <= 10) {
        for (digitIdx = price.length - 1; digitIdx >= 0; digitIdx--) {
          digit = price[digitIdx] - 0
          nxtDigit = digitIdx > 0 ? price[digitIdx - 1] - 0 : 0
          switch (price.length - digitIdx - 1) {
            case 0:
              words.push(handleUtlc(digit, nxtDigit, ''))
              break
            case 1:
              words.push(handleTens(digit, price[digitIdx + 1]))
              break
            case 2:
              words.push(digit !== 0 ? ' ' + sglDigit[digit] + ' Hundred' + (price[digitIdx + 1] !== 0 && price[digitIdx + 2] !== 0 ? ' and' : '') : '')
              break
            case 3:
              words.push(handleUtlc(digit, nxtDigit, 'Thousand'))
              break
            case 4:
              words.push(handleTens(digit, price[digitIdx + 1]))
              break
            case 5:
              words.push(handleUtlc(digit, nxtDigit, 'Lakh'))
              break
            case 6:
              words.push(handleTens(digit, price[digitIdx + 1]))
              break
            case 7:
              words.push(handleUtlc(digit, nxtDigit, 'Crore'))
              break
            case 8:
              words.push(handleTens(digit, price[digitIdx + 1]))
              break
            case 9:
              words.push(digit !== 0 ? ' ' + sglDigit[digit] + ' Hundred' + (price[digitIdx + 1] !== 0 || price[digitIdx + 2] !== 0 ? ' and' : ' Crore') : '')
          }
        }
        str = words.reverse().join('')
      } else str = ''
      return str
    }

  }
}
</script>

<style lang="scss">
.original{
  width: 150px;
  border-style: dashed;
  border-color: grey;
}
.original-text{
  border-bottom: 1px solid grey;
}
#container {
  text-align: center;
}

.total-line{
  background-color: $blue-grey-3;
}
.header{
    background-color: $blue-grey-9;

}
thead {
  background-color: $grey-13;
}

.q-table tbody td {
  height: 5px;
}
.bank-details{
  border-style:solid;
  border-color:#5E5B5B;
  border-width: 1px;
}
img {
  width: 500px;
  height: 450px;
}
@media print {
  .pagebreak { page-break-before: always; }
  .q-header,
  .q-drawer {
    display: none;
  }
  thead,.total-line,.header {
    -webkit-print-color-adjust: exact;
  }
  .q-btn{
    display: none;
  }
  .container{
        -webkit-print-color-adjust: exact;
  }
}
</style>
