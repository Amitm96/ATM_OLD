<template>
  <q-page padding="">
 <div class="q-pt-md">

      <div class="q-pt-md q-pb-lg">
        <div class="text-subtitle2">Excel Format</div>
        <img
        src="~assets/owners-excel.png"
        style="max-width:100%;">
      </div>

      <div style="max-width: 250px">
        <q-file
          @input="onFileSelected"
          outlined
          :rules="[val => !!val || 'Field is required']"
          v-model="path"
          accept=".xlsx, .xls"
          label="Add/Update Owners (Excel)"
        />
      </div>
      <q-table
      class="q-pt-md"
      :data="owners"
      :loading="loading"
      :columns="columns"
      :pagination.sync="pagination"
      title="Owners"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      :selected.sync="selected"
      :filter="filter"
      :filter-method="filterInput"
      row-key="ownerGstnPan">

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
    name: 'ownerName',
    align: 'left',
    label: 'Owner Name',
    field: t => t.owner ? t.owner.name : t.ownerName
  },
  {
    name: 'ownerGstnPan',
    align: 'left',
    label: 'Owner GSTN/PAN',
    field: t => t.owner ? t.owner.gstn_pan : t.ownerGstnPan
  },
  {
    name: 'ownerPhoneNumber',
    align: 'left',
    label: 'Owner Phone Number',
    field: t => t.owner ? t.owner.phone_number : t.ownerPhoneNumber
  },
  {
    name: 'ownerGstTds',
    align: 'left',
    label: 'Owner GST/TDS(%)',
    field: t => t.owner ? t.owner.gst_tds : t.ownerGstTds
  }
]

export default {
  name: 'PageNewOwners',

  data () {
    return {
      filter: '',
      selected: [],
      owners: [],
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
      return this.selected.length === 0 ? '' : `${this.selected.length} truck${this.selected.length > 1 ? 's' : ''} selected of ${this.owners.length}`
    },

    async onFileSelected (value) {
      this.path = value

      const workbook = XLSX.readFile(this.path.path)
      const sheet = workbook.SheetNames

      this.owners = XLSX.utils.sheet_to_json(workbook.Sheets[sheet[0]], {
        range: 1,
        raw: true,
        defval: null,
        header: [ 'ownerName', 'ownerGstnPan', 'ownerPhoneNumber', 'ownerGstTds', 'address1', 'address2', 'city', 'state', 'pincode' ]
      })

      this.owners.forEach(owner => {
        owner.ownerPhoneNumber = '' + owner.ownerPhoneNumber
        owner.pincode = '' + owner.pincode
      })
    },

    onReset () {
      this.path = null
      this.owners = []
    },

    filterInput (rows, terms, cols, getCellValue) {
      console.log('terms', terms)

      terms = terms.toLowerCase()

      return rows.filter(row =>
        row.ownerName.toLowerCase().includes(terms) ||
        row.ownerGstnPan.toLowerCase().includes(terms) ||
        row.ownerPhoneNumber.includes(terms)
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
          mutation: insertString('owners', `
            affected_rows
          `, true),

          variables: {
            objects: this.owners.map(t => ({
              name: t.ownerName,
              gstn_pan: t.ownerGstnPan,
              gst_tds: t.ownerGstTds,
              phone_number: t.ownerPhoneNumber,
              companies_bridge: {
                data: {
                  company_id: this.userDetails.company_id
                },
                on_conflict: {
                  constraint: 'companies_owners_bridge_company_id_owner_id_key',
                  update_columns: 'owner_id'
                }
              },
              address1: t.address1,
              address2: t.address2,
              city: t.city,
              state: t.state,
              pincode: t.pincode
            })),
            on_conflict: {
              constraint: 'owners_gstn_pan_key',
              update_columns: ['gstn_pan']
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
          message: 'Failed to save, some owners not exist',
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
          this.owners = _.difference(this.owners, this.selected, v => v.ownerGstnPan)

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
