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
                    :options="owners"
                    @input="onOwnerSelectedName"
                    @filter="filterOwnersByName"
                    @focus="formData.name = ''"
                    hint="Press <Enter> after new value"
                    hide-dropdown-icon
                    emit-value
                    map-options
                    input-debounce="300"
                    label="Owner Name"
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
                    :options="owners"
                    @input="onOwnerSelectedGstn"
                    class="text-uppercase"
                    @filter="filterOwnersByGstn"
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
                    :options="owners"
                    @input="onOwnerSelectedPhoneNumber"
                    @filter="filterOwnersByPhoneNumber"
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

            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <q-img v-if="owner" :src="panCardLink" :ratio="16/9">
                    <div class="absolute-top text-subtitle1 text-center">Pan Card</div>
                  </q-img>
                  <q-uploader
                          v-if="!owner"
                          @added="uploadPanCard"
                          label="Pan Card"
                          color="orange"
                          square
                          flat
                          bordered
                          style="max-width: 300px"/>
                  <q-img v-if="owner" :src="aadhaarCardLink" :ratio="1">
                    <div class="absolute-top text-subtitle1 text-center">Aadhaar Card</div>
                  </q-img>
                  <q-uploader
                          v-if="!owner"
                          @added="uploadAadhaarCard"
                          label="Aadhaar Card"
                          color="while"
                          square
                          flat
                          bordered
                          style="max-width: 300px"/>
                  <q-img v-if="owner" :src="bankPassbookLink" :ratio="1">
                    <div class="absolute-top text-subtitle1 text-center">Bank Passbook</div>
                  </q-img>
                  <q-uploader
                          v-if="!owner"
                          @added="uploadBankPassbook"
                          label="Bank Passbook"
                          color="green"
                          square
                          flat
                          bordered
                          style="max-width: 300px"/>
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
import { firebaseStorageRef } from 'boot/firebase'

export default {
  name: 'NewOrEditOwner',

  props: {
    owner: {
      type: Object
    }
  },

  async created () {
    if (this.owner) {
      // this.formData = { ...this.owner }
      // this.state = this.owner.state
    }
  },

  data () {
    return {
      state: this.owner ? this.owner.state : null,
      nameFilter: '',
      gstnFilter: '',
      phoneFilter: '',
      panCardLink: this.owner ? this.owner.pan : '',
      aadhaarCardLink: this.owner ? this.owner.aadhaar : '',
      bankPassbookLink: this.owner ? this.owner.bank_passbook : '',
      formData: this.owner ? {
        ...this.owner
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
    owners: {

      query () {
        return queryString('owners', `
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
          pan
          aadhaar
          bank_passbook
        `)
      },

      fetchPolicy: 'network-only',

      // Error handlingq
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

    onOwnerSelectedName (val) {
      console.log('selected', val)

      const f = this.owners.find(c => new RegExp(val, 'i').test(c.name))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.name = val
      }
    },

    onOwnerSelectedGstn (val) {
      console.log('selected', val)

      const f = this.owners.find(c => new RegExp(val, 'i').test(c.gstn_pan))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.gstn_pan = val.toUpperCase()
      }
    },

    onOwnerSelectedPhoneNumber (val) {
      console.log('selected', val)

      const f = this.owners.find(c => new RegExp(val, 'i').test(c.phone_number))

      if (f) {
        this.formData = {
          ...f
        }
        this.state = f.state
      } else {
        this.formData.phone_number = val
      }
    },

    filterOwnersByName (val, update, abort) {
      update(() => {
        this.nameFilter = val.toLowerCase()
      })
    },

    filterOwnersByGstn (val, update, abort) {
      update(() => {
        this.gstnFilter = val.toLowerCase()
      })
    },

    filterOwnersByPhoneNumber (val, update, abort) {
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
        [ this.owner ? 'set' : 'objects' ]: this.owner ? this.formData : {
          ...this.formData,
          companies_bridge: {
            data: {
              company_id: this.userDetails.company_id
            },
            on_conflict: {
              constraint: 'companies_owners_bridge_company_id_owner_id_key',
              update_columns: 'owner_id'
            }
          }
        }
      }

      if (this.owner) {
        variables.set.pan = this.panCardLink
        variables.set.aadhaar = this.aadhaarCardLink
        variables.set.bank_passbook = this.bankPassbookLink
        variables.where = {
          id: {
            _eq: this.owner.id
          }
        }
      } else {
        variables.objects.pan = this.panCardLink
        variables.objects.aadhaar = this.aadhaarCardLink
        variables.objects.bank_passbook = this.bankPassbookLink
        variables.on_conflict = {
          constraint: 'owners_gstn_pan_key',
          update_columns: Object.keys(this.formData)
        }
      }

      console.log(`data`, variables)
      // Call to the graphql mutation
      this.$apollo.mutate({
      // Query
        mutation: this.owner ? updateString('owners', `
          affected_rows
        `) : insertString('owners', `
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
        gstn_pan: '',
        phone_number: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        gst_tds: 0
      }
    },

    uploadPanCard (files) {
      let self = this
      files.forEach(file => {
        let fileRef = firebaseStorageRef.child(`truck-owners/${file.name}`)
        fileRef.put(file).then(function (snapshot) {
          self.panCardLink = `https://storage.googleapis.com/fre8wise-ta.appspot.com/${snapshot.metadata.fullPath}`
        })
      })
    },

    uploadAadhaarCard (files) {
      let self = this
      files.forEach(file => {
        let fileRef = firebaseStorageRef.child(`truck-owners/${file.name}`)
        fileRef.put(file).then(function (snapshot) {
          self.aadhaarCardLink = `https://storage.googleapis.com/fre8wise-ta.appspot.com/${snapshot.metadata.fullPath}`
        })
      })
    },

    uploadBankPassbook (files) {
      let self = this
      files.forEach(file => {
        let fileRef = firebaseStorageRef.child(`truck-owners/${file.name}`)
        fileRef.put(file).then(function (snapshot) {
          self.bankPassbookLink = `https://storage.googleapis.com/fre8wise-ta.appspot.com/${snapshot.metadata.fullPath}`
        })
      })
    }
  },

  components: {
    'india-state-select': require('components/IndiaStateSelect.vue').default
  }

}
</script>
