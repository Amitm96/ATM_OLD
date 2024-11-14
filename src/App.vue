<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('store', ['handleAuthStateChanged'])
  },
  created () {
    console.log(`hi`)
    this.handleAuthStateChanged()
  }
}
</script>
