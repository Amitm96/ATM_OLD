import { queryString } from '../utils/gql'

export default {
  data () {
    return {
      trucklistFilter: '',
      trucklists: [],
      trucklist: null
    }
  },

  apollo: {
    trucklists: {

      query: queryString('truck_lists', `
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

      update (data) {
        return data.truck_lists
      },

      fetchPolicy: 'network-only',

      variables () {
        const obj = {
          limit: 50,
          where: {
            company_id: {
              _eq: this.userDetails.company_id
            }
          }
        }

        if (this.trucklistFilter) {
          obj.where.name = {
            _ilike: `%${this.trucklistFilter}%`
          }
        }

        console.log(obj)
        return obj
      }
    }
  },

  methods: {
    filterTrucklists (val, update, abort) {
      update(() => {
        this.trucklistFilter = val.toLowerCase()
      })
    }
  }
}
