<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="headerClass">
      <q-toolbar v-if="this.$route.path != '/auth'">
        <q-btn
          v-if="/(^\/(new|edit))|pdf|voucher|\/(\d+)$/i.test($route.fullPath)"
          @click="goBack"
          icon="arrow_back"
          flat
          dense
          aria-label="Back"
        />

        <q-btn
          v-else-if="userDetails.status == 1"
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>{{$route.meta.title}}</q-toolbar-title>

        <q-btn
          class="absolute-center"
          no-caps
          v-if="userDetails.status == 1 && this.$route.path != '/'"
          flat
          dense
          icon="home"
          label="Home"
          to="/" />

        <q-btn
          v-if="userDetails.status == 1"
          @click="logoutUser"
          class="absolute-right q-pr-sm"
          icon="exit_to_app"
          no-caps
          flat
          label="Logout"
          dense
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      v-if="userDetails.status == 1"
      show-if-above
      :width="250"
      bordered
      content-class="bg-grey-2"
    >
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
      >
        <q-list>
          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm q-mt-sm"
            active-class="tab-active"
            exact
            clickable
            to="/"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="assignment" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Permits</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            exact
            v-if="isAdmin || isAuthorizer"
            clickable
            to="/orders"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="assignment" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Orders</q-item-label>
            </q-item-section>
          </q-item>

          <!-- bg-accent overflow-hidden -->

          <!-- <q-item class="text-grey-13" exact clickable to="/tagging">
            <q-item-section avatar>
              <q-icon name="work" />
            </q-item-section>
            <q-item-section>
              <q-item-label>TAGGING</q-item-label>
            </q-item-section>
          </q-item>

        <q-expansion-item class="text-grey-13"
          expand-separator
          icon="dashboard"
          label="REPORTS"
          :content-inset-level="1"
        >
          <q-item class="text-grey-13" clickable to="/tagreport">
            <q-item-section>
              <q-item-label>TAG REPORT</q-item-label>
            </q-item-section>
          </q-item>

           <q-item class="text-grey-13" clickable to="/reports">
            <q-item-section>
              <q-item-label>TRANSPORT REPORT</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

          <q-item class="text-grey-13" exact clickable to="/clients">
            <q-item-section avatar>
              <q-icon name="group" />
            </q-item-section>
            <q-item-section>
              <q-item-label>CLIENTS</q-item-label>
            </q-item-section>
          </q-item>-->

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            exact
            clickable
            to="/trucks"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="eva-car" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Trucks</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            exact
            clickable
            to="/trucklists"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="emoji_transportation" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Truck Lists</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            exact
            clickable
            to="/owners"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="supervised_user_circle" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Truck Owners</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin || isAuthorizer"
            exact
            clickable
            to="/clients"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Clients</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin || isAuthorizer"
            exact
            clickable
            to="/vendors"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="people_outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Vendors</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin"
            exact
            clickable
            to="/sms"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="textsms" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">SMS</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin || isVerifier || isAuthorizer"
            exact
            clickable
            to="/invoices"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="picture_as_pdf" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Invoices</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin || isVerifier || isAuthorizer"
            exact
            clickable
            to="/payments"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="attach_money" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Payments</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin || isVerifier || isAuthorizer"
            exact
            clickable
            to="/paymentsvendor"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="business_center" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Vendor Payments</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            exact
            clickable
            to="/accounts"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="account_box" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Accounts</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm"
            active-class="tab-active"
            v-if="isAdmin"
            exact
            clickable
            to="/users"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Users</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            class="text-grey-9 q-ml-sm q-mr-sm q-mb-sm"
            active-class="tab-active"
            v-if="isAdmin"
            exact
            clickable
            to="/dashboard"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="fontSize">Dashboard</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img class="absolute-top drawerProfileColor" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <q-icon name="account_circle" style="font-size: 60px;" />
          </q-avatar>
          <div class="userName">{{ userDetails.name }}</div>
          <div class="companyName">{{ userDetails.company.name }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import Vue from 'vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { hasPermission } from '../utils/util'

export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false
    }
  },
  created: function () {
    const cookies = Vue.$cookies.get('fre8-auth-ex')
    if (cookies) {
      this.$store.dispatch('store/logoutUser')
    }
  },

  computed: {
    isAdmin () {
      return hasPermission(this.userDetails, ['admin'])
    },
    isVerifier () {
      return hasPermission(this.userDetails, ['verifier'])
    },
    isAuthorizer () {
      return hasPermission(this.userDetails, ['authorizer'])
    },
    ...mapState('store', ['userDetails', 'lastRoute'])
  },

  methods: {
    ...mapActions('store', ['logoutUser']),
    ...mapMutations('store', ['popDocument']),
    goBack () {
      // this.popDocument('lastRoute')

      // let route
      // if (this.lastRoute.length) {
      //   route = this.lastRoute[this.lastRoute.length - 1]
      // }

      // console.log('lastRoute in go back', route, this.lastRoute)

      // if (route) {
      //   this.$router.replace(route)
      // } else {
      this.$router.go(-1)
      // }
    }
  }
}
</script>

<style lang="stylus">
.drawerProfileColor {
  background-color: #0d1534;
}

.drawerColor {
  background-color: #f4f4f6;
}

.q-drawer {
  .q-router-link--exact-active {
    color: #06847B !important;
  }
}

.headerClass {
  background-color: #4682b4;
}

.fontSize {
  font-size: 16px;
  font-weight: 400;
}

.companyName {
  font-size: 12px;
}

.userName {
  font-size: 16px;
  font-weight: bold;
}

.tab-active {
  background-color: #ffffff;
  border-radius: 5px;
}
</style>
