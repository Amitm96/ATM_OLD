<template>
  <div class="q-pa-md">
     <div class="q-mt-xl q-mr-md q-pt-md fixed-right">
      <q-btn class="q-mr-md" v-if="bulkrow" :to="bulkrow" color="primary" icon-right="add_circle_outline" :label="bulklabel" />
      <q-btn v-if="newrow" :to="newrow" color="primary" icon-right="add_circle_outline" :label="newlabel" />
    </div>
    <div class="q-pt-xl">
      <q-table
        :title="title"
        :data="list"
        :columns="columns"
        :loading="$apollo.queries.list.loading"
        :pagination.sync="pagination"
        :row-key="rowkey"
        binary-state-sort
        @request="onRequest"
      >
       <template v-slot:top-right>
       <q-input
          v-if="searchField !== false"
          clearable
          class="q-pl-md q-pr-md searchBar"
          style="width: 200px"
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
          <q-td key="actions" align="right" auto-width no-hover>
            <div class="row q-pr-md" v-if="props.col.actions">
              <q-btn
                :disable="action.disable ? action.disable(props): false"
                v-for="action in props.col.actions"
                :key="action.icon"
                class="col q-ml-md q-mr-sm"
                size="sm"
                flat
                :icon="action.icon"
                @click.native="action.icon === 'delete' ? confirmAndDeleteDocument(props.row.id)
                   :  (action.click ? action.click(props): null)"
                :to="action.to ? action.to(props): null"

              >
                <q-tooltip content-class="bg-primary">{{ action.tooltip }}</q-tooltip>
              </q-btn>
            </div>
             <div
             v-else
             class="row">
              <q-btn
                              v-if="!props.col.no_edit"

                class="col"
                size="sm"
                flat
                icon="edit"
                :to="{name: editrow, params: {[editprop]: props.row, id: props.row.id}}"
              >
                <q-tooltip content-class="bg-primary">Edit</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!props.col.no_delete"
                class="col q-ml-md q-mr-sm"
                size="sm"
                flat
                icon="delete"
                @click.native="confirmAndDeleteDocument(props.row.id)"
              >
                <q-tooltip content-class="bg-primary">Delete</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'

import { deleteString } from '../utils/gql'

import { Notify,
  Loading,
  QSpinnerIos
} from 'quasar'

export default {

  created () {
    console.log('searchField', this.searchField)
  },

  props: {
    columns: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    query: {
      type: Object,
      required: true
    },
    newrow: {
      type: String,
      required: true
    },
    newlabel: {
      type: String,
      required: true
    },
    bulkrow: {
      type: String,
      required: false
    },
    bulklabel: {
      type: String,
      required: false
    },
    editrow: {
      type: String,
      required: true
    },
    editprop: {
      type: String,
      required: true
    },
    rowkey: {
      type: String,
      required: true
    },
    searchField: {
      required: false
    },
    where: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      filter: '',
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        rowsNumber: 1
      }
    }
  },

  apollo: {
    list: {
      query () {
        return this.query
      },

      fetchPolicy: 'network-only',

      update (data) {
        return data[this.collection]
      },

      // Error handling
      error (error) {
        console.error('We\'ve got an error!', error)
      },

      // Optional result hook
      result ({ data, loading, networkStatus }) {
        this.pagination.rowsNumber = data[`${this.collection}_aggregate`].aggregate.count
        console.log('We got some result!', data, this.pagination)
      },

      variables () {
        const obj = {
          where: {}
        }

        if (this.where) {
          obj.where = {
            ...this.where
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

        if (this.filter && (this.searchField || this.searchField !== false)) {
          console.log(this.filter, 'filter')
          if (typeof (this.searchField) === 'function') {
            Object.assign(obj.where, this.searchField(this.filter))
          } else {
            obj.where[this.searchField || 'text_search'] = {
              _ilike: `%${this.filter}%`
            }
          }
        }

        console.log(obj.where, this.where)

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

    confirmAndDeleteDocument (id) {
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
        // Call to the graphql mutation
        this.$apollo.mutate({
          // Query
          mutation: deleteString(this.collection, `
            affected_rows
          `),

          update: (store, { data }) => {
            this.$apollo.queries.list.refetch()
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
      }).onOk(() => {
      }).onCancel(() => {
      })
    }
  }
}
</script>

<style lang="stylus">
.searchBar {
  background-color #e9ebed;
  border-radius 4px
}
</style>
