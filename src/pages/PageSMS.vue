<template>
  <q-page padding="">
    <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
      <div style="max-width: 250px">
        <q-select
          class="q-mt-md"
          outlined
          v-model="account"
          fill-input
          input-debounce="0"
          :options="accounts"
          option-label="name"
          label="Account"
          @input="onAccountSelected"
          :rules="[val => !!val || 'Account is required']" />

        <q-select
          class="q-mt-md"
          :rules="[val => !!val || 'Field is required']"
          outlined
          v-model="senderId"
          :options="senderIds"
          @input="onSenderIdSelected"
          label="Sender ID" />

        <div class="q-pt-md q-pb-lg">
          <div class="text-subtitle2">Excel Format</div>
            <img src="~assets/sms-excel.png" style="max-width:100%;">
          </div>
          <q-file
            outlined
            :rules="[val => !!val || 'Field is required']"
            v-model="path"
            accept=".xlsx, .xls"
            label="Phone Numbers (Excel)"
          />
        </div>

        <q-input
          class="q-mt-md"
          style="max-width: 600px"
          v-model="smsMessage"
          outlined
          label="SMS Message"
          type="textarea"
        />

        <div class="q-mt-xl">
          <q-btn label="Submit" type="submit" color="primary"/>
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
    </q-form>
  </q-page>
</template>

<script>

import _ from 'lodash'
import XLSX from 'xlsx'
import { mapState } from 'vuex'

import { sendBulkSms } from '../../common/sms'
import Accounts from '../mixins/accounts'

import {
  Loading,
  QSpinnerIos
} from 'quasar'
import { updateString } from '../utils/gql'

export default {
  name: 'PageSMS',

  computed: {
    ...mapState('store', ['userDetails'])
  },

  data () {
    return {
      path: null,
      smsMessage: '',
      senderId: null,
      account: null,
      senderIds: [
        'NEW'
      ]
    }
  },

  mixins: [
    Accounts({})
  ],

  methods: {

    async onSubmit () {
      const workbook = XLSX.readFile(this.path.path)
      const sheet = workbook.SheetNames

      let phoneNumbers = XLSX.utils.sheet_to_json(workbook.Sheets[sheet[0]], {
        range: 1,
        raw: true,
        defval: null,
        header: ['phoneNumber'] })

      phoneNumbers = _.union(_.map(phoneNumbers, p => p.phoneNumber))

      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      try {
        const r = await sendBulkSms(this.smsMessage, phoneNumbers, this.senderId)
        if (r.status === 200) {
          this.$q.notify({
            message: 'Successfully sent',
            color: 'positive',
            icon: 'info'
          })

          await this.$apollo.mutate({
            mutation: updateString('companies', `
              affected_rows
            `, true),

            variables: {
              where: {
                id: {
                  _eq: this.userDetails.company.id
                }
              },
              inc: {
                sms_credits: phoneNumbers.length
              }
            }
          })
        } else {
          this.$q.notify({
            message: 'Something wrong, try again',
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

    onSenderIdSelected (value) {
      if (value === 'NEW') {
        this.$router.push('/newsenderid')
      }
    },

    onAccountSelected (value) {
      this.senderIds = [
        'NEW'
      ].concat(value.senderids.map(t => t.name))
    },

    onReset () {
      this.smsMessage = ''
      this.senderId = null
    }
  }
}
</script>
