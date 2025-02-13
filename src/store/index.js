import Vue from 'vue'
import Vuex from 'vuex'
import VueCookies from 'vue-cookies'

import store from './store'

Vue.use(Vuex)
Vue.use(VueCookies)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      store
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
