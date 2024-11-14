import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,
    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  // Router.beforeEach((to, from, next) => {
  //   console.log('before each called', to, from, store.getters['store/userDetails'])

  //   if (!store.getters['store/userDetails'].userId && !to.path.includes('/auth')) {
  //     // next('/auth')
  //   } else {
  //     const lastRoute = store.getters['store/lastRoute']
  //     if (lastRoute.length) {
  //       const route = lastRoute[lastRoute.length - 1]
  //       console.log(route)

  //       if (route.path !== to.path) {
  //         console.log('Adding router', to)
  //         store.commit('store/addDocument', { collection: 'lastRoute', value: to })
  //       }
  //     } else {
  //       console.log('Adding router', to)
  //       store.commit('store/addDocument', { collection: 'lastRoute', value: to })
  //     }
  //   }

  //   next()
  // })

  return Router
}
