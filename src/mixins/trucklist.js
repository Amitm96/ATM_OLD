import { insertString } from '../utils/gql'

export default {
  methods: {
    async insertTruckInTrucklist (trucklist, truck) {
      const response = await this.$apollo.mutate({
        mutation: insertString('truck_lists', `
          affected_rows
        `, true),

        variables: {
          objects: {
            company_id: this.userDetails.company_id,
            name: trucklist.name,
            trucks: {
              data: {
                truck: {
                  data: {
                    truck_number: truck.truck_number,
                    companies_bridge: {
                      data: {
                        company_id: this.userDetails.company_id
                      },
                      on_conflict: {
                        constraint: 'companies_trucks_bridge_company_id_truck_id_key',
                        update_columns: ['truck_id', 'company_id']
                      }
                    },
                    owner_id: truck.owner ? truck.owner.id : null
                  },
                  on_conflict: {
                    constraint: 'trucks_truck_number_key',
                    update_columns: ['company_id', 'owner_id']
                  }
                }
              },
              on_conflict: {
                constraint: 'truck_list_bridge_pkey',
                update_columns: ['truck_id']
              }
            }
          },
          on_conflict: {
            constraint: 'truck_lists_name_company_id_key',
            update_columns: 'company_id'
          }
        }
      })

      console.log(response)
    }
  }
}
