import { mapState, mapMutations } from 'vuex'

export default {

  computed: {
    ...mapState('store', ['lastRoute'])
  },

  methods: {
    ...mapMutations('store', ['popDocument']),

    goBack () {
      // this.popDocument('lastRoute')

      // let route

      // if (this.lastRoute.length) {
      //   route = this.lastRoute[this.lastRoute.length - 1]
      // }

      // console.log('lastRoute in go back', route, this.lastRoute)

      // if (route) {
      //   this.$router.replace(route)
      // } else {
      this.$router.back()
      // }
    }
  }
}
