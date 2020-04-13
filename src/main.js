// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'
import push from 'push.js'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
push.config({ serviceWorker: '//serviceWorker.min.js'});
// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT_ID.firebaseio.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SEND_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASYUREMENT_ID'
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>',
  created: function () {
    var _this = this
    this.user = this.$route.query.user
    this.database = firebase.database()

    this.jobsRef = this.database.ref('jobs' + this.user)
    this.jobsRef.on('value', function (snapshot) {
      _this.jobsConfirmed = snapshot.val() // データに変化が起きたときに再取得する
    })

    this.payRef = this.database.ref('pay' + this.user)
    this.payRef.on('value', function (snapshot) {
      _this.pay = snapshot.val() // データに変化が起きたときに再取得する
      if (_this.pay) {
        _this.userPay = _this.pay.pay
        console.log('key:% pay:%', _this.pay.user, _this.pay.pay)
      }
    })

    this.payUsedRef = this.database.ref('payused' + this.user)
    this.payUsedRef.on('value', function (snapshot) {
      _this.payUsed = snapshot.val() // データに変化が起きたときに再取得する
    })

    this.jobsApplyRef = this.database.ref('apply' + this.user)
    this.jobsApplyRef.on('value', function (snapshot) {
      _this.jobsApply = snapshot.val() // データに変化が起きたときに再取得する
      if (_this.jobsApply) {
        var temp = 0
        for (var key in _this.jobsApply) {
          console.log('pay:', _this.jobsApply[key].pay)
          temp += _this.jobsApply[key].pay
        }
        _this.userEstimatePay = temp
        console.log('conpute-userEstimatePay:', _this.userEstimatePay)
      } else {
        _this.userEstimatePay = 0
      } 
    })

    this.jobsApplyAllRef = this.database.ref()
    this.jobsApplyAllRef.on('value', function (snapshot) {
      _this.jobsApplyAll = snapshot.val() // データに変化が起きたときに再取得する
    })
  },
  computed: {
    getJobs: function () {
      return this.jobsConfirmed
    },
    getUsedPay: function () {
      return this.payUsed
    },
    getApply: function () {
      return this.jobsApply
    },
    getApplyAll: function () {
      var ret = {}
      for (var key in this.jobsApplyAll) {
        if (key.startsWith('apply')) {
          ret[key] = this.jobsApplyAll[key]
        }
      }
      console.log('getApplyAll', ret)
      return ret
    },
    getPayAll: function () {
      var ret = {}
      for (var key in this.jobsApplyAll) {
        if (key.startsWith('pay')) {
          ret[key] = this.jobsApplyAll[key]
        }
      }
      console.log('getPayAll', ret)
      return ret
    }
  },
  methods: {
    insertJobsAndAddPay: function (appAll) {
      for (var table in appAll) {
        var currentUser = table.replace('apply', '')
        var currentPay = this.jobsApplyAll['pay' + currentUser].pay
        var addPay = 0
        for (var key in appAll[table]) {
          var val = appAll[table][key]
          addPay += val.pay
          this.database.ref('jobs' + currentUser).push({
            'created_at': new Date().toLocaleString(),
            'updated_at': new Date().toLocaleString(),
            'user': currentUser,
            'job': val.job,
            'pay': val.pay,
            'is_vailed': true
          })
          this.deleteApplyJob(key, 'apply' + currentUser)
        }
        this.updatePay(currentPay + addPay, 'pay' + currentUser)
        push.create('おうちペイ承認通知', {
          body: 'お母さんより、おうちペイが承認がされました',
          icon: '/asset/logo.png',
          timeout: 4000,
          onClick: function () {
            window.focus()
            this.close()
          }
        })
      }
    },
    deleteJobs: function (key) {
      this.database.ref('jobs').child(key).remove()
    },
    insertApplyJobs: function (applyJob) {
      const apply = {
        'created_at': new Date().toLocaleString(),
        'updated_at': new Date().toLocaleString(),
        'user': this.user,
        'job': applyJob.job,
        'pay': applyJob.pay,
        'is_vailed': false
      }
      const key = this.jobsApplyRef.push(apply).getKey()
      push.create('おうちペイ申請通知', {
        body: this.user + 'さんより、おうちペイ申請がありました',
        icon: '/asset/logo.png',
        timeout: 4000,
        onClick: function () {
          window.focus()
          this.close()
        }
      })
      return key
    },
    deleteApplyJob: function (key, table = '') {
      console.log('deleteApplyJob', key)
      console.log('deleteApplyJob', table)
      this.database.ref(table).child(key).remove()
      console.log('userEstimatePay', this.userEstimatePay)
    },
    insertUsedPay: function (payUse) {
      this.payUsedRef.push({
        'created_at': new Date().toLocaleString(),
        'updated_at': new Date().toLocaleString(),
        'user': this.user,
        'pay': payUse,
        'is_vailed': true
      })
    },
    insertPay: function (pay) {
      this.payRef.push({
        'created_at': new Date().toLocaleString(),
        'updated_at': new Date().toLocaleString(),
        'user': this.user,
        'pay': pay
      })
    },
    updatePay: function (pay, table) {
      var payValue = {
        'created_at': new Date().toLocaleString(),
        'updated_at': new Date().toLocaleString(),
        'user': table.replace('pay', ''),
        'pay': pay
      }
      var updates = {}
      updates['/' + table + '/'] = payValue
      this.database.ref().update(updates)
    },
    deletePay: function (key) {
      this.database.ref('pay' + this.user).child(key).remove()
    }
  },
  data: {
    database: null,
    jobsRef: null,
    payRef: null,
    payUsedRef: null,
    jobsApplyRef: null,
    jobsApplyAllRef: null,
    jobsConfirmed: [],
    pay: [],
    payUsed: [],
    jobsApply: [],
    jobsApplyAll: [],
    user: '',
    userPay: 0,
    userEstimatePay: 0
  }
})
