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
                    :options="clients"
                    @input="onClientSelectedName"
                    @filter="filterClientsByName"
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
                <div class="col-2">GSTN</div>
                <div class="col-10">
                    <q-select
                    hint="Press <Enter> after new value"
                    outlined
                    v-model="formData.gstn"
                    use-input
                    :options="clients"
                    @input="onClientSelectedGstn"
                    class="text-uppercase"
                    @filter="filterClientsByGstn"
                    @focus="formData.gstn = ''"
                    hide-dropdown-icon
                    emit-value
                    map-options
                    input-debounce="300"
                    label="GSTN"
                    option-value="gstn"
                    option-label="gstn"
                    @new-value="addNewGSTNNumber"
                    bottom-slots
                    :error="err"
                  >
                   <template v-slot:error>
                      Please enter a valid gstn number
                   </template>

                   <template v-slot:option="scope">
                    <q-item
                      v-bind="scope.itemProps"
                      v-on="scope.itemEvents"
                    >
                      <q-item-section avatar>
                        <q-item-label v-html="scope.opt.name" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{ scope.opt.gstn }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
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
                    :options="clients"
                    @input="onClientSelectedPhoneNumber"
                    @filter="filterClientsByPhoneNumber"
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
                  <q-input
                                    label="Address2"

                   v-model="formData.address2" outlined type="text" >
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
  name: 'NewOrEditClient',

  props: {
    client: {
      type: Object
    }
  },

  async created () {
    if (this.client) {
      // this.formData = { ...this.client }
      // this.state = this.client.state
    }
  },

  data () {
    return {
      state: this.client ? this.client.state : null,
      nameFilter: '',
      gstnFilter: '',
      phoneFilter: '',
      formData: this.client ? {
        ...this.client
      } : {
        name: '',
        gstn: '',
        phone_number: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: ''
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  apollo: {
    clients: {

      query () {
        return queryString('clients', `
          id
          name
          phone_number
          city
          gstn
          address1
          address2
          state
          pincode
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
          obj.where.gstn = {
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

    onClientSelectedName (val) {
      console.log('selected', val)

      const f = this.clients.find(c => new RegExp(val, 'i').test(c.name))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.name = val
      }
    },

    addNewGSTNNumber (val, done) {
      this.err = true
      console.log(`GSTN validation kicked in`)
      let regTest = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/.test(val)
      if (!regTest) {
        this.err = true
        return
      }
      this.err = false
      done(val, 'add')

      // done callback has two optional parameters:
      //  - the value to be added
      //  - the behavior (same values of new-value-mode prop,
      //    and when it is specified it overrides that prop –
      //    if it is used); default behavior (if not using
      //    new-value-mode) is to add the value even if it would
      //    be a duplicate
    },

    onClientSelectedGstn (val) {
      console.log('selected', val)

      const f = this.clients.find(c => new RegExp(val, 'i').test(c.gstn))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.gstn = val.toUpperCase()
      }
    },

    onClientSelectedPhoneNumber (val) {
      console.log('selected', val)

      const f = this.clients.find(c => new RegExp(val, 'i').test(c.phone_number))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.phone_number = val
      }
    },

    filterClientsByName (val, update, abort) {
      update(() => {
        this.nameFilter = val.toLowerCase()
      })
    },

    filterClientsByGstn (val, update, abort) {
      update(() => {
        this.gstnFilter = val.toLowerCase()
      })
    },

    filterClientsByPhoneNumber (val, update, abort) {
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

      delete this.formData.id
      delete this.formData.__typename

      const variables = {
        [ this.client ? 'set' : 'objects' ]: this.client ? this.formData : {
          ...this.formData,
          companies_bridge: {
            data: {
              company_id: this.userDetails.company_id
            },
            on_conflict: {
              constraint: 'companies_clients_bridge_company_id_client_id_key',
              update_columns: 'client_id'
            }
          }
        }
      }

      if (this.client) {
        variables.where = {
          id: {
            _eq: this.client.id
          }
        }
      }

      console.log(variables)
      // Call to the graphql mutation
      this.$apollo.mutate({
      // Query
        mutation: this.client ? updateString('clients', `
          affected_rows
        `) : insertString('clients', `
          affected_rows
        `),
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
        gstn: '',
        phone_number: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: ''
      }
    }
  },

  components: {
    'india-state-select': require('components/IndiaStateSelect.vue').default
  }

}
</script>
