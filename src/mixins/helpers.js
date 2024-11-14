import { mapState } from 'vuex'

import { Notify,
  Loading,
  QSpinnerIos
} from 'quasar'

import { updateString, insertString } from '../utils/gql'

export default {

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {

    saveRow (table, prop, data) {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      delete data.id
      delete data.__typename

      const variables = {}

      if (this[prop]) {
        variables.where = {
          id: {
            _eq: this[prop].id
          }
        }

        variables.set = data
      } else {
        variables.objects = [data]
      }

      // Call to the graphql mutation
      this.$apollo.mutate({
      // Query
        mutation: this[prop] ? updateString(table, `
          affected_rows
        `) : insertString(table, `
          affected_rows
        `),
        // Parameters
        variables: variables
      }).then((data) => {
        // Result
        console.log(data)
        Loading.hide()
        Notify.create({
          message: 'Successfully created',
          color: 'positive',
          icon: 'info'
        })
        this.$router.go(-1)
      }).catch((error) => {
        // Error
        console.error(error)
        Loading.hide()
        return Notify.create({
          message: error.message,
          color: 'negative',
          icon: 'warning'
        })
      })
    }
  }
}
