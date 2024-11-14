export default {

  data () {
    return {
      i3ms: true,
      paying_trips: []
    }
  },

  computed: {
    totalQuantity () {
      return this.paying_trips.reduce((p, t) => p + this.qty(t), 0)
    },

    totalNet () {
      return this.paying_trips.reduce((p, t) => {
        return p + this.net(t)
      }, 0)
    },

    tds () {
      return this.totalNet * this.payment.gst_tds / 100
    },

    afterTds () {
      return this.totalNet - this.tds
    },

    totalDeduction () {
      return this.paying_trips.reduce((p, t) => {
        return p + this.shortageAmount(t) + this.deduction(t)
      }, 0)
    },
    totalGross () {
      return this.paying_trips.reduce((p, t) => {
        return p + this.gross(t)
      }, 0)
    }
  },

  methods: {

    totalFuel (tp) {
      const d = (tp.extra || {}).payment_details || {}
      const fuelData = d.fuel || []
      return fuelData.reduce((p, t) => p + t.rate * t.quantity, 0)
    },

    totalAdvance (tp) {
      const d = (tp.extra || {}).payment_details || {}
      const advanceData = d.advance || []
      return advanceData.reduce((p, t) => p + t.amount, 0)
    },

    shortageAmount (t) {
      const field = this.i3ms ? 'permit' : 'order'

      if (!t[field] || !t[field].owner_shortage_percentage) {
        return 0
      }

      const qty = t.unloaded_quantity || t.load_carrying

      let shortage = (t.load_carrying - qty)
      if (shortage < 0) {
        shortage = 0
      }

      const shortagePercentage = (shortage / t.load_carrying) * 100
      let amount = 0

      if (shortagePercentage >= t[field].owner_shortage_percentage) {
        amount = shortage * t[field].owner_shortage_per_tonne
      }

      return amount
    },

    qty (v) { return v.unloaded_quantity || v.load_carrying },

    rate (v) { return this.i3ms ? v.permit.owner_rate_per_tonne : v.order.owner_rate_per_tonne },

    deduction (row) { return (this.totalAdvance(row) + this.totalFuel(row) + row.discount + row.penalty) },

    net (row) { return this.gross(row) - this.shortageAmount(row) - this.deduction(row) },

    gross (row) { return this.qty(row) * this.rate(row) }
  }

}
