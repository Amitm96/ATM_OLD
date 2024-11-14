export default {
  data () {
    return {
      columns,
      filter: '',
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 1,
        rowsNumber: 1
      }
    }
  },

  apollo: {
    owners: {
      query: ownersQuery,

      fetchPolicy: 'network-only',

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data.owners_aggregate.aggregate.count
        console.log('We got some result!', data, this.pagination)
      },

      variables () {
        const obj = {
          order_by: {
            [this.pagination.sortBy]: this.pagination.descending ? 'desc_nulls_last' : 'asc_nulls_last'
          },
          where: {
            company_id: {
              _eq: this.userDetails.company.id
            }
          }
        }

        if (this.pagination.rowsPerPage) {
          obj.limit = this.pagination.rowsPerPage
          obj.offset = (this.pagination.page - 1) * this.pagination.rowsPerPage
        }

        if (this.filter) {
          obj.where.text_search = {
            _ilike: `%${this.filter}%`
          }
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

    deleteOwner (id) {
      Loading.show({
        spinner: QSpinnerIos,
        spinnerSize: '2em'
      })
      // Call to the graphql mutation
      this.$apollo.mutate({
      // Query
        mutation: gql`mutation delete_owner($where: owners_bool_exp!) {
          delete_owners(where: $where) {
            affected_rows
          }
        }`,
        update: (store, { data }) => {
          // if (data.delete_owners.affected_rows) {
          this.$apollo.queries.owners.refetch()
          // }
        },
        // Parameters
        variables: {
          where: {
            id: {
              _eq: id
            }
          }
        }
      }).then((data) => {
        // Result
        console.log(data)
        Loading.hide()
        return Notify.create({
          message: 'Successfully deleted',
          color: 'positive',
          icon: 'info'
        })
      }).catch((error) => {
        // Error
        console.error(error)
        Loading.hide()
        return Notify.create({
          message: error.message,
          color: 'negative',
          icon: 'warning'
        })
      })
    }
  }
}
