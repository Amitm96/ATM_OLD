import { queryString } from '../utils/gql'

export default function ({ skip, returning }) {
  return {
    data () {
      return {
        accountFilter: '',
        accounts: [],
        account: null
      }
    },

    apollo: {
      accounts: {
        skip: skip,
        query: queryString('accounts', returning || `
        i3ms_password
        i3ms_username
        id
        name
        company_id
        senderids {
          id
          name
        }
        gstn
        igst
        cgst
        sgst
        terms
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
              company_id: {
                _eq: this.userDetails.company_id
              }
            }
          }

          if (this.accountFilter) {
            obj.where._or = [
              {
                name: {
                  _ilike: `%${this.accountFilter}%`
                }
              },
              {
                gstn: {
                  _ilike: `%${this.accountFilter}%`
                }
              }
            ]
          }

          return obj
        }
      }
    },

    methods: {
      filterAccounts (val, update, abort) {
        update(() => {
          this.accountFilter = val.toLowerCase()
        })
      }
    }
  }
}
