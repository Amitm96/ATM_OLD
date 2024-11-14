<template>
     <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
  <div class="q-pa-xl">
    <div class="row">
      <div class="col">
        <div class="q-pt-sm">
          <q-card flat bordered class="my-card">

            <q-card-section>
              <div class="row q-pt-lg items-center">
                <div class="col-2">Name</div>
                <div class="col-10">
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  outlined v-model="formData.name" placeholder="Account Name">
                    <template v-slot:prepend>
                              <q-icon name="business" color="primary"/>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">GSTN</div>
                <div class="col-10">
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  outlined v-model="formData.gstn" placeholder="125862469541">
                    <template v-slot:prepend>
                              <q-icon name="chrome_reader_mode" color="primary"/>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">I3MS Username</div>
                <div class="col-10">
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  outlined v-model="formData.i3ms_username" placeholder>
                    <template v-slot:prepend>
                              <q-icon name="person" color="primary"/>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">I3MS Password</div>
                <div class="col-10">
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  outlined
                  :type="isPwd ? 'password' : 'text'"
                  v-model="formData.i3ms_password" placeholder>
                    <template v-slot:prepend>
                      <q-icon name="lock" color="primary"/>
                    </template>

                      <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>

                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Address1</div>
                <div class="col">
                  <q-input
                    :rules="[val => !!val || 'This Field is required']"
                  v-model="formData.address1" outlined type="text" >
                  <template v-slot:prepend>
                      <q-icon name="location_on" color="primary" />
                  </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Address2</div>
                <div class="col">
                  <q-input v-model="formData.address2" outlined type="text" >
                    <template v-slot:prepend>
                      <q-icon name="location_on" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

             <q-card-section>
              <div class="row items-center">
                <div class="col-2">City</div>
                <div class="col">
                  <q-input
                    :rules="[val => !!val || 'This Field is required']"
                    v-model="formData.city" outlined type="text" >
                    <template v-slot:prepend>
                      <q-icon name="location_city" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">State</div>
                <div class="col">
                  <india-state-select
                  :rules="[val => !!val || 'This Field is required']"
                  v-model="formData.state" />
                </div>
              </div>
            </q-card-section>

             <q-card-section>
              <div class="row items-center">
                <div class="col-2">Pincode</div>
                <div class="col">
                  <q-input
                  :rules="[val => !!val || 'This Field is required']"
                  v-model="formData.pincode" outlined type="number" >
                  <template v-slot:prepend>
                      <q-icon name="pin_drop" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">IGST</div>
                <div class="col">
                  <q-input
                   :rules="[val => !!val || 'This Field is required']"
                   v-model="formData.igst" outlined type="number" >
                   <template v-slot:prepend>
                      <p class="q-pt-md" style="color:rgb(2, 123, 227);">%</p>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">CGST</div>
                <div class="col">
                  <q-input
                   :rules="[val => !!val || 'This Field is required']"
                   v-model="formData.cgst" outlined type="double" >
                   <template v-slot:prepend>
                      <p class="q-pt-md" style="color:rgb(2, 123, 227);">%</p>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

          <q-card-section>
              <div class="row items-center">
                <div class="col-2">SGST</div>
                <div class="col">
                  <q-input
                    :rules="[val => !!val || 'This Field is required']"
                    v-model="formData.sgst" outlined type="double" >
                    <template v-slot:prepend>
                      <p class="q-pt-md" style="color:rgb(2, 123, 227);">%</p>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row items-center">
                <div class="col-2">Terms</div>
                <div class="col">
                <q-editor
                  :rules="[val => !!val || 'This Field is required']"
                  v-model="formData.terms" :toolbar="[['unordered', 'ordered']]" min-height="5rem" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
   <div class="q-mt-xl">
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
  </div>
     </q-form>
</template>

<style lang="stylus">
#container {
  text-align: center;
}
</style>

<script>
import { mapState } from 'vuex'
import helpers from '../mixins/helpers'

export default {
  name: 'NewOrEditAccount',

  props: {
    account: {
      type: Object
    }
  },

  mixins: [
    helpers
  ],

  created () {
    if (this.account) {
      this.formData = { ...this.account }
    }
  },

  data () {
    return {
      isPwd: true,
      formData: {
        name: '',
        gstn: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        igst: 0,
        cgst: 0,
        sgst: 0,
        i3ms_username: '',
        i3ms_password: '',
        terms: ''
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {
    cancel () {
      this.$router.go(-1)
    },

    onSubmit () {
      console.log(this.userDetails)
      this.formData.igst = +this.formData.igst
      this.formData.cgst = +this.formData.cgst
      this.formData.sgst = +this.formData.sgst
      this.formData.company_id = this.userDetails.company.id

      console.log(this.formData, this.userDetails)
      this.saveRow('accounts', 'account', this.formData)
    },

    onReset () {
      this.formData = {
        name: '',
        gstn: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        igst: 0,
        cgst: 0,
        sgst: 0,
        i3ms_username: '',
        i3ms_password: '',
        terms: ''
      }
    }
  },

  components: {
    'india-state-select': require('components/IndiaStateSelect.vue').default
  }
}
</script>
