# ouch_pay

> A Vue.js project

# おうちペイ

おうちで使えるペイ、おうちペイを管理するアプリケーションです。

Vue.js,firebaseの学習目的で作ってみました。

## 注意！

練習用アプリですので認証がザルです。

ユーザ認証はfirebaseで実装しようと思います。

（そのためrouterを導入してログインページなどを作る予定です）


Vue.js（router,CLI）,firebaseを使ってます。

# 使い方
## ユーザ入力画面

子供たちはURLにパラメータで?user=ユーザ名を渡す事でペイ申請画面に入る事ができます。

例） https://hoge.ne.jp#/?user=子供の名前


"#/"は、Vue Routerにページを認識させるために必要です。

セレクトボックスからお手伝いを選択して、ペイを申請できます。


貯めたペイを何に使うかはご家庭ごとの決め事です。

うちではゲームの時間の延長やお小遣いの足しにしています。

## 管理画面

管理ユーザ名は「ママ」です。

例） https://hoge.ne.jp#/?user=ママ


このURLで管理画面に遷移します。

管理画面では、子供達の申請したペイを一括承認できます。

個別の申請を却下する事も出来ます。


