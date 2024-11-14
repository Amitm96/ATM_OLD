<template>
  <q-form @submit="submitForm">
    <div class="q-pa-md">
      <img class="q-pb-lg img-center" src="~assets/fre8-logo.png" style="max-width:25%;" />
      <div class="q-pa-md">
        <q-input
          v-if="tab == 'register'"
          v-model="formData.name"
          class="q-mb-md"
          outlined
          label="User Name"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="primary" />
          </template>
        </q-input>
        <q-input v-model="formData.email" class="q-mb-md" outlined type="email" label="Email">
          <template v-slot:prepend>
            <q-icon name="email" color="primary" />
          </template>
        </q-input>
        <q-input
          v-model="formData.password"
          outlined
          :type="isPwd ? 'password' : 'text'"
          label="Password"
          v-bind:rules="Required"
        >
          <template v-slot:prepend>
            <q-icon name="lock" color="primary" />
          </template>

          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <q-input
        v-if="tab == 'register'"
          v-model="confirm_password"
          :disable="!formData.password"
          outlined
          :type="isConfirmPwd ? 'password' : 'text'"
          label="Confirm Password"
          v-bind:rules="ConfirmPWD"
          lazy-rules
        >
          <template v-slot:prepend>
            <q-icon name="lock" color="primary" />
          </template>

          <template v-slot:append>
            <q-icon
              :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isConfirmPwd = !isConfirmPwd"
            />
          </template>
        </q-input>
        <q-input
          v-if="tab == 'register'"
          :rules="[val => !!val || 'This Field is required', val => /^\d{10}$/.test(val) || 'Invalid Phone Number']"
          v-model="formData.phone_number"
          outlined
          label="Phone Number"
        >
          <template v-slot:prepend>
            <q-icon name="phone" color="primary" />
          </template>
        </q-input>

        <q-input
          v-if="tab == 'register'"
          v-model="formData.company_id"
          outlined
          label="Company Id"
        >
          <template v-slot:prepend>
            <q-icon name="business" color="primary" />
          </template>
        </q-input>

      <q-select
        v-if="tab == 'register'"
        class="q-mt-md"
        v-model="formData.role"
        :options="roles"
        outlined
        emit-value
        map-options
        label="Role" />

        <div class="row">
          <q-btn class="q-mt-md q-pr-md" color="primary" type="submit" :label="tab" />
           <q-btn class="q-pt-md" v-if="tab != 'register'" @click="resetPassword" flat color="primary" label="Forgot Password?" />
        </div>
      </div>
    </div>
  </q-form>
</template>

<script>
import { mapActions } from 'vuex'

import { queryString, userFields } from '../utils/gql'

export default {
  props: ['tab'],

  data () {
    return {
      isPwd: true,
      isConfirmPwd: true,
      confirm_password: '',
      roles: [
        {
          label: 'Admin',
          value: 'admin'
        },
        {
          label: 'Verifier',
          value: 'verifier'
        },
        {
          label: 'Authorizing Authority',
          value: 'authorizer'
        },
        {
          label: 'Operator',
          value: 'operator'
        }
      ],
      formData: {
        name: '',
        email: '',
        password: '',
        company_id: '',
        phone_number: '',
        role: 'operator',
        status: 0
      }
    }
  },

  computed: {
    ConfirmPWD () {
      return [
        (v) => !!v || 'field is required.',
        (v) => v === this.formData.password || "Those passwords didn't match. Try again."
      ]
    },
    Required () {
      return [(v) => !!v || 'field is required.']
    }
  },

  methods: {
    ...mapActions('store', ['loginUser', 'registerUser', 'sendPasswordResetEmail']),

    resetPassword () {
      console.log(this.formData)
      if (!this.formData.email) {
        return this.$q.notify({
          message:
              'Email Address required',
          color: 'negative',
          icon: 'warning'
        })
      }

      this.sendPasswordResetEmail(this.formData.email)
    },
    async submitForm () {
      if (this.tab === 'login') {
        const response = await this.$apollo.query({
          query: queryString(
            'users',
            userFields
          ),

          fetchPolicy: 'network-only',

          variables: {
            where: {
              email: {
                _eq: this.formData.email
              }
            }
          }
        })

        const user = response.data.users.length
          ? response.data.users[0]
          : null

        console.log('user', user)

        if (!user) {
          return this.$q.notify({
            message:
              'No such user',
            color: 'negative',
            icon: 'warning'
          })
        }

        if (user.company.status !== 1) {
          return this.$q.notify({
            message:
              'Company is not active, please contact fre8wise customer care',
            color: 'negative',
            icon: 'warning'
          })
        }

        if (user.status !== 1) {
          return this.$q.notify({
            message:
              'User is not active, please contact your admin',
            color: 'negative',
            icon: 'warning'
          })
        }

        this.loginUser(this.formData, user)
      } else {
        const response = await this.$apollo.query({
          query: queryString(
            'companies',
            `
            id
            name
            status
            allowed_users
            users: users_aggregate {
              aggregate {
                count
              }
            }
          `
          ),

          variables: {
            where: {
              id: {
                _eq: this.formData.company_id
              }
            }
          }
        })

        const company = response.data.companies.length
          ? response.data.companies[0]
          : null

        console.log('company', company)

        if (!company) {
          return this.$q.notify({
            message:
              'No Company with that Id, please contact fre8wise customer care',
            color: 'negative',
            icon: 'warning'
          })
        }

        if (company.status !== 1) {
          return this.$q.notify({
            message:
              'Company is not active, please contact fre8wise customer care',
            color: 'negative',
            icon: 'warning'
          })
        }

        if (company.users.aggregate.count >= company.allowedUsers) {
          return this.$q.notify({
            message: 'Can not register as number of users reached the limit',
            color: 'negative',
            icon: 'warning'
          })
        }
        console.log(this.formData)
        this.registerUser(this.formData)
      }
    }
  }
}
</script>

<style lang="stylus">
.img-center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}
</style>
