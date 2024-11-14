<template>
  <q-page padding>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div style="max-width: 200px">
        <q-select
          class="q-mt-xl"
          outlined
          v-model="permit"
          use-input
          hide-selected
          fill-input
          option-label="permit_number"
          input-debounce="0"
          :options="permits"
          @filter="filterPermits"
          label="Permit No"
          :rules="[val => !!val || 'Field is required']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          class
          outlined
          v-model="trucklist"
          fill-input
          use-input
          input-debounce="0"
          :options="trucklists"
          @filter="filterTrucklists"
          option-label="name"
          :rules="[val => !!val || 'Truck list is required']"
          label="Truck List"
        ></q-select>
        <q-select
          class
          outlined
          v-model="senderId"
          :options="senderIds"
          @input="onSenderIdSelected"
          label="Sender ID"
        />
      </div>

      <q-input
        class="q-mt-lg"
        style="max-width: 600px"
        v-model="smsMessage"
        outlined
        label="SMS Message"
        type="textarea"
      />

      <div class="q-mt-xl">
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
    <div class="q-pt-md q-pb-md">
      <q-spinner v-if="loading" color="primary" size="3em" :thickness="2" />
    </div>

    <div v-if="loading">
      <div class="q-pt-md">Total: {{ total }}</div>
      <div>Failed: {{ failed }}</div>
    </div>
  </q-page>
</template>

<script>
import { ipcRenderer } from 'electron'
import _ from 'lodash'
import { mapState } from 'vuex'

import { queryString, updateString } from '../utils/gql'
import tagReport from '../mixins/tag-report'
import Permits from '../mixins/permits'
import Trucklist from '../mixins/trucklists'

export default {
  name: 'PageI3MSTagging',

  props: {
    permitProp: {
      type: Object,
      required: true
    }
  },

  mixins: [
    tagReport,
    Trucklist,
    Permits({
      skip () {
        return !this.account
      },
      returning: `
        id
        permit_number
        tagged
        account_id
        credentials: account {
          id
          name
          username: i3ms_username
          password: i3ms_password
        }
    `
    })
  ],

  computed: {
    ...mapState('store', ['userDetails'])
  },

  data () {
    return {
      loading: false,
      failed: '',
      total: '',
      account: null,
      trucklist: null,
      smsMessage: '',
      senderId: '',
      senderIds: ['NEW'],
      batch: 0
    }
  },

  async created () {
    const self = this

    if (this.permitProp) {
      this.permit = this.permitProp
      this.account = this.permit.credentials
    }

    ipcRenderer.removeAllListeners('tag-results')
    ipcRenderer.on('tag-results', function (event) {
      self.loading = false
      self.saveExcel()
    })

    ipcRenderer.removeAllListeners('tag-truck-result')
    ipcRenderer.on('tag-truck-result', async function (event, response) {
      self.saveTagResult(response)
    })

    ipcRenderer.removeAllListeners('failed')
    ipcRenderer.on('failed', (event, results) => {
      console.log('received failed from main process', results)
      this.failed = results
    })

    ipcRenderer.removeAllListeners('total')
    ipcRenderer.on('total', (event, results) => {
      console.log('received total from main process', results)
      this.total = results
    })
  },

  apollo: {
    senderIds: {
      query () {
        return queryString(
          'senderids',
          `
          id
          name
        `
        )
      },

      fetchPolicy: 'network-only',

      update (data) {
        return ['NEW'].concat(data.senderids.map(s => s.name))
      },

      // Error handling
      error (error) {
        console.error("We've got an error!", error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        console.log('We got some result!', data, this.pagination)
      },

      variables () {
        return {
          where: {
            account_id: {
              _eq: this.permit
                ? this.permit.account_id
                : this.permitProp.account_id
            }
          }
        }
      }
    }
  },

  methods: {
    async saveTagResult (response) {
      this.permit.tagged[response.truck_number] = response.reason

      this.batch++

      if (this.batch >= 20) {
        this.batch = 0

        const response = await this.$apollo.mutate({
          mutation: updateString(
            'permits',
            `
            affected_rows
            `
          ),

          variables: {
            set: {
              tagged: this.permit.tagged
            },
            where: {
              id: {
                _eq: this.permit.id
              }
            }
          }
        })

        console.log(response)
      }
    },

    async saveExcel () {
      const response = await this.totalDownload()
      this.saveReport(response, 'Tagging')
      this.result = 'Success'
    },

    async onSubmit () {
      if (this.smsMessage && !this.senderId) {
        return this.$q.notify({
          message: 'Sender Id required',
          color: 'negative',
          icon: 'warning'
        })
      }

      let response = await this.$apollo.query({
        query: queryString(
          'truck_lists',
          `
          trucks {
            truck {
              id
              truck_number
              owner {
                id
                name
                phone_number
              }
            }
          }
        `
        ),
        variables: {
          where: {
            id: {
              _eq: this.trucklist.id
            }
          }
        }
      })

      let trucks = response.data.truck_lists[0].trucks.map(t => t.truck)

      try {
        console.log('Before excluding', trucks.length)
        trucks = _.differenceWith(
          trucks,
          this.permit.tagged,
          (a, b) => !b.hasOwnProperty(a.truck_number)
        )
        console.log('After excluding', trucks.length)
      } catch (ex) {
        console.error(ex)
      }

      if (trucks.length) {
        ipcRenderer.send('tag-vehicles', {
          ...this.permit,
          smsMessage: this.smsMessage,
          senderId: this.senderId,
          trucks
        })

        this.loading = true
        window.scrollTo(0, document.body.scrollHeight)
      } else {
        // no trucks
        console.log('no trucks to tag')
        this.$q.notify({
          message: 'All trucks already tagged',
          color: 'negative',
          icon: 'warning'
        })
        this.saveExcel()
      }
    },

    onSenderIdSelected (value) {
      if (value === 'NEW') {
        if (this.permit) {
          this.$router.push({
            name: 'newsenderid',
            params: { accountProp: this.permit.credentials }
          })
        } else {
          this.$router.push('/newsenderid')
        }
      }
    },

    onReset () {
      this.permit = null
      this.trucklist = null
      this.loading = false
    }
  }
}
</script>
