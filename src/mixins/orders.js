import { queryString } from '../utils/gql'

export default function ({ skip, returning, variables }) {
  return {
    data () {
      return {
        orderFilter: '',
        permits: []
      }
    },

    apollo: {
      permits: {
        skip: skip,
        query: queryString('permits', returning || `
          id
          permit_number
          client_id
          client_rate_per_tonne
          quantity
          client_shortage_percentage
          client_shortage_per_tonne
      `),

        // Error handling
        error (error) {
          console.error('We\'ve got an error! for orders', error)
        },

        // Optional result hook
        result ({ data, loading, networkStatus }) {
          console.log('We got some result! for orders', data)
        },

        fetchPolicy: 'no-cache',

        variables: variables || function () {
          const obj = {
            limit: 50,
            where: {
              account_id: {
                _eq: this.account.id
              }
            }
          }

          if (this.orderFilter) {
            obj.where.order_number = {
              _ilike: `%${this.orderFilter}%`
            }
          }

          return obj
        }
      }
    },

    methods: {
      filterOrders (val, update, abort) {
        update(() => {
          this.orderFilter = val.toLowerCase()
        })
      }
    }
  }
}
