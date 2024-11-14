import gql from 'graphql-tag'

export const userFields = `
    id
    name
    status
    uid
    email
    role
    company_id
    company {
      name
      id
      allowed_users
      status
      type
      payment_commission
      expiration_date
      accounts {
        address1
        address2
        cgst
        city
        i3ms_password
        i3ms_username
        id
        igst
        name
        pincode
        sgst
        terms
        state
      }
    }
`

export const paymentFields = `
  id
  created_at
  status
  mode
  transaction_ref
  bank_name
  payment_date
  gst_tds

  account {
    id
    name
    address1
    address2
  }

  owner {
    id
    name
    phone_number
    gstn_pan
    gst_tds
    extra
    bank_account
    bank_ifsc
  }

  trips {
    extra
    id
    advance
    discount
    fuel
    load_carrying
    lr_number
    penalty
    permit_id
    permit {
      id
      permit_number
      source_destination
      owner_rate_per_tonne
      owner_shortage_per_tonne
      owner_shortage_percentage
    }
    tp_date
    tp_number
    tp_url
    truck_id
    truck_number
    unloaded_quantity
  }

  trips_aggregate {
    aggregate {
      count
      sum {
        load_carrying
        unloaded_quantity
      }
    }
  }

  normal_trips {
    extra
    id
    discount
    load_carrying
    lr_number
    penalty
    order_id
    order {
      id
      order_number
      source_destination
      owner_rate_per_tonne
      owner_shortage_per_tonne
      owner_shortage_percentage
    }
    trip_date
    invoice_number
    truck_id
    truck_number
    unloaded_quantity
  }

  normal_trips_aggregate {
    aggregate {
      count
      sum {
        load_carrying
        unloaded_quantity
      }
    }
  }
`

export const vendorPaymentFields = `
  id
  created_at
  status
  mode
  transaction_ref
  bank_name
  payment_date
  gst_tds

  account {
    id
    name
    address1
    address2
  }

  vendor {
    id
    name
    phone_number
    gstn_pan
    gst_tds
  }

  trips {
    extra
    id
    advance
    discount
    fuel
    load_carrying
    lr_number
    penalty
    permit_id
    permit {
      id
      permit_number
      source_destination
      owner_rate_per_tonne
      owner_shortage_per_tonne
      owner_shortage_percentage
    }
    tp_date
    tp_number
    tp_url
    truck_id
    truck_number
    unloaded_quantity
  }

  trips_aggregate {
    aggregate {
      count
      sum {
        load_carrying
        unloaded_quantity
      }
    }
  }

  normal_trips {
    extra
    id
    discount
    load_carrying
    lr_number
    penalty
    truck_id
    truck_number
    unloaded_quantity
  }

  normal_trips_aggregate {
    aggregate {
      count
      sum {
        load_carrying
        unloaded_quantity
      }
    }
  }
`

export let ownersQuery = gql`
  query Owners($limit: Int, $offset: Int, $order_by: [owners_order_by!], $where: owners_bool_exp) {
    owners(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
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
        pan
        aadhaar
        bank_passbook
    }
    owners_aggregate(where: $where) {
      aggregate {
        count
      }
    }
}`

export let vendorsQuery = gql`
  query Vendors($limit: Int, $offset: Int, $order_by: [vendors_order_by!], $where: vendors_bool_exp) {
    vendors(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
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
    }
    vendors_aggregate(where: $where) {
      aggregate {
        count
      }
    }
}`

export let trucklistsQuery = gql`
  query Trucklists($limit: Int, $offset: Int, $order_by: [truck_lists_order_by!], $where: truck_lists_bool_exp) {
    truck_lists(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
      id
      name
      trucks_aggregate {
        aggregate {
          count
        }
      }
    }
    truck_lists_aggregate(where: $where) {
      aggregate {
        count
      }
    }
}`

export let loginUserQuery = gql`query user($where: users_bool_exp!) {
  users(limit: 1, where: $where) {
    ${userFields}
  }
}`

export function listQuery (table, returning) {
  return gql`
    query ${table}List($limit: Int, $offset: Int, $order_by: [${table}_order_by!], $where: ${table}_bool_exp) {

      ${table}(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
        ${returning}
      }

      ${table}_aggregate(where: $where) {
        aggregate {
          count
        }
      }
  }`
}

export function queryString (table, returning, subscribe) {
  const query = table
  table = table.replace(/_aggregate$/i, '')

  const t = subscribe ? 'subscription' : 'query'

  const q = gql`${t} ${table}($where: ${table}_bool_exp!,
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

export function insertString (table, returning, onConflict) {
  if (onConflict) {
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

export function updateString (table, returning) {
  return gql`mutation update${table}($set: ${table}_set_input, $inc: ${table}_inc_input, $where: ${table}_bool_exp!) {
    update_${table}(where: $where, _set: $set, _inc: $inc) {
      ${returning || ''}
      affected_rows
    }
  }`
}

export function deleteString (table, returning) {
  return gql`mutation delete${table}($where: ${table}_bool_exp!) {
    delete_${table}(where: $where) {
      ${returning || ''}
      affected_rows
    }
  }`
}

export let tripReportQuery = gql`query Owners($limit: Int, $offset: Int, $order_by: [owners_order_by!], $where: owners_bool_exp) {
  owners(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
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
  }
  owners_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`
