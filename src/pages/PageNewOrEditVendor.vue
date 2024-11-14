<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <div class="q-pa-xl">
      <div class="row">
        <div class="col">
          <q-card flat bordered class="my-card">
            <q-card-section>
              <div class="row items-center q-pt-md">
                <div class="col-2">Name</div>
                <div class="col-10">
                  <q-select
                    outlined
                    v-model="formData.name"
                    use-input
                    :options="vendors"
                    @input="onVendorSelectedName"
                    @filter="filterVendorsByName"
                    @focus="formData.name = ''"
                    hint="Press <Enter> after new value"
                    hide-dropdown-icon
                    emit-value
                    map-options
                    input-debounce="300"
                    label="Business Name"
                    option-value="name"
                    option-label="name"
                    new-value-mode="add"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">GSTN/PAN</div>
                <div class="col-10">
                    <q-select
                    hint="Press <Enter> after new value"
                    outlined
                    v-model="formData.gstn_pan"
                    use-input
                    :options="vendors"
                    @input="onVendorSelectedGstn"
                    class="text-uppercase"
                    @filter="filterVendorsByGstn"
                    @focus="formData.gstn_pan = ''"
                    hide-dropdown-icon
                    emit-value
                    map-options
                    input-debounce="300"
                    label="GSTN"
                    option-value="gstn_pan"
                    option-label="gstn_pan"
                    new-value-mode="add"
                  >
                   <template v-slot:option="scope">
                    <q-item
                      v-bind="scope.itemProps"
                      v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-item-label v-html="scope.opt.name" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{ scope.opt.gstn_pan }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                </div>
              </div>
            </q-card-section>

             <q-card-section>
              <div class="row items-center">
                <div class="col-2">GST/TDS</div>
                <div class="col-10">
                  <q-input
                  label="GST/TDS (%)"
                    :rules="[val => (val == 0 || !!val) || 'This Field is required']"
                    outlined
                    v-model.number="formData.gst_tds"
                  >
                    <template v-slot:prepend>
                      <p class="q-pt-md" style="color:rgb(2, 123, 227);">%</p>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Phone</div>
                <div class="col">
                   <q-select
                    hint="Press <Enter> after new value"
                    outlined
                    v-model="formData.phone_number"
                    use-input
                    :options="vendors"
                    @input="onVendorSelectedPhoneNumber"
                    @filter="filterVendorsByPhoneNumber"
                    @focus="formData.phone_number = ''"
                    hide-dropdown-icon
                    input-debounce="300"
                       emit-value
                    map-options
                    label="Phone Number"
                    option-value="phone_number"
                    option-label="phone_number"
                    new-value-mode="add"
                  >
                   <template v-slot:option="scope">
                    <q-item
                      v-bind="scope.itemProps"
                      v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-item-label v-html="scope.opt.name" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{ scope.opt.phone_number }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Address1</div>
                <div class="col">
                  <q-input
                    label="Address1"
                    :rules="[val => !!val || 'This Field is required']"
                    v-model="formData.address1"
                    outlined
                    type="text"
                  >
                  <!-- <template v-slot:prepend>
                      <q-icon name="location_on" color="primary" />
                  </template> -->
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Address2</div>
                <div class="col">
                  <q-input label="Address2" v-model="formData.address2" outlined type="text" >
                    <!-- <template v-slot:prepend>
                      <q-icon name="location_on" color="primary" />
                  </template> -->
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">City</div>
                <div class="col">
                  <q-input
                    label="City"
                    :rules="[val => !!val || 'This Field is required']"
                    v-model="formData.city"
                    outlined
                    type="text"
                  >
                  <!-- <template v-slot:prepend>
                      <q-icon name="location_city" color="primary" />
                  </template> -->
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">State</div>
                <div class="col">
                  <india-state-select
                    label="State"
                    :rules="[val => !!val || 'This Field is required']"
                    v-model="formData.state"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Pincode</div>
                <div class="col">
                  <q-input
                    label="Pincode"
                    :rules="[val => !!val || 'This Field is required']"
                    v-model="formData.pincode"
                    outlined
                    type="number"
                  >
                  <!-- <template v-slot:prepend>
                      <q-icon name="pin_drop" color="primary" />
                  </template> -->
                  </q-input>
                </div>
              </div>
            </q-card-section>
          </q-card>
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

import { Notify,
  Loading,
  QSpinnerIos
} from 'quasar'

import { insertString, updateString, queryString } from '../utils/gql'

export default {
  name: 'NewOrEditVendor',

  props: {
    vendor: {
      type: Object
    }
  },

  async created () {
    if (this.vendor) {
      // this.formData = { ...this.vendor }
      // this.state = this.vendor.state
    }
  },

  data () {
    return {
      state: this.vendor ? this.vendor.state : null,
      nameFilter: '',
      gstnFilter: '',
      phoneFilter: '',
      formData: this.vendor ? {
        ...this.vendor
      } : {
        name: '',
        gstn_pan: '',
        phone_number: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        gst_tds: 0
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  apollo: {
    vendors: {

      query () {
        return queryString('vendors', `
          id
          name
          phone_number
          city
          gstn_pan
          address1
          address2
          state
          pincode
          gst_tds
        `)
      },

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        console.log('We got some result!', data)
      },

      variables () {
        const obj = {
          limit: 50,
          where: {

          }
        }

        if (this.nameFilter) {
          obj.where.name = {
            _ilike: `%${this.nameFilter}%`
          }
        }

        if (this.gstnFilter) {
          obj.where.gstn_pan = {
            _ilike: `%${this.gstnFilter}%`
          }
        }

        if (this.phoneFilter) {
          obj.where.phone_number = {
            _ilike: `%${this.phoneFilter}%`
          }
        }
        return obj
      }
    }
  },

  methods: {

    onVendorSelectedName (val) {
      console.log('selected', val)

      const f = this.vendors.find(c => new RegExp(val, 'i').test(c.name))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.name = val
      }
    },

    onVendorSelectedGstn (val) {
      console.log('selected', val)

      const f = this.vendors.find(c => new RegExp(val, 'i').test(c.gstn_pan))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.gstn_pan = val.toUpperCase()
      }
    },

    onVendorSelectedPhoneNumber (val) {
      console.log('selected', val)

      const f = this.vendors.find(c => new RegExp(val, 'i').test(c.phone_number))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.phone_number = val
      }
    },

    filterVendorsByName (val, update, abort) {
      update(() => {
        this.nameFilter = val.toLowerCase()
      })
    },

    filterVendorsByGstn (val, update, abort) {
      update(() => {
        this.gstnFilter = val.toLowerCase()
      })
    },

    filterVendorsByPhoneNumber (val, update, abort) {
      update(() => {
        this.phoneFilter = val
      })
    },

    cancel () {
      this.$router.go(-1)
    },

    onSubmit () {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })
      // this.formData.company_id = this.userDetails.company_id

      delete this.formData.id
      delete this.formData.__typename

      const variables = {
        [ this.vendor ? 'set' : 'objects' ]: this.vendor ? this.formData : {
          ...this.formData,
          companies_bridge: {
            data: {
              company_id: this.userDetails.company_id
            },
            on_conflict: {
              constraint: 'companies_vendors_bridge_company_id_vendor_id_key',
              update_columns: 'vendor_id'
            }
          }
        }
      }

      if (this.vendor) {
        variables.where = {
          id: {
            _eq: this.vendor.id
          }
        }
      } else {
        variables.on_conflict = {
          constraint: 'vendors_gstn_pan_key',
          update_columns: Object.keys(this.formData)
        }
      }

      console.log(variables)
      // Call to the graphql mutation
      this.$apollo.mutate({
      // Query
        mutation: this.vendor ? updateString('vendors', `
          affected_rows
        `) : insertString('vendors', `
          affected_rows
        `, true),
        // Parameters
        variables: variables
      }).then((data) => {
        // Result
        console.log(data)
        Loading.hide()
        Notify.create({
          message: 'Successfully created',
          color: 'positive',
          icon: 'info'
        })
        this.$router.go(-1)
      }).catch((error) => {
        // Error
        console.error(error)
        Loading.hide()
        return Notify.create({
          message: error.message,
          color: 'negative',
          icon: 'warning'
        })
      })
    },

    onReset () {
      this.formData = {
        name: '',
        type: '',
        gstn_pan: '',
        phone_number: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        gst_tds: 0
      }
    }
  },

  components: {
    'india-state-select': require('components/IndiaStateSelect.vue').default
  }

}
</script>
