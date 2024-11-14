
import bankNames from '../utils/bank_names'

export default {
  data () {
    return {
      bankNames: bankNames
    }
  },

  methods: {
    filterBankNames (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.bankNames = bankNames.filter(v => v.toLowerCase().includes(needle))
      })
    }
  }
}
