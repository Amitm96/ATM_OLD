<template>
  <q-page padding="">

  <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
    <div style="max-width: 240px">

       <q-select
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
      class=""
      :rules="[val => !!val || 'Field is required']"
      outlined v-model="reportType" :options="options" label="Report Type" />

      <div class="q-mt-lg">
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

    <div v-if="!loading" class="q-pt-md q-pb-md"><p>{{ result }}</p></div>

  </q-page>
</template>

<script>

import { mapState } from 'vuex'

import tagReport from '../mixins/tag-report'
import Permits from '../mixins/permits'

export default {
  name: 'PageI3MSTagReport',

  props: {
    permitProp: {
      type: Object,
      required: true
    }
  },

  created () {
    if (this.permitProp) {
      this.permit = this.permitProp
      this.account = this.permit.credentials
    }
  },

  mixins: [
    tagReport,
    Permits({
      skip () {
        return !this.account
      },
      returning: `
        id
        permit_number
        tagged
      `
    })
  ],

  data () {
    return {
      loading: false,
      result: '',
      reportType: null,
      options: ['Total', 'Success', 'Failed']
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {
    async onSubmit () {
      this.loading = true
      if (this.reportType === 'Success') {
        const response = await this.successDownload()
        this.saveReport(response, this.fileName)
      } else if (this.reportType === 'Failed') {
        const response = await this.failedDownload()
        this.saveReport(response, this.fileName)
      } else if (this.reportType === 'Total') {
        const response = await this.totalDownload()
        this.saveReport(response, this.fileName)
      }
    },

    onReset () {
      this.reportType = null
    }
  }
}
</script>
