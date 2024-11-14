
import { Notify,
  Loading,
  QSpinnerIos
} from 'quasar'

import { deleteString } from '../utils/gql'

export default {
  methods: {
    confirmAndDeleteDocument (table, query, id) {
      return new Promise((resolve, reject) => {
        this.$q.dialog({
          title: 'Confirm',
          message: 'Are you sure to delete?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          Loading.show({
            spinner: QSpinnerIos,
            spinnerSize: '2em'
          })
          // Call to the graphql mutation
          this.$apollo.mutate({
          // Query
            mutation: deleteString(table, `
            affected_rows
          `),

            update: (store, { data }) => {
              if (query) {
                this.$apollo.queries[query].refetch()
              }
            },

            // Parameters
            variables: {
              where: {
                id: {
                  _eq: id
                }
              }
            }
          }).then((data) => {
          // Result
            console.log(data)
            Loading.hide()
            resolve(true)
            return Notify.create({
              message: 'Successfully deleted',
              color: 'positive',
              icon: 'info'
            })
          }).catch((error) => {
          // Error
            console.error(error)
            Loading.hide()
            reject()
            return Notify.create({
              message: error.message,
              color: 'negative',
              icon: 'warning'
            })
          })
        }).onOk(() => {
        }).onCancel(() => {
          resolve(false)
        })
      })
    }
  }
}
