import { queryString } from '../utils/gql'

export default function ({ skip, returning, variables }) {
  return {
    data () {
      return {
        trips: []
      }
    },

    apollo: {
      trips: {
        skip: skip,
        query: queryString('trips', returning || `
          tp_number
          load_carrying
          unloaded_quantity
      `),

        // Error handling
        error (error) {
          console.error('We\'ve got an error! for TPS', error)
        },

        // Optional result hook
        result ({ data, loading, networkStatus }) {
          console.log('We got some result! for TPS', data)
        },

        fetchPolicy: 'no-cache',

        variables: variables || function () {
          const obj = {
            where: {
              permit_id: {
                _eq: this.account.id
              },
              unloaded_quantity: {
                _gt: 0.0
              }
            }
          }

          return obj
        }
      }
    }

  }
}
