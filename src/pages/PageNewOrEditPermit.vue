<template>
  <q-page padding="">

  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

      <q-input
        v-if="!permit"
        class="q-mt-xl"
        outlined
        type="url"
        v-model="tagUrl"
        :rules="[val => !!val || 'Tagging link is required']"
        label="Tagging Link" />

      <div style="max-width: 500px">
        <q-select
            v-if="!permit"
            outlined
            v-model="account"
            fill-input
            input-debounce="0"
            :options="accounts"
            option-label="name"
            label="Account"
            @filter="filterAccounts"
            :rules="[val => !!val || 'Account is required']"
            class="q-mb-md">
        </q-select>
         <q-select
            outlined
            v-model="client"
            fill-input
            input-debounce="0"
            :options="clients"
            option-label="name"
            label="Client"
            @filter="filterClients"
            :rules="[val => !!val || 'Client is required']"
            class="q-mb-md">
        </q-select>
          <q-input
              :rules="[val => !!val || 'This Field is required']"
              outlined
              v-model="sourceDestination"
              label="Source-Destination">
          </q-input>

        <div class="row">
          <div class="col q-pr-md">
          <div class="text-h6 q-mb-sm"> Truck Owner Details </div>
            <q-input
                outlined
                type="text"
                prefix="₹"
                v-model.number="ownerRatePerTonne"
                label="Price Per Tonne">
            </q-input>

            <q-input class="q-pt-md"
                outlined
                type="text"
                prefix="%"
                v-model.number="ownerShortagePercentage"
                label="Shortage Percentage">
            </q-input>

            <q-input class="q-pt-md"
                outlined
                type="text"
                prefix="₹"
                v-model.number="ownerShortagePerTonne"
                label="Shortage Price Per Tonne">
            </q-input>

          </div>
        <div class="col q-pl-md">
         <div class="text-h6 q-mb-sm"> Client Details </div>
          <q-input
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientRatePerTonne"
              label="Price Per Tonne">
          </q-input>

          <q-input class="q-pt-md"
              outlined
              type="text"
              prefix="%"
              v-model.number="clientShortagePercentage"
              label="Shortage Percentage">
          </q-input>

          <q-input class="q-pt-md"
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientShortagePerTonne"
              label="Shortage Price Per Tonne">
          </q-input>
        </div>
      </div>
    </div>

      <!-- <div class="text-h6 q-mb-xs"> Truck Owner Details </div>
          <q-input
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="ownerRatePerTonne"
              label="Price Per Tonne">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="%"
              v-model.number="ownerShortagePercentage"
              label="Shortage Percentage">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="ownerShortagePerTonne"
              label="Shortage Price Per Tonne">
          </q-input>

      <div class="text-h6 q-mb-xs"> Client Details </div>
          <q-input
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientRatePerTonne"
              label="Price Per Tonne">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="%"
              v-model.number="clientShortagePercentage"
              label="Shortage Percentage">
          </q-input>

          <q-input class="q-pt-md"
              :rules="[val => !!val || 'This Field is required']"
              outlined
              type="text"
              prefix="₹"
              v-model.number="clientShortagePerTonne"
              label="Shortage Price Per Tonne">
          </q-input> -->

      <div class="q-mt-lg">
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>

  </q-form>
  </q-page>
</template>

<script>

import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'
import { Loading, QSpinnerIos } from 'quasar'

import { updateString } from '../utils/gql'
import savePermit from '../mixins/save-permit'
import Accounts from '../mixins/accounts'
import Clients from '../mixins/clients'

export default {
  name: 'PageNewPermit',

  props: {
    permit: {
      type: Object
    }
  },

  mixins: [
    savePermit,
    Accounts({
      skip () {
        return this.account
      }
    }),

    Clients
  ],

  data () {
    return {
      tagUrl: '',
      sourceDestination: '',
      ownerRatePerTonne: 0,
      ownerShortagePerTonne: 0,
      ownerShortagePercentage: 0,
      clientShortagePerTonne: 0,
      clientRatePerTonne: 0,
      clientShortagePercentage: 0
    }
  },

  async created () {
    console.log(this.permit)
    if (this.permit) {
      this.tagUrl = this.permit.tag_url
      this.client = this.permit.client
      this.account = this.permit.credentials
      this.clientRatePerTonne = this.permit.client_rate_per_tonne
      this.clientShortagePerTonne = this.permit.client_shortage_per_tonne
      this.clientShortagePercentage = this.permit.client_shortage_percentage
      this.sourceDestination = this.permit.source_destination
      this.ownerRatePerTonne = this.permit.owner_rate_per_tonne
      this.ownerShortagePerTonne = this.permit.owner_shortage_per_tonne
      this.ownerShortagePercentage = this.permit.owner_shortage_percentage
    }

    const self = this

    ipcRenderer.removeAllListeners('permit-details-results')
    ipcRenderer.on('permit-details-results', async function (event, response) {
      console.log(response)
      if (response) {
        await self.savePermit(response)
      }
      Loading.hide()
      self.$router.replace('/')
    })
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {

    async onSubmit () {
      console.log(this.account, this.userDetails, this.client)

      // fully customizable
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })

      if (!this.permit) {
        console.log('sending permit details')
        ipcRenderer.send('permit-details', {
          source_destination: this.sourceDestination,
          client_rate_per_tonne: this.clientRatePerTonne,
          client_shortage_percentage: this.clientShortagePercentage,
          client_shortage_per_tonne: this.clientShortagePerTonne,
          owner_rate_per_tonne: this.ownerRatePerTonne,
          owner_shortage_per_tonne: this.ownerShortagePerTonne,
          owner_shortage_percentage: this.ownerShortagePercentage,
          account_id: this.account.id,
          tag_url: this.tagUrl,
          company_id: this.account.company_id,
          client_id: this.client.id,
          credentials: {
            username: this.account.i3ms_username,
            password: this.account.i3ms_password
          }
        })
      } else {
        const response = await this.$apollo.mutate({
          mutation: updateString('permits', `
            affected_rows
            returning {
              id
            }
          `),
          variables: {
            where: {
              id: {
                _eq: this.permit.id
              }
            },
            set: {
              client_id: this.client.id,
              account_id: this.account.id,
              source_destination: this.sourceDestination,
              client_rate_per_tonne: this.clientRatePerTonne,
              client_shortage_percentage: this.clientShortagePercentage,
              client_shortage_per_tonne: this.clientShortagePerTonne,
              owner_rate_per_tonne: this.ownerRatePerTonne,
              owner_shortage_per_tonne: this.ownerShortagePerTonne,
              owner_shortage_percentage: this.ownerShortagePercentage
            }
          }
        })

        console.log(response)
        Loading.hide()

        this.$q.notify({
          message: 'Saved successfully',
          color: 'positive',
          icon: 'info'
        })
        this.$router.replace('/')
      }
    },

    onReset () {
      this.account = null
      this.tagUrl = null
      this.loading = false
      this.clientRatePerTonne = 0
      this.clientShortagePerTonne = 0
      this.clientShortagePercentage = 0
      this.ownerRatePerTonne = 0
      this.ownerShortagePerTonne = 0
      this.ownerShortagePercentage = 0
    }
  }
}
</script>
