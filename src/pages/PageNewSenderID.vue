<template>
  <q-page padding="">
    <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
      <div style="max-width: 200px" >
         <q-input
          :rules="[val => !!val || 'This Field is required', val => /^[A-Z]{6}$/.test(val) || 'Invalid Sender ID']"
          outlined
          hint="Sender ID"
          maxlength="6"
          :counter="true"
          v-model="senderId"
          placeholder="FREWIS"
        />

        <q-select
          class="q-mt-md"
          outlined
          v-model="account"
          fill-input
          input-debounce="0"
          :options="accounts"
          option-label="name"
          label="Account"
          :rules="[val => !!val || 'Account is required']" />

        <div class="q-mt-lg">
          <q-btn label="Submit" type="submit" color="primary"/>
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script>

import { createSenderId } from '../../common/sms'
import Accounts from '../mixins/accounts'
import { mapState } from 'vuex'

import {
  Loading,
  QSpinnerIos
} from 'quasar'

import { insertString } from '../utils/gql'

export default {
  name: 'PageNewSender',

  created () {
    if (this.accountProp) {
      this.account = this.accountProp
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  props: {
    accountProp: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      senderId: '',
      account: null
    }
  },

  mixins: [
    Accounts({})
  ],

  methods: {
    async onSubmit () {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
        // other props
      })
      try {
        const r = await createSenderId(this.senderId, this.account.name)
        if (r.status === 200) {
          await this.$apollo.mutate({
            mutation: insertString('senderids', `
              affected_rows
            `, true),

            variables: {
              objects: [{
                name: this.senderId,
                account_id: this.account.id
              }],
              on_conflict: {
                constraint: 'senderids_account_id_name_key',
                update_columns: []
              }
            }
          })

          this.$q.notify({
            message: 'Created Successfully, wait for approval',
            color: 'positive',
            icon: 'info'
          })
        } else {
          this.$q.notify({
            message: 'Failed to create sender id, try again',
            color: 'negative',
            icon: 'warning'
          })
        }
      } catch (ex) {
        this.$q.notify({
          message: ex.message,
          color: 'negative',
          icon: 'warning'
        })
      }

      Loading.hide()
    },

    onReset () {
      this.senderId = ''
    }
  }
}
</script>
