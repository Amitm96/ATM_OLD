<template>
  <q-page padding="">

    <div style="max-width: 200px">
      <q-input
        class="q-mb-lg"
        outlined
        v-model="truckNo"
        @keydown.enter="getTpNo"
        label="Truck No" />

      <q-input
        class="q-mb-lg"
        outlined
        v-model="fromDate"
        mask="##/##/####"
        label="From(MM/DD/YYYY)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qfromDateProxy" transition-show="scale" transition-hide="scale">
              <q-date v-model="fromDate" mask="MM/DD/YYYY" @input="() => $refs.qfromDateProxy.hide()" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
            class="q-mb-lg"
        outlined
        v-model="toDate"
        mask="##/##/####"
        label="To(MM/DD/YYYY)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qtoDateProxy" transition-show="scale" transition-hide="scale">
              <q-date v-model="toDate" mask="MM/DD/YYYY" @input="() => $refs.qtoDateProxy.hide()" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-btn color="primary"
          @click="getTpNo"
          label="submit" />

    </div>
    <div class="q-pt-md q-pb-md">
      <q-spinner
        v-if="loading"
        color="primary"
        size="3em"
        :thickness="2"
      />
    </div>

    <q-table
      v-if="!initial"
      title="Transit Pass"
      :data="tableData.data"
      :columns="tableData.columns"
      row-key="name"
    />

  </q-page>
</template>

<script>

import { ipcRenderer } from 'electron'
import { date } from 'quasar'

export default {
  name: 'PageIndex',

  data () {
    return {
      initial: true,
      loading: false,
      truckNo: '',
      toDate: date.formatDate(Date.now(), 'MM/DD/YYYY'),
      fromDate: date.formatDate(date.subtractFromDate(Date.now(), { days: 1 }), 'MM/DD/YYYY'),
      tableData: {
        columns: [
          {
            name: 'Sl.No',
            label: 'Sl.No',
            align: 'left',
            field: 'Sl.No'
          },
          { name: 'Consigner Name', align: 'center', label: 'Consigner Name', field: 'Consigner Name', sortable: true },
          { name: 'Truck Regn. No', label: 'Truck Regn. No', field: 'Truck Regn. No', sortable: true },
          { name: 'Permit No', label: 'Permit No', field: 'Permit No', align: 'left' },
          { name: 'Pass No', label: 'Pass No', field: 'Pass No', align: 'left' },
          { name: 'Pass Validity', field: 'Pass Validity', label: 'Pass Validity', align: 'left' },
          { name: 'Consignee Name', field: 'Consignee Name', label: 'Consignee Name', align: 'left' },
          // { name: 'Destination', field: 'Destination', label: 'Destination' },
          { name: 'Mineral Name', field: 'Mineral Name', label: 'Mineral Name' },
          { name: 'Stack No', field: 'Stack No', label: 'Stack No' },
          { name: 'Minreal Type', field: 'Minreal Type', label: 'Minreal Type' },
          { name: 'Grade', field: 'Grade', label: 'Grade' },
          { name: 'Mineral Qty(Tons)', field: 'Mineral Qty(Tons)', label: 'Mineral Qty(Tons)' },
          { name: 'Transporter Name', field: 'Transporter Name', label: 'Transporter Name' },
          { name: 'Owner Reg.No', field: 'Owner Reg.No', label: 'Owner Reg.No' },
          { name: 'Issued On', field: 'Issued On', label: 'Issued On', align: 'center' }

        ],
        data: [

        ]
      }
    }
  },

  created () {
    ipcRenderer.removeAllListeners('tp-results')
    ipcRenderer.on('tp-results', (event, results) => {
      console.log('received from main process', results)
      this.initial = false
      this.loading = false
      this.tableData.data = results
    })
  },

  methods: {

    getTpNo () {
      console.log(this.fromDate, this.toDate)

      ipcRenderer.removeAllListeners('truck-passes')
      ipcRenderer.send('truck-passes', {
        truckNo: this.truck_number,
        fromDate: this.fromDate,
        toDate: this.toDate
      })

      this.loading = true
    }
  }
}
</script>
