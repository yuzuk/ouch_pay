<template>
  <b-container>
    <b-row class="text-center">
      <b-col>
        <b-navbar toggleable="lg" type="dark" variant="info">
          <b-navbar-brand href="#"><b>おうちペイ</b></b-navbar-brand>
        </b-navbar>
        <section v-if="user !== 'ママ'">
          <div>
            <h1 style="margin:1em 0; font-size:large">
              <strong>ペイをためて、たのしくつかおう！</strong>
            </h1>
            <b-alert variant="success" v-model="isShowMessage"
              dismissible
              fade
              @dismissed="isShowMessage=false">
              {{ message }}
            </b-alert>
          </div>
          <div>
            <b-card>
              ユーザー：<strong>{{ user }}</strong>さん<br>もっているペイ：<strong>{{ userPay }}</strong>ペイ
            </b-card>
          </div>
          <div style="margin: 1em 0">
            <b-button v-b-toggle.collapse-1 variant="info">{{ user }}さんのお手伝い実績</b-button>
            <b-collapse id="collapse-1" class="mt-2">
              <b-card>
                <b-list-group>
                  <b-list-group-item v-for='(res, key, index) in $root.getJobs' :key="key" :index="index">
                    {{ res.created_at }} {{ res.job }} {{ res.pay }}ペイ
                  </b-list-group-item>
                </b-list-group>
              </b-card>
            </b-collapse>
          </div>
          <hr />
          <div>
            <h5>ペイをしんせいする</h5>
            <div style="margin: 1em 0">
              <b-form-select v-model.number='doneJob' v-on:change='displayPayWillEarn'>
                <option disabled value>選択してください</option>
                <option v-for='(j, key) in jobs' :key="key">{{ key }}</option>
              </b-form-select>
            </div>
            <p>
              かくとく：{{ payGainMessage }}
            </p>
            <div>
              <b-button variant="primary" @click='applyJobs'>ペイをしんせいする</b-button>
            </div>
            <div>
              <p style="margin: 1em 0">しょうにんまち  かくとく予定：{{ $root.userEstimatePay }}ペイ</p>
              <b-list-group>
                <b-list-group-item v-for='(job, key, index) in $root.getApply'>
                  <h6>にち時：{{ job.created_at }}</h6>
                  <p>ユーザー：{{ job.user }}</p>
                  <p>おてつだい：{{ job.job }}</p>
                  <p>かくとく：{{ job.pay }}ペイ</p>
                  <b-button variant="outline-primary" @click='deleteJob(key, index)'>さくじょ</b-button>
                </b-list-group-item>
              </b-list-group>
            </div>
          </div>
          <hr />
          <div style="margin: 1em 0">
            <h5>ペイをつかう</h5>
            <div style="margin: 1em 0">
              <b-form-input type='number' v-model='minusPay' min='0' max='20000' />
            </div>
          </div>
          <div>
            <b-button variant="primary" @click='usePay'>ペイをつかう</b-button>
          </div>
          <div style="margin: 1em 0">
            <b-button v-b-toggle.collapse-2 variant="info">{{ user }}さんのペイ使用履歴</b-button>
            <b-collapse id="collapse-2" class="mt-2">
              <b-card>
                <b-list-group>
                  <b-list-group-item v-for='(res, key, index) in $root.getUsedPay' :key="key" :index="index">
                    {{ res.created_at }} {{ res.pay }}ペイ
                  </b-list-group-item>
                </b-list-group>
              </b-card>
            </b-collapse>
          </div>
        </section>
        <section v-if="user === 'ママ'">
          <h2>ママのペイ承認</h2>
          <div>
            承認リスト
          </div>
          <div>
            <div v-for='(job, pkey) in $root.getApplyAll'>
              <p> {{ pkey.replace('apply') }} 保有ペイ:{{ $root.getPayAll[pkey.replace('apply','pay')].pay }} </p>
              <b-list-group>
                <b-list-group-item v-for='(j, key) in $root.getApplyAll[pkey]'>
                  <h6>日時：{{ j.created_at }}</h6>
                  <p>ユーザー：{{ j.user }}</p>
                  <p>
                  お手伝い：{{ j.job }}<br>支払いペイ：{{ j.pay }}ペイ
                  </p>
                  <b-button @click='deleteApplyJob(key, pkey)'>承認しない</b-button>
                </b-list-group-item>
              </b-list-group>
            </div>
          </div>
          <div>
            <b-button variant="primary" @click='insertJobsAndAddPay'>全て承認する</b-button>
          </div>
        </section>
        <pre> </pre>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'OuchiPay',
  data () {
    return {
      message: '良い習慣でペイを貯めて、賢く使おう！',
      payGainMessage: '',
      isShowMessage: false,
      minusPay: 0,
      totalPay: 0,
      doneJob: '',
      jobs: {
        '朝7時に起きる': 10,
        '食事の準備、テーブルセット': 10,
        '片付け': 10,
        '洗濯物しまう': 10,
        'ゴミを集めて捨てに行く': 20,
        '夜10時までに寝る': 20,
        'お風呂掃除': 20,
        'トイレ掃除': 20,
        '掃除機をかける': 30,
        'その他手伝い（まま次第）': 30,
        '洗濯物たたみ': 50,
        'お茶碗洗い（小）': 30,
        'お茶碗洗い（中）': 40,
        'お茶碗洗い（大）': 50,
        '運動を合計１時間': 50,
        'ママと散歩１時間': 50,
        '運動を合計２時間': 100,
        'ママとマラソン1時間': 100
      },
      hasError: true
    }
  },
  props: {
    user: String,
    userPay: Number,
    userEstimatePay: Number
  },
  methods: {
    insertJobsAndAddPay: function () {
      if (Object.keys(this.$root.getApplyAll).length === 0) {
        this.showMessage('申請されていません！')
        return
      }
      if (!confirm('ペイを承認します。よろしいですか？')) {
        return
      }
      this.$root.insertJobsAndAddPay(this.$root.getApplyAll)
      this.showMessage('ペイを承認しました！')
    },
    usePay: function () {
      if (this.minusPay <= 0) {
        this.showMessage('1ペイいじょうからだよ')
        return
      }
      if (this.userPay < this.minusPay) {
        this.showMessage('げんどがくをこえています')
        return
      }
      if (!confirm(this.minusPay + 'ペイをつかいます。よろしいですか？')) {
        return
      }
      this.$root.updatePay(this.userPay - this.minusPay, 'pay' + this.user)
      this.$root.insertUsedPay(this.minusPay)
      this.minusPay = 0
      this.showMessage('ペイをつかいました！')
    },
    selectJob: function (key, event) {
      this.$root.getApply[key].isConfirmed = event.target.checked
    },
    deleteJob: function (key, index) {
      this.$root.deleteApplyJob(key, 'apply' + this.user)
    },
    deleteApplyJob: function (usr, key) {
      this.$root.deleteApplyJob(usr, key)
    },
    displayPayWillEarn: function () {
      if (isNaN(this.jobs[this.doneJob])) {
        this.showMessage('お手伝いを選択してください')
        return
      }
      this.payGainMessage = this.jobs[this.doneJob] + 'ペイ'
    },
    applyJobs: function () {
      if (isNaN(this.jobs[this.doneJob])) {
        this.showMessage('お手伝いを選択してください')
        return
      }
      var item = {
        job: this.doneJob,
        pay: this.jobs[this.doneJob],
        isConfirmed: false
      }
      this.$root.insertApplyJobs(item)
      this.showMessage('ペイを申請しました！ママに頼もう！')
    },
    showMessage: function (mes) {
      this.message = mes
      this.isShowMessage = true
      alert(mes)
    }
  }
}

</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
}
.achievements {
  max-height: 3em;
  overflow: scroll;
  border: 1px solid #42b983;
}
</style>
