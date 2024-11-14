<template>
  <q-page padding="">
 <div class="q-pt-md">

      <div class="q-pt-md q-pb-lg">
        <div class="text-subtitle2">Excel Format</div>
        <img
        src="~assets/clients-excel.png"
        style="max-width:100%;">
      </div>

      <div style="max-width: 250px">
        <q-file
          @input="onFileSelected"
          outlined
          :rules="[val => !!val || 'Field is required']"
          v-model="path"
          accept=".xlsx, .xls"
          label="Add/Update Clients(Excel)"
        />
      </div>
      <q-table
      class="q-pt-md"
      :data="clients"
      :loading="loading"
      :columns="columns"
      :pagination.sync="pagination"
      title="Clients"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      :selected.sync="selected"
      :filter="filter"
      :filter-method="filterInput"
      row-key="gstn">

      <template v-slot:top>
        <q-btn class="q-ml-sm" color="primary" :disable="loading" label="Remove Selected" @click="removeSelected" />
        <q-btn class="q-ml-md" color="primary" :disable="loading" label="Save" @click="save" />

        <q-space />
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
      </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>

import { mapState } from 'vuex'
import { insertString } from '../utils/gql'

import _ from 'lodash'
import XLSX from 'xlsx'
import { Loading, QSpinnerIos } from 'quasar'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Client Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'gstn',
    align: 'left',
    label: 'GSTN/PAN',
    field: 'gstn'
  },
  {
    name: 'phoneNumber',
    align: 'left',
    label: 'Phone Number',
    field: 'phone_number'
  }
]

export default {
  name: 'PageNewClients',

  data () {
    return {
      filter: '',
      selected: [],
      clients: [],
      loading: false,
      path: null,
      columns,
      pagination: {
        rowsPerPage: 50
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {
    getSelectedString () {
      return this.selected.length === 0 ? '' : `${this.selected.length} truck${this.selected.length > 1 ? 's' : ''} selected of ${this.clients.length}`
    },

    async onFileSelected (value) {
      this.path = value

      const workbook = XLSX.readFile(this.path.path)
      const sheet = workbook.SheetNames

      this.clients = XLSX.utils.sheet_to_json(workbook.Sheets[sheet[0]], {
        range: 1,
        raw: true,
        defval: null,
        header: [ 'name', 'gstn', 'phone_number', 'address1', 'address2', 'city', 'state', 'pincode' ]
      })

      this.clients.forEach(client => {
        client.phone_number = '' + client.phone_number
        client.pincode = '' + client.pincode
      })
    },

    onReset () {
      this.path = null
      this.clients = []
    },

    filterInput (rows, terms, cols, getCellValue) {
      console.log('terms', terms)

      terms = terms.toLowerCase()

      return rows.filter(row =>
        row.name.toLowerCase().includes(terms) ||
        row.gstn.toLowerCase().includes(terms) ||
        row.phone_number.includes(terms)
      )
    },

    async save () {
      // Take only dirty ones

      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      try {
        const response = await this.$apollo.mutate({
          mutation: insertString('clients', `
            affected_rows
          `, true),

          variables: {
            objects: this.clients.map(t => ({
              ...t,
              companies_bridge: {
                data: {
                  company_id: this.userDetails.company_id
                },
                on_conflict: {
                  constraint: 'companies_clients_bridge_company_id_client_id_key',
                  update_columns: 'client_id'
                }
              }
            })),
            on_conflict: {
              constraint: 'clients_gstn_key',
              update_columns: ['gstn']
            }
          }
        })

        console.log(response)

        this.$q.notify({
          message: 'Saved successfully',
          color: 'positive',
          icon: 'info'
        })
        this.$router.go(-1)
      } catch (ex) {
        console.error(ex)
        this.$q.notify({
          message: 'Failed to save, some clients not exist',
          color: 'positive',
          icon: 'info'
        })
      }
      Loading.hide()
    },

    removeSelected () {
      if (!this.selected.length) {
        return
      }

      this.$q.dialog({
        title: 'Confirm',
        message: 'Are you sure to delete?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        Loading.show({
          spinner: QSpinnerIos,
          spinnerSize: '2em'
        })

        try {
          this.clients = _.difference(this.clients, this.selected, v => v.gstn)

          Loading.hide()
          this.$q.notify({
            message: 'Deleted Successfully',
            color: 'positive',
            icon: 'info'
          })
        } catch (ex) {
          this.$q.notify({
            message: ex.message,
            color: 'negative',
            icon: 'warning'
          })
        }
      }).onOk(() => {
      }).onCancel(() => {
      })
    }
  }
}
</script>
