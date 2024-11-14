import { queryString } from '../utils/gql'

export default function ({ skip, returning }) {
  return {
    data () {
      return {
        ownerFilter: '',
        owners: []
      }
    },

    apollo: {
      owners: {
        skip: skip,
        query: queryString('owners', returning || `
          id
          name
          phone_number
          city
          gst_tds
          gstn_pan
          address1
          address2
          state
          pincode
          bank_account
          bank_ifsc
          extra
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

          if (this.ownerFilter) {
            obj.where._or = [
              {
                name: {
                  _ilike: `%${this.ownerFilter}%`
                }
              },
              {
                gstn_pan: {
                  _ilike: `%${this.ownerFilter}%`
                }
              },
              {
                phone_number: {
                  _ilike: `%${this.ownerFilter}%`
                }
              }
            ]
          }

          return obj
        }
      }
    },

    methods: {
      filterOwners (val, update, abort) {
        update(() => {
          this.ownerFilter = val.toLowerCase()
        })
      }
    }
  }
}
