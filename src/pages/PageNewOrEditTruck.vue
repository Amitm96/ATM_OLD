<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <div class="q-pa-xl">
      <div class="row">
        <div class="col">
          <div class>
            <q-card flat bordered class="my-card" style="max-width: 500px">
              <q-card-section>
                <!-- <q-input class="q-pt-lg"
                  :rules="[val => !!val || 'This Field is required']"
                  outlined
                  v-model="formData.truckNo"
                  label="Truck Number">
                </q-input>-->
                <q-select
                  outlined
                  v-model="formData.truckNo"
                  use-input
                  :options="trucks"
                  @filter="filterTrucks"
                  @focus="formData.truckNo = ''"
                  hint="Press <Enter> after new value"
                  hide-dropdown-icon
                  emit-value
                  map-options
                  input-debounce="300"
                  label="Truck Number"
                  option-value="truck_number"
                  option-label="truck_number"
                  new-value-mode="add-unique"
                />
              </q-card-section>
              <q-card-section>
                <q-select
                  class
                  outlined
                  v-model="owner"
                  use-input
                  option-label="name"
                  :options="owners"
                  @filter="filterOwners"
                  label="Owner"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-item-label v-html="scope.opt.name" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt.phone_number" />
                        <q-item-label caption>{{ scope.opt.gstn_pan }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>

              <!--
            <div class="q-pa-sm text-h6">Owner Details</div>
            <q-card-section>
                  <q-input
                    outlined
                    v-model="formData.ownerName"
                    label="Name"
                  >
                  </q-input>
            </q-card-section>

            <q-card-section>
                  <q-input
                  outlined v-model="formData.ownerGstnPan" placeholder="PAN/GSTN">
                  </q-input>
            </q-card-section>

            <q-card-section>
                  <q-input
                    outlined
                    maxlength="10"
                    v-model="formData.ownerPhoneNumber"
                    type="number"
                    label="Phone Number"
                  >
                  </q-input>
              </q-card-section>-->
            </q-card>
          </div>
        </div>
      </div>
      <div class="q-mt-xl">
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </div>
  </q-form>
</template>

<style lang="stylus"></style>

<script>
import { mapState } from 'vuex'
import { insertString } from '../utils/gql'
import { Loading, QSpinnerIos } from 'quasar'

import goBack from '../mixins/go-back'
import Owners from '../mixins/owners'
import Trucks from '../mixins/trucks'
import Trucklist from '../mixins/trucklist'

import { getObjectById } from '../utils/util'

export default {
  name: 'NewOrEditTruck',

  props: {
    trucklist: {
      type: Object
    },

    truck: {
      type: Object
    },

    id: {
      type: Number
    }
  },

  mixins: [goBack, Owners({}), Trucks, Trucklist],

  async created () {
    if (!this.truck && this.id) {
      const response = await getObjectById(
        this.$apollo,
        'trucks',
        `
        id
        truck_number
        owner {
          id
          name
          phone_number
          gstn_pan
        }
      `,
        this.id
      )

      this.truck = response.data.trucks[0]
    }

    if (this.truck) {
      this.formData = {
        truckNo: this.truck.truck_number
      }
      this.owner = this.truck.owner
    }
  },

  data () {
    return {
      formData: this.reset(),
      owner: null
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {
    cancel () {
      this.goBack()
    },

    async onSubmit () {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      try {
        if (this.trucklist) {
          await this.insertTruckInTrucklist(this.trucklist, {
            truck_number: this.formData.truckNo,
            owner: this.owner
          })
        } else {
          const response = await this.$apollo.mutate({
            mutation: insertString(
              'trucks',
              `
              affected_rows
            `,
              true
            ),

            variables: this.truck
              ? {
                objects: {
                  id: this.truck.id,
                  companies_bridge: {
                    data: {
                      company_id: this.userDetails.company_id
                    },
                    on_conflict: {
                      constraint:
                          'companies_trucks_bridge_company_id_truck_id_key',
                      update_columns: ['truck_id', 'company_id']
                    }
                  },
                  truck_number: this.formData.truckNo,
                  owner_id: this.owner ? this.owner.id : null
                },
                on_conflict: {
                  constraint: 'trucks_pkey',
                  update_columns: ['truck_number', 'owner_id']
                }
              }
              : {
                objects: {
                  truck_number: this.formData.truckNo,
                  companies_bridge: {
                    data: {
                      company_id: this.userDetails.company_id
                    },
                    on_conflict: {
                      constraint:
                          'companies_trucks_bridge_company_id_truck_id_key',
                      update_columns: ['truck_id', 'company_id']
                    }
                  },
                  owner_id: this.owner ? this.owner.id : null
                },
                on_conflict: {
                  constraint: 'trucks_truck_number_key',
                  update_columns: ['truck_number', 'owner_id']
                }
              }
          })

          console.log(response)
        }

        this.$q.notify({
          message: 'Saved successfully',
          color: 'positive',
          icon: 'info'
        })
        this.goBack()
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

    reset () {
      return {
        truckNo: ''
      }
    },

    onReset () {
      this.formData = this.reset()
    }
  }
}
</script>
