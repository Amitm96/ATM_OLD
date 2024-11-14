<template>
  <q-page padding="">
 <div class="q-pt-md">
      <div class="q-pt-md q-pb-lg">
        <div class="text-subtitle2">Excel Format</div>
        <img
        src="~assets/trucks-excel.png"
        style="max-width:100%;">
      </div>
      <div style="max-width: 300px">
        <q-file
          @input="onFileSelected"
          outlined
          :rules="[val => !!val || 'Field is required']"
          v-model="path"
          accept=".xlsx, .xls"
          label="Add/Update Trucks (Excel)"
        />
      </div>
      <q-table
      dense
      class="q-pt-md"
      :data="trucks"
      :loading="loading"
      :columns="columns"
      :pagination.sync="pagination"
      title="Trucks"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      :selected.sync="selected"
      :filter="filter"
      row-key="truck_number">

      <template v-slot:top>
        <q-btn color="primary" :disable="loading" label="New Truck" to="/newtruck" />
        <!-- <q-btn class="q-ml-sm" color="primary" :disable="loading" label="Remove Selected" @click="removeSelected" /> -->
        <q-btn class="q-ml-md" color="primary" :disable="loading" label="Save" @click="save" />

        <q-space />
        <div class="q-pr-md">
         <q-input
          class="q-pl-md q-pr-md searchBar"
          style="width: 200px"
          clearable
           clear-icon="clear"
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search...">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        </div>
      </template>

        <template v-slot:body-cell-action="props">
            <q-td key="actions" align="center" auto-width no-hover>
              <div class="row">
                <q-btn class="col" size="sm" flat icon="edit" :to="{name: 'edittruck', params: {id: props.row.id, truck: props.row}}">
                  <q-tooltip content-class="bg-primary">Edit</q-tooltip>
                </q-btn>
              </div>
            </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>

import { mapState } from 'vuex'
import { insertString, deleteString, listQuery } from '../utils/gql'

import _ from 'lodash'
import XLSX from 'xlsx'
import { Loading, QSpinnerIos } from 'quasar'

const columns = [
  {
    name: 'truck_number',
    align: 'left',
    label: 'Truck No',
    field: 'truck_number',
    sortable: true
  },
  {
    name: 'ownerName',
    align: 'left',
    label: 'Owner Name',
    field: t => t.owner ? t.owner.name : t.ownerName,
    sortable: true
  },
  {
    name: 'ownerGstnPan',
    align: 'left',
    label: 'Owner GSTN/PAN',
    field: t => t.owner ? t.owner.gstn_pan : t.ownerGstnPan,
    sortable: true
  },
  {
    name: 'ownerPhoneNumber',
    align: 'left',
    label: 'Owner Phone Number',
    field: t => t.owner ? t.owner.phone_number : t.ownerPhoneNumber,
    sortable: true
  },
  { name: 'action',
    align: 'center',
    field: 'id'
  }
]

export default {
  name: 'PageTrucks',

  data () {
    return {
      filter: '',
      selected: [],
      trucks: [],
      loading: false,
      path: null,
      columns,
      pagination: {
        sortBy: 'truck_number',
        descending: false,
        page: 1,
        rowsPerPage: 50,
        rowsNumber: 1
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  apollo: {
    trucks: {
      query: listQuery('trucks', `
        id
        truck_number
        owner {
          id
          name
          phone_number
          gstn_pan
        }
      `),

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data.trucks_aggregate.aggregate.count
        console.log('We got some result!', data, this.pagination)
      },

      variables () {
        const obj = {
          where: { companies_bridge: { company_id: { _eq: this.userDetails.company_id } } }
        }

        if (this.pagination.sortBy) {
          const order = this.pagination.descending ? 'desc_nulls_last' : 'asc_nulls_last'

          obj.order_by = {
            [this.pagination.sortBy]: order
          }

          if (/owner/i.test(this.pagination.sortBy)) {
            if (/name/i.test(this.pagination.sortBy)) {
              obj.order_by = { owner: { name: order } }
            } else if (/phone/i.test(this.pagination.sortBy)) {
              obj.order_by = { owner: { phone_number: order } }
            } else if (/gstn/i.test(this.pagination.sortBy)) {
              obj.order_by = { owner: { gstn_pan: order } }
            }
          }
        }

        if (this.pagination.rowsPerPage) {
          obj.limit = this.pagination.rowsPerPage
          obj.offset = (this.pagination.page - 1) * this.pagination.rowsPerPage
        }

        if (this.filter) {
          obj.where._or = [
            {
              truck_number: {
                _ilike: `%${this.filter}%`
              }
            },
            {
              owner: {
                name: {
                  _ilike: `%${this.filter}%`
                }
              }
            },
            {
              owner: {
                phone_number: {
                  _ilike: `%${this.filter}%`
                }
              }
            },
            {
              owner: {
                gstn_pan: {
                  _ilike: `%${this.filter}%`
                }
              }
            }
          ]
        }

        return obj
      }
    }
  },

  methods: {
    getSelectedString () {
      return this.selected.length === 0 ? '' : `${this.selected.length} truck${this.selected.length > 1 ? 's' : ''} selected of ${this.trucks.length}`
    },

    async onFileSelected (value) {
      this.path = value

      const workbook = XLSX.readFile(this.path.path)
      const sheet = workbook.SheetNames

      let trucks = XLSX.utils.sheet_to_json(workbook.Sheets[sheet[0]], {
        range: 1,
        raw: true,
        defval: null,
        header: [ 'truck_number', 'ownerGstnPan' ]
      })

      trucks.forEach(t => {
        t.dirty = true
      })

      this.trucks = _.unionBy(trucks, this.trucks, 'truck_number')
      console.log(this.trucks)
    },

    onReset () {
      this.path = null
    },

    async save () {
      // Take only dirty ones
      const trucks = this.trucks.filter(t => t.dirty)

      trucks.forEach(t => {
        delete t.dirty
      })

      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      try {
        const response = await this.$apollo.mutate({
          mutation: insertString('trucks', `
            affected_rows
          `, true),

          variables: {
            objects: trucks.map(t => ({
              truck_number: t.truck_number,
              companies_bridge: {
                data: {
                  company_id: this.userDetails.company_id
                },
                on_conflict: {
                  constraint: 'companies_trucks_bridge_company_id_truck_id_key',
                  update_columns: 'truck_id'
                }
              },
              owner: t.ownerGstnPan ? {
                data: {
                  name: t.ownerName,
                  gstn_pan: t.ownerGstnPan,
                  company_id: this.userDetails.company.id
                },
                on_conflict: {
                  constraint: 'owners_gstn_pan_key',
                  update_columns: ['gstn_pan']
                }
              } : null
            })),
            on_conflict: {
              constraint: 'trucks_truck_number_key',
              update_columns: ['owner_id', 'truck_number']
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
          await this.$apollo.mutate({
            mutation: deleteString('trucks', `
              affected_rows
            `),
            variables: {
              where: {
                id: {
                  _in: this.selected.map(t => t.id)
                }
              }
            }
          })

          this.trucks = _.difference(this.trucks, this.selected, v => v.truck_number)

          Loading.hide()
          this.$q.notify({
            message: 'Deleted Successfully',
            color: 'positive',
            icon: 'info'
          })
        } catch (ex) {
          console.log(ex)
          Loading.hide()
          this.$q.notify({
            message: 'Can not delete truck as there are trips attached to it',
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

<style lang="stylus" scoped>
.searchBar {
  background-color #e9ebed;
  border-radius 4px
}
</style>
