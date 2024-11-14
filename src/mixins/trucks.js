import { queryString } from '../utils/gql'

export default {
  data () {
    return {
      truckFilter: '',
      trucks: []
    }
  },

  apollo: {
    trucks: {

      query: queryString('trucks', `
          id
          truck_number
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

        if (this.truckFilter) {
          obj.where.truck_number = {
            _ilike: `%${this.truckFilter}%`
          }
        }

        console.log(obj)
        return obj
      }
    }
  },

  methods: {
    filterTrucks (val, update, abort) {
      update(() => {
        this.truckFilter = val.toLowerCase()
      })
    }
  }
}
