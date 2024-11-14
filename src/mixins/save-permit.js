import { insertString } from '../utils/gql'

export default {

  methods: {
    async savePermit (permit) {
      delete permit.sender
      delete permit.credentials
      delete permit.__typename
      delete permit.loading
      delete permit.delivered

      console.log('savepermit called')

      if (permit.trips && permit.trips.length) {
        permit.trips = {
          data: permit.trips.map(t => ({
            ...t,
            truck: {
              data: {
                truck_number: t.truck_number,
                companies_bridge: {
                  data: {
                    company_id: this.userDetails.company_id
                  },
                  on_conflict: {
                    constraint: 'companies_trucks_bridge_company_id_truck_id_key',
                    update_columns: 'truck_id'
                  }
                }
              },
              on_conflict: {
                constraint: 'trucks_truck_number_key',
                update_columns: [
                  'truck_number', 'company_id'
                ]
              }
            }
          })),

          on_conflict: {
            constraint: 'trips_tp_number_key',
            update_columns: []
          }
        }
      } else {
        delete permit.trips
      }

      permit.taggedSuccess = permit.taggedSuccess || []
      permit.tagged = Object.assign(permit.tagged || {}, permit.taggedSuccess.reduce((p, t) => {
        p[t] = ''
        return p
      }, {}))

      delete permit.taggedSuccess

      // TODO deleting client for fixing refresh bug
      permit.client = null

      const response = await this.$apollo.mutate({
        mutation: insertString('permits', `
        affected_rows
      `, true),

        variables: {
          objects: permit,
          on_conflict: {
            constraint: 'permits_account_id_permit_number_key',
            update_columns: [
              'source',
              'quantity',
              'start_date',
              'tag_url',
              'vehicle_details',
              'end_date',
              'tagged'
            ]
          }
        }
      })

      console.log(response)
    }
  }
}
