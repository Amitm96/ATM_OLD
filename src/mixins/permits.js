import { queryString } from '../utils/gql'

export default function ({ skip, returning, variables, fetchPolicy }) {
  return {
    data () {
      return {
        permitFilter: '',
        permits: [],
        permit: null
      }
    },

    apollo: {
      permits: {
        skip: skip,
        query: queryString('permits', returning || `
          id
          permit_number
          client_rate_per_tonne
          quantity
        `),

        fetchPolicy: fetchPolicy,

        // Error handling
        error (error) {
          console.error('We\'ve got an error!', error)
        },

        // Optional result hook
        result ({ data, loading, networkStatus }) {
          console.log('We got some result!', data)
        },

        variables: variables || function () {
          const obj = {
            limit: 100,
            order_by: {
              start_date: 'desc'
            },
            where: {
              account_id: {
                _eq: this.account.id
              }
            }
          }

          if (this.permitFilter) {
            obj.where.permit_number = {
              _ilike: `%${this.permitFilter}%`
            }
          }

          return obj
        }
      }
    },

    methods: {
      filterPermits (val, update, abort) {
        update(() => {
          this.permitFilter = val.toLowerCase()
        })
      }
    }
  }
}
