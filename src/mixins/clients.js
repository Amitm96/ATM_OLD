import { queryString } from '../utils/gql'

export default {
  data () {
    return {
      clientFilter: '',
      clients: [],
      client: null
    }
  },

  apollo: {
    clients: {

      query: queryString('clients', `
        id
        name
        gstn
        address1
        address2
        city
        state
        pincode
        phone_number
      `),

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        console.log('We got some result!', data)
      },

      fetchPolicy: 'network-only',

      variables () {
        const obj = {
          limit: 50,
          where: {
            companies_bridge: {
              company_id: {
                _eq: this.userDetails.company_id
              }
            }
          }
        }

        if (this.clientFilter) {
          obj.where._or = [
            {
              name: {
                _ilike: `%${this.clientFilter}%`
              }
            },
            {
              gstn_pan: {
                _ilike: `%${this.clientFilter}%`
              }
            },
            {
              phone_number: {
                _ilike: `%${this.clientFilter}%`
              }
            }
          ]
        }

        console.log(obj)
        return obj
      }
    }
  },

  methods: {
    filterClients (val, update, abort) {
      update(() => {
        this.clientFilter = val.toLowerCase()
      })
    }
  }
}
