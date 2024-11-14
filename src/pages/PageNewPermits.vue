<template>
  <q-page padding="">

  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
    <div style="max-width: 200px">

      <q-select class="q-pt-lg"
          outlined
          v-model="account"
          fill-input
          input-debounce="0"
          :options="accounts"
          option-label="name"
          label="Account"
          :rules="[val => !!val || 'Account is required']"
          style="padding-bottom: 32px">
      </q-select>

      <div class="q-mt-sm">
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>

    </div>

  </q-form>

   <div class="q-pt-md q-pb-md">
      <q-spinner
        v-if="loading"
        color="primary"
        size="3em"
        :thickness="2"
      />
    </div>
  </q-page>
</template>

<script>

import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

import savePermit from '../mixins/save-permit'
import Accounts from '../mixins/accounts'
import Permits from '../mixins/permits'

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export default {
  name: 'PageNewPermits',

  data () {
    return {
      account: null,
      loading: false
    }
  },

  mixins: [
    savePermit,
    Permits({
      skip () {
        return !this.account
      },
      fetchPolicy: 'network-only',
      returning: `
        id
        permit_number
        start_date
        end_date
        tag_url
        tagged
        vehicle_details
        source
        source_destination
        quantity
        company_id
        account_id
        client_rate_per_tonne
        client_shortage_per_tonne
        client_shortage_percentage
        owner_rate_per_tonne
        owner_shortage_percentage
        owner_shortage_per_tonne
      `
    }),
    Accounts({
      returning: `
        address1
        address2
        cgst
        city
        i3ms_password
        i3ms_username
        id
        igst
        name
        pincode
        sgst
        terms
        state
      `
    })
  ],

  async created () {
    const self = this
    ipcRenderer.removeAllListeners('permits-details-results')
    ipcRenderer.on('permits-details-results', async function (event, response) {
      console.log(response)
      self.loading = false
      self.$router.go(-1)
    })

    ipcRenderer.removeAllListeners('permit-details-results')
    ipcRenderer.on('permit-details-results', function (event, response) {
      console.log('permits details suman  response', response)
      self.savePermit(response)
    })
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {

    async onSubmit () {
      console.log(this.account, this.userDetails)
      console.log(`here ....`)
      this.loading = true

      // wait till permits loaded

      await new Promise(async (resolve) => {
        while (this.$apollo.queries.permits.loading) {
          await delay(1000)
        }
        resolve()
      })

      console.log('permits details suman  request', this.permits)

      ipcRenderer.send('permits-details', {
        permits: this.permits,
        account_id: this.account.id,
        company_id: this.userDetails.company_id,
        credentials: {
          username: this.account.i3ms_username,
          password: this.account.i3ms_password
        }
      })
    },

    onReset () {
      this.account = null
      this.loading = false
    }
  }
}
</script>
