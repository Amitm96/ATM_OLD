
import { queryString } from './gql'
import moment from 'moment'

export function getObjectById (client, table, returning, id) {
  return client.query({
    query: queryString(table, returning),
    variables: {
      where: {
        id: {
          _eq: id
        }
      }
    }
  })
}

export function getCurrentFinancialYear (date) {
  console.log('get current called', date)
  if (date) {
    date = moment(date).toDate()
  } else {
    date = new Date()
  }

  if ((date.getMonth() + 1) <= 3) {
    return date.getFullYear() - 1
  } else {
    return date.getFullYear()
  }
}

export async function confirmDialog (dialog, title, message) {
  return new Promise((resolve, reject) => {
    dialog({
      title: title || 'Confirm',
      message: message || 'Are you sure to delete?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      resolve(true)
    }).onOk(() => {
    }).onCancel(() => {
      resolve(false)
    })
  })
}

export function hasPermission (userDetail, permissions) {
  return permissions.includes(userDetail.role)
}
