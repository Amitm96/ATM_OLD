<template>
    <q-select
        outlined
        v-model="localState"
        input-debounce="0"
        :options="stateNames"
        option-label="name"
        :rules="rules"
        :label="label"
        style="padding-bottom: 32px">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
</template>

<script>
export default {

  props: {
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: false
    },
    rules: {
      type: Array,
      required: false
    }
  },
  computed: {
    localState: {
      get () { return this.value },
      set (localState) { this.$emit('input', localState) }
    }
  },

  data () {
    return {
      stateNames: [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jammu and Kashmir',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttarakhand',
        'Uttar Pradesh',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Chandigarh',
        'Dadra and Nagar Haveli',
        'Daman and Diu',
        'Delhi',
        'Lakshadweep',
        'Puducherry'
      ]
    }
  }
}
</script>
