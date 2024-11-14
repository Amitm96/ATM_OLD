import ApolloClient from 'apollo-client'
import fetch from 'node-fetch'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'

const httpLink = new HttpLink({
  fetch,
  uri:  process.env.NODE_ENV === 'development' ? 'http://localhost:8080/v1/graphql' :  'http://ta.fre8wise.com/v1/graphql',
  headers: {
    'x-hasura-admin-secret': process.env.NODE_ENV === 'development' ? 'Nc5%8L@d-gCsGSd3$G%Sd3' : 'Nc5%8L@d-gCsGSd3$G%Sd3'
  }
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

function queryString (table, returning) {
  const query = table
  table = table.replace(/_aggregate$/i, '')

  const q = gql`query ${table}($where: ${table}_bool_exp!,
      $limit: Int, $offset: Int, $order_by: [${table}_order_by!],
      $distinct_on: [${table}_select_column!]) {
    ${query}(where: $where, limit: $limit, offset: $offset, order_by: $order_by, distinct_on: $distinct_on) {
      ${returning}
    }
  }
  `
  console.log(q)
  return q
}

export function insertString (table, returning, on_conflict) {
  if (on_conflict) {
    return gql`mutation insert${table}($objects: [${table}_insert_input!]!, $on_conflict: ${table}_on_conflict) {
      insert_${table}(objects: $objects, on_conflict: $on_conflict) {
        ${returning || ''}
        affected_rows
      }
    }`
  }
  return gql`mutation insert${table}($objects: [${table}_insert_input!]!) {
    insert_${table}(objects: $objects) {
      ${returning || ''}
      affected_rows
    }
  }`
}

function updateString (table, returning) {
  return gql`mutation update${table}($set: ${table}_set_input, $inc: ${table}_inc_input, $where: ${table}_bool_exp!) {
    update_${table}(where: $where, _set: $set, _inc: $inc) {
      ${returning || ''}
      affected_rows
    }
  }`
}

function deleteString (table, returning) {
  return gql`mutation delete${table}($where: ${table}_bool_exp!) {
    delete_${table}(where: $where) {
      ${returning || ''}
      affected_rows
    }
  }`
}

export async function query (table, returning, variables) {
  const ret = await client.query({
    query: queryString(table, returning),
    variables: variables
  })

  return ret.data[`${table}`]
}

export async function insert (table, returning, variables) {
  const ret = await client.mutate({
    mutation: insertString(table, returning, variables.on_conflict),
    variables: variables
  })

  return ret.data[`insert_${table}`]
}

export async function update (table, returning, variables) {
  const ret = await client.mutate({
    mutation: updateString(table, returning),
    variables: variables
  })

  return ret.data[`update_${table}`]
}

export async function remove (table, returning, variables) {
  const ret = await client.mutate({
    mutation: deleteString(table, returning),
    variables: variables
  })

  return ret.data[`delete_${table}`]
}
