 const util = require('../../utils/util.js')

 Page({
   data: {
     cdn_url: util.cdn_url,
     navList: [{
       title: "全部",
       status: ""
     }, {
       title: "待付款",
       status: "PAYING"
     }, {
       title: "待发货",
         status: "TRADE_SEND"
     }, {
       title: "已完成",
         status: "TRADE_SENDING"
     }, {
       title: "退款/售后",
       status: "BACK"
     }],
     active: 0,
     orderList: [],
     page_size: 10,
     page: 1,
     next: true,
     loading: true
   },

   /** 导航栏改变 */
   changeNav(e) {
     if (this.data.active == e.currentTarget.dataset.index) {
       return
     }
     this.setData({
       active: e.currentTarget.dataset.index,
       orderList: [],
       loading: true,
       page: 1
     })
     this.getPayRecord();
   },

   /** 获取购买记录 */
   getPayRecord() {
     let that = this;
     let data = {
       page: that.data.page,
       page_size: that.data.page_size
     };
     if (that.data.navList[that.data.active].status != "") {
       data.status = that.data.navList[that.data.active].status
     }
     util.WxRequest({
       url: util.api + "/order/",
       data: data,
       method: "GET"
     }).then(res => {
       if (that.data.loading) {
         that.setData({
           loading: false
         })
       }
       if (res.data.status == 1) {
         that.data.next = res.data.next ? true : false;
         res.data.results.forEach(e => {
           if (e.pay_status == "PAYING") {
             e.pay_status = "待付款"
           } else if (e.pay_status == "TRADE_SUCCESS") {
             e.pay_status = "支付成功"
           } else if (e.pay_status == "TRADE_FINISHED") {
             e.pay_status = "已完成"
           } else if (e.pay_status == "BACKING") {
             e.pay_status = "退款中"
           } else if (e.pay_status == "BACKED") {
             e.pay_status = "已退款"
           } else if (e.pay_status == "TRADE_SEND") {
             e.pay_status = "待发货"
           } else if (e.pay_status == "TRADE_SENDING") {
             e.pay_status = "已发货"
           } else if (e.pay_status == "BACK_BACK") {
             e.pay_status = "退款拒绝"
           }
           e.nums = 0;
           e.goods.forEach(good => {
             e.nums = e.nums + good.goods_num
           })
         })
         that.data.orderList = that.data.orderList.concat(res.data.results);
         that.setData({
           orderList: that.data.orderList,
         })
       }
     }).catch(err => {
       util.failToast("获取购买记录失败");
       console.log(err)
     });
   },

   /** 退款 */
   refund(e) {
     let that = this;
     util.WxRequest({
       url: util.api + "/back/?order=" + e.currentTarget.dataset.id,
       data: {},
       method: "PUT"
     }).then(res => {
       if (res.data.status.code == 1) {
         that.data.orderList[e.currentTarget.dataset.index].pay_status = "退款中"
         that.setData({
           orderList: that.data.orderList
         })
       } else {
         util.failToast("退款失败")
       }
     }).catch(err => {
       console.log(err)
     });
   },

   /** 取消退款 */
   cancleBack(e) {
     let that = this;
     util.WxRequest({
       url: util.api + "/back/?order=" + e.currentTarget.dataset.id +"&pay_status=TRADE_SEND",
       data: {},
       method: "PUT"
     }).then(res => {
       if (res.data.status.code == 1) {
         that.data.orderList[e.currentTarget.dataset.index].pay_status = "待发货"
         that.setData({
           orderList: that.data.orderList
         })
       } else {
         util.failToast("退款失败")
       }
     }).catch(err => {
       console.log(err)
     });
   },

   /** 立即支付 */
   againPay(e) {
     this.payTap(e.currentTarget.dataset.id, e.currentTarget.dataset.index);
   },

   /** 支付 */
   payTap: function(id, index) {
     let that = this;
     let date = new Date();
     util.WxRequest({
       url: util.api + "/pay/",
       data: {
         order: id,
         openid: wx.getStorageSync("openid")
       },
       method: "POST"
     }).then(res => {
       if (res.data.status.code == 2001) {
         wx.requestPayment({
           'timeStamp': res.data.data.timeStamp,
           'nonceStr': res.data.data.nonceStr,
           'package': "prepay_id=" + String(res.data.data.package),
           'signType': 'MD5',
           'paySign': res.data.data.paySign,
           'success': function(res) {
             util.sucToast("支付成功");
           },
           'fail': function(res) {
             util.failToast("支付失败");
           },
           'complete': function(res) {
             if (res.errMsg == "requestPayment:ok") {
               that.changeOrderStatus(id, index, "TRADE_SEND")
             } else {
               that.changeOrderStatus(id, index, "PAYING")
             }
             console.log(res)
           }
         })
       }
     }).catch(err => {
       console.log(err)
     });
   },

   /** 支付成功/失败接口 */
   changeOrderStatus(id, index, status) {
     let that = this;
     util.WxRequest({
       url: util.api + "/order/" + id + "/",
       data: {
         pay_status: status
       },
       method: "PUT"
     }).then(res => {
       if (res.data.status.code == 1) {
         if (status == "TRADE_SUCCESS") {
           that.data.orderList[index].pay_status = "已完成"
           that.setData({
             orderList: that.data.orderList
           })
         }
       }
     }).catch(err => {
       console.log(err)
     })
   },

   /** 再次购买 */
   againBuy(e) {
     let that = this;
     let goods = that.data.orderList[e.currentTarget.dataset.index].goods;
     let goodsList = [];
     goods.forEach(e => {
       e.goods.nums = e.goods_num;
       goodsList.push(e.goods);
     })
     if (!wx.getStorageSync("utoken")) {
       wx.navigateTo({
         url: '/pages/toLogin/toLogin',
       })
     } else {
       wx.navigateTo({
         url: '/pages/confOrder/confOrder?goodList=' + JSON.stringify(goodsList),
       })
     }
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {

   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function() {
     this.setData({
       loading: true,
       orderList: []
     })
     this.getPayRecord()
   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function() {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function() {

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function() {
     if (this.data.next) {
       this.data.page++;
       this.getPayRecord();
     }
   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function() {

   }
 })