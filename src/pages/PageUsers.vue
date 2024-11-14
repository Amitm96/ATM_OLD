<template>
    <q-page padding="">

    <q-table
      :data="users"
      :loading="$apollo.queries.users.loading"
      :columns="columns"
      :pagination.sync="pagination"
      title="Permits"
      binary-state-sort
      @request="onRequest"
      row-key="permit_number">

      <template v-slot:top-right>
        <q-input
          class="q-pl-md q-pr-md searchBar"
          style="width: 200px"
          clearable
          clear-icon="clear"
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search...">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

      </template>

        <template v-slot:body-cell-actions="props">
            <q-td key="actions" auto-width no-hover>
              <div>
               <q-btn
                flat
                size="sm"
                :icon="props.row.status === 1 ? 'close': 'check'"
                @click.native="updateUser(props.row)"
              >
                <q-tooltip content-class="bg-primary">{{ props.row.status === 0 ? 'Enable User': 'Disable User' }}</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                flat
                icon="delete"
                @click.native="confirmAndDeleteDocument(props.row)"
              >
                <q-tooltip content-class="bg-primary">Delete User</q-tooltip>
              </q-btn>
              </div>
            </q-td>
        </template>
      </q-table>
  </q-page>
</template>

<script>

import { mapState } from 'vuex'

import { Notify,
  Loading,
  QSpinnerIos
} from 'quasar'

import { listQuery, deleteString, updateString } from '../utils/gql'
import { cloudfunctionsBaseUrl } from 'boot/firebase'
import axios from 'axios'

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    field: 'email',
    sortable: true
  },
  { name: 'phone_number',
    align: 'left',
    label: 'Phone Number',
    field: 'phone_number'
  },
  {
    name: 'role',
    align: 'left',
    label: 'Role',
    field: 'role'
  },

  { name: 'actions',
    align: 'center',
    label: 'Actions',
    field: 'id'
  }
]

export default {

  name: 'UserList',

  data () {
    return {
      columns,
      filter: '',
      users: [],
      pagination: {
        sortBy: 'name',
        descending: true,
        page: 1,
        rowsPerPage: 50,
        rowsNumber: 1
      }
    }
  },

  apollo: {
    users: {
      query () {
        return listQuery('users', `
          id
          name
          status
          uid
          email
          phone_number
          role
        `)
      },

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data.users_aggregate.aggregate.count
        console.log('We got some result!', data, this.pagination)
      },

      variables () {
        const obj = {
          where: {
            company_id: {
              _eq: this.userDetails.company_id
            },
            role: {
              _neq: 'admin'
            }
          }
        }

        if (this.pagination.sortBy) {
          obj.order_by = {
            [this.pagination.sortBy]: this.pagination.descending ? 'desc_nulls_last' : 'asc_nulls_last'
          }
        }

        if (this.pagination.rowsPerPage) {
          obj.limit = this.pagination.rowsPerPage
          obj.offset = (this.pagination.page - 1) * this.pagination.rowsPerPage
        }

        if (this.filter) {
          obj.where._or = [
            {
              name: {
                _ilike: `%${this.filter}%`
              }
            },
            {
              email: {
                _ilike: `%${this.filter}%`
              }
            },
            {
              phone_number: {
                _ilike: `%${this.filter}%`
              }
            }
          ]
        }

        return obj
      }
    }
  },

  computed: {
    ...mapState('store', ['userDetails'])
  },

  methods: {
    onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
    },

    async updateUser (user) {
      user.status = user.status === 1 ? 0 : 1
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })

      try {
        const response = await this.$apollo.mutate({
          mutation: updateString('users', `
            affected_rows
          `),
          variables: {
            set: {
              status: user.status
            },
            where: {
              id: {
                _eq: user.id
              }
            }
          }
        })

        console.log(response)
      } catch (ex) {
        console.error(ex)
      }

      Loading.hide()
    },

    async deleteUser (uid) {
      const url = `${cloudfunctionsBaseUrl}/deleteuser?uid=${uid}`

      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + this.userDetails.token
        }
      })

      return response.json()
    },

    confirmAndDeleteDocument (user) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Are you sure to delete?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        Loading.show({
          spinner: QSpinnerIos,
          spinnerSize: '2em'
        })

        try {
          this.deleteUser(user.uid)

          // Call to the graphql mutation
          const data = this.$apollo.mutate({
            // Query
            mutation: deleteString('users', `
              affected_rows
            `),

            update: (store, { data }) => {
              this.$apollo.queries.users.refetch()
            },

            // Parameters
            variables: {
              where: {
                id: {
                  _eq: user.id
                }
              }
            }
          })
          // Result
          console.log(data)
          Loading.hide()
          return Notify.create({
            message: 'Successfully deleted',
            color: 'positive',
            icon: 'info'
          })
        } catch (error) {
          // Error
          console.error(error)
          Loading.hide()
          return Notify.create({
            message: error.message,
            color: 'negative',
            icon: 'warning'
          })
        }
      }).onOk(() => {
      }).onCancel(() => {
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.searchBar {
  background-color #e9ebed;
  border-radius 4px
}
</style>
