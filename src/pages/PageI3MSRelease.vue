<template>
  <q-page padding="">

  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

    <div style="max-width: 200px">
       <q-select class="q-mt-xl"
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
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-select
        label="Trucks"
        outlined
        v-model="trucks"
        use-input
        use-chips
        multiple
        :options="taggedOptions"
        ref="truckSelect"
        @input="onTruckSelected"
        @filter="filterTrucks"
        hide-dropdown-icon
        input-debounce="0"
      />
    </div>

    <div class="q-mt-xl">
      <q-btn label="Submit" type="submit" color="primary"/>
      <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
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

import Permits from '../mixins/permits'
import savePermit from '../mixins/save-permit'

export default {
  name: 'PageI3MSRelease',

  props: {
    permitProp: {
      type: Object,
      required: true
    }
  },

  mixins: [
    savePermit,
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
      trucks: null,
      tagged: [],
      taggedOptions: [],
      account: null
    }
  },

  async created () {
    if (this.permitProp) {
      this.permit = this.permitProp
      this.account = this.permit.credentials
    }

    for (let k in this.permit.tagged) {
      if (!this.permit.tagged[k]) {
        this.tagged.push(k)
      }
    }

    this.taggedOptions = this.tagged

    const self = this
    ipcRenderer.removeAllListeners('release-vehicles-results')
    ipcRenderer.on('release-vehicles-results', async function (event, response) {
      self.permit.taggedSuccess = response
      await self.savePermit(self.permit)
      self.loading = false
    })
  },

  methods: {

    onTruckSelected (val) {
      this.$refs.truckSelect.updateInputValue('', true)

      if (this.taggedOptions.length === 1) {
        this.$refs.truckSelect.hidePopup()
      }
    },

    filterTrucks (val, update, abort) {
      update(() => {
        if (!val) {
          this.taggedOptions = this.tagged
        } else {
          const needle = val.toUpperCase()
          this.taggedOptions = this.tagged.filter(v => v.toUpperCase().indexOf(needle) > -1)
        }
      })
    },

    async onSubmit () {
      console.log('onsubmit called in release')
      if (this.trucks.length) {
        ipcRenderer.send('release-vehicles', {
          ...this.permit,
          trucks: this.trucks
        })

        this.loading = true
      } else {
        // no trucks
        console.log('no trucks to release')
        this.$q.notify({
          message: 'No trucks to release',
          color: 'negative',
          icon: 'warning'
        })
      }
    },

    onReset () {
      this.permit = null
      this.trucks = []
      this.loading = false
    }
  }
}
</script>
