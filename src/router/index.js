import Vue from 'vue'
import Router from 'vue-router'
import OuchiPay from '@/components/OuchiPay'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'OuchiPay',
      component: OuchiPay
    }
  ]
})
