import Vue from 'vue'
import VueMq from 'vue-mq'
import App from './App.vue'
import axios from 'axios'
import config from '../config'
import cities from '../cities'

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.appConfig = config
Vue.prototype.citiesList = cities

Vue.use(VueMq, {
  breakpoints: { // default breakpoints - customize this
    sm: 400,
    lg: Infinity,
  },
  defaultBreakpoint: 'sm' // customize this for SSR
})

new Vue({
  render: h => h(App),
}).$mount('#app')
