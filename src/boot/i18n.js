import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from 'src/i18n'

Vue.use(VueI18n)

const numberFormats = {
  'en-in': {
    currency: {
      style: 'currency', currency: 'INR'
    }
  }
}

const i18n = new VueI18n({
  locale: 'en-in',
  fallbackLocale: 'en-us',
  messages,
  numberFormats
})

export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n
}

export { i18n }
