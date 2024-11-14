import { queryString } from '../utils/gql'

export default {
  data () {
    return {
      vendorFilter: '',
      vendors: []
    }
  },

  apollo: {
    vendors: {

      query: queryString('vendors', `
          id
          name
      `),

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        console.log('We got some result!', data)
      },

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

        if (this.vendorFilter) {
          obj.where._or = [
            {
              name: {
                _ilike: `%${this.vendorFilter}%`
              }
            },
            {
              gstn_pan: {
                _ilike: `%${this.vendorFilter}%`
              }
            },
            {
              phone_number: {
                _ilike: `%${this.vendorFilter}%`
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
    filterVendors (val, update, abort) {
      update(() => {
        this.vendorFilter = val.toLowerCase()
      })
    }
  }
}
