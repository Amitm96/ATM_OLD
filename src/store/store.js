import { firebaseAuth } from 'boot/firebase'
import { apolloClient } from 'boot/apollo'
import { ipcRenderer } from 'electron'
import Vue from 'vue'
import moment from 'moment'

import { loginUserQuery, insertString, queryString, deleteString } from '../utils/gql'

import { Notify,
  Loading,
  QSpinnerIos
} from 'quasar'

let tagging = []
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

async function startTagging () {
  while (true) {
    while (!tagging.length) {
      await delay(10000)
    }

    const t = tagging
    tagging = []

    for (let permit of t) {
      console.log('tagging/untagging permit', permit)

      const toTag = permit.tagging.filter(t => t.status === 0)
      const toRelease = permit.tagging.filter(t => t.status === 1)

      if (toTag.length) {
        ipcRenderer.send('tag-vehicles', {
          ...permit,
          trucks: toTag.map(t => t.truck)
        })

        const p = new Promise((resolve, reject) => {
          ipcRenderer.removeAllListeners('tag-result')
          ipcRenderer.on('tag-result', async function (event, response) {
            // if (!response || !response.length) {
            resolve()
            // } else {
            //  reject(retries)
            // }
          })
        })
        await p
      }

      if (toRelease.length) {
        ipcRenderer.send('release-vehicles', {
          ...permit,
          trucks: toRelease.map(t => t.truck.truck_number)
        })

        const p = new Promise((resolve, reject) => {
          ipcRenderer.removeAllListeners('release-vehicles-results')
          ipcRenderer.on('release-vehicles-results', async function (event, response) {
            // if (!response || !response.length) {
            resolve()
            // } else {
            //  reject(retries)
            // }
          })
        })
        await p
      }

      const response = await apolloClient.mutate({
        // Query
        mutation: deleteString('tagging', `
      affected_rows
    `, true),

        variables: {
          where: {
            id: {
              _in: permit.tagging.map(t => t.id)
            }
          }
        }
      })

      console.log(response)
    }

    // update status of tagging
    console.log('finished tagging t')
  }
}

const state = {
  lastRoute: [],
  userDetails: {}
}

const mutations = {
  setUserDetails (state, payload) {
    console.log('userDetails', payload)
    state.userDetails = payload
  },

  updateUserDetails (state, payload) {
    Object.assign(state.userDetails, payload)
  },

  setDocuments (state, payload) {
    state[payload.collection] = payload.value
  },

  deleteDocument (state, payload) {
    state[payload.collection].splice(state[payload.collection].findIndex(a => a.id === payload.key), 1)
  },

  addDocument (state, payload) {
    state[payload.collection].push(payload.value)
  },

  setValue (state, payload) {
    state[payload.key] = payload.value
  },

  popDocument (state, payload) {
    console.log('calling state', payload)
    return state[payload].pop()
  }
}

const actions = {

  registerUser ({ commit, dispatch }, payload) {
    // fully customizable
    Loading.show({
      spinner: QSpinnerIos,
      spinnerSize: '2em'
      // other props
    })

    firebaseAuth.createUserWithEmailAndPassword(payload.email, payload.password)
      .then(response => {
        console.log(response)

        let userId = firebaseAuth.currentUser.uid
        delete payload.password
        payload.uid = userId

        return apolloClient.mutate({
          // Query
          mutation: insertString('users', `
            affected_rows
          `),
          // Parameters
          variables: {
            objects: [ payload ]
          }
        }).then((data) => {
          console.log(data)
          Notify.create({
            message: 'Successfully registered',
            color: 'positive',
            icon: 'info'
          })
          dispatch('populateUserDetails', userId)
          commit('setUserDetails', {
            userId: userId
          })
          this.$router.replace('/')
        })
      })
      .catch(error => {
        Notify.create({
          message: error.message,
          color: 'negative',
          icon: 'warning'
        })
        console.log(error.message)
      })
      .finally(() => {
        Loading.hide()
      })
  },

  loginUser ({ commit, dispatch }, payload, user) {
    Loading.show({
      spinner: QSpinnerIos,
      spinnerSize: '2em'
    })

    firebaseAuth.signInWithEmailAndPassword(payload.email, payload.password)
      .then(response => {
        console.log(response)
        // dispatch('populateUserDetails', response.user.uid)
        commit('setUserDetails', {
          userId: response.user.uid,
          ...user
        })
        Vue.$cookies.set('fre8-auth-ex', 'fre8')
        this.$router.replace('/')
      })
      .catch(error => {
        Loading.hide()
        Notify.create({
          message: error.message,
          color: 'negative',
          icon: 'warning'
        })
        console.log(error.message)
      })
  },

  logoutUser () {
    Vue.$cookies.remove('fre8-auth-ex')
    return firebaseAuth.signOut()
  },

  async sendPasswordResetEmail ({ commit }, email) {
    Loading.show({
      spinner: QSpinnerIos,
      spinnerSize: '2em'
    })

    console.log(email)
    try {
      await firebaseAuth.sendPasswordResetEmail(email)
      // Email sent.
      Loading.hide()
      Notify.create({
        message: 'Successfully sent email, please check your email',
        color: 'positive',
        icon: 'info'
      })
    } catch (error) {
      // An error happened.
      Loading.hide()
      Notify.create({
        message: error.message,
        color: 'negative',
        icon: 'warning'
      })
    }
  },

  populateUserDetails ({ commit, dispatch }, userId) {
    apolloClient.query({
      query: loginUserQuery,
      variables: {
        where: {
          uid: {
            _eq: userId
          }
        }
      }
    })
      .then(snapshot => {
        console.log(snapshot)
        let userDetails = snapshot.data.users[0]
        if (userDetails) {
          userDetails.userId = userId
          Loading.hide()

          if (userDetails.company.status !== 1) {
            dispatch('logoutUser')
            this.$router.replace('/auth')
            return Notify.create({
              message: 'Company is not active, please contact fre8wise customer care',
              color: 'negative',
              icon: 'warning'
            })
          }

          let expDate = moment(userDetails.company.expiration_date).valueOf()
          let curDate = moment.now().valueOf()
          if (curDate > expDate) {
            dispatch('logoutUser')
            return Notify.create({
              message: 'Your Company\'s subscription is over, please contact fre8wise customer care',
              color: 'negative',
              icon: 'warning'
            })
          }

          if (userDetails.status !== 1) {
            dispatch('logoutUser')
            this.$router.replace('/auth')
            return Notify.create({
              message:
                'User is not active, please contact your admin',
              color: 'negative',
              icon: 'warning'
            })
          }

          commit('setUserDetails', userDetails)
        }
      })
  },

  handleAuthStateChanged ({ commit, dispatch, state }) {
    // subscribe to tag/release requests from mobile
    startTagging()
    apolloClient.subscribe({
      // Query
      query: queryString('permits', `
        id
        permit_number
        start_date
        end_date
        tag_url
        tagged
        vehicle_details
        source
        source_destination
        quantity
        company_id
        account_id
        credentials: account {
          id
          name
          username: i3ms_username
          password: i3ms_password
        }

        tagging {
          id
          truck {
            id
            truck_number
          }
          status
        }
      `, true),
      // Parameters
      variables: {
        where: {
          company_id: {
            _eq: state.userDetails.company_id
          },
          tagging: {
            status: {
              _lt: 2
            }
          }
        }
      }
    }).subscribe({
      next (response) {
        console.log('received new data for tagging', response)
        tagging.push(...response.data.permits)
      },
      error (err) { console.error('err', err) }
    })

    Loading.show({
      spinner: QSpinnerIos,
      spinnerSize: '2em'
    })

    firebaseAuth.onAuthStateChanged(async user => {
      Loading.hide()

      if (firebaseAuth.currentUser) {
        let userId = firebaseAuth.currentUser.uid

        // User is logged in.
        firebaseAuth.currentUser.getIdToken(true)
          .then(token => {
            commit('updateUserDetails', {
              token: token
            })
          })
        // const token = await user.getIdToken()
        // const idTokenResult = await user.getIdTokenResult()
        // const hasuraClaim =
        //   idTokenResult.claims['https://hasura.io/jwt/claims']
        dispatch('populateUserDetails', userId)
        console.log('onauthstatechanged called', this.$router.currentRoute)
        commit('setUserDetails', {
          userId: userId
        })

        // this.$router.replace('/permits')
      } else {
        // User is logged out.
        commit('setUserDetails', {})
        this.$router.replace('/auth')
      }
    })
  }
}

const getters = {
  userDetails (state) { return state.userDetails },
  lastRoute (state) { return state.lastRoute }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
