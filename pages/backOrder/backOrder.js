const util = require('../../utils/util.js')
Page({

  data: {
    navIndex: 0,
    cdn_url: util.cdn_url,
    orderList: [],
    sureId: null,
    sureFlag: false,
    delIndex: "",
    categoryList: [{
        title: "待付款",
        param: "PAYING",
        count: 0
      },
      {
        title: "待发货",
        param: "TRADE_SEND",
        count: 0
      },
      {
        title: "已完成",
        param: "TRADE_SENDING",
        count: 0
      },
      {
        title: "待退款",
        param: "BACKING",
        count: 0
      }
    ],
    page_size: 10,
    page: 1,
    next: true,
    loading: true,
  },

  /** 同意退款弹窗打开 */
  openBack(e) {
    this.setData({
      sureFlag: true,
      sureId: e.currentTarget.dataset.id,
      delIndex: e.currentTarget.dataset.index
    })
  },

  /** 同意退款确定 */
  sureBack() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/back/",
      data: {
        order: that.data.sureId,
        status: "BACKED"
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        that.closeSure();
        util.sucToast("同意退款成功")
        that.data.orderList.splice(that.data.delIndex, 1)
        that.setData({
          orderList: that.data.orderList
        })
        that.getOrderCount();
      }
    }).catch(err => {
      util.failToast("同意退款失败");
      console.log(err)
    });
  },

  /** 拒绝退款确定 */
  rejectBack(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/back/",
      data: {
        order: e.currentTarget.dataset.id,
        status: "BACK_BACK"
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast("拒绝退款成功")
        that.data.orderList.splice(e.currentTarget.dataset.index, 1)
        that.setData({
          orderList: that.data.orderList
        })
        that.getOrderCount();
      }
    }).catch(err => {
      util.failToast("拒绝退款失败");
      console.log(err)
    });
  },

  /** 关闭退款弹窗 */
  closeSure() {
    this.setData({
      sureFlag: false,
      sureId: ''
    })
  },

  /** 获取订单数量 */
  getOrderCount() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/order/",
      data: {
        count: 1
      },
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.categoryList[0].count = res.data.data[0].PAYING;
        that.data.categoryList[1].count = res.data.data[0].TRADE_SEND;
        that.data.categoryList[2].count = res.data.data[0].TRADE_SENDING;
        that.data.categoryList[3].count = res.data.data[0].BACKING
        that.setData({
          categoryList: that.data.categoryList
        })
      }
    }).catch(err => {
      util.failToast("获取订单数量失败");
      console.log(err)
    });
  },

  /** 获取订单列表 */
  getOrderList() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/order/?status=" + that.data.categoryList[that.data.navIndex].param,
      data: {
        page: that.data.page,
        page_size: that.data.page_size
      },
      method: "GET"
    }).then(res => {
      if (that.data.loading) {
        that.setData({
          loading: false
        })
      }
      if (res.data.status == 1) {
        that.data.next = res.data.next ? true : false;
        that.data.orderList = that.data.orderList.concat(res.data.results);
        that.data.orderList.forEach(e => {
          let num = 0;
          e.goods.forEach(good => {
            num = num + good.goods_num;
          })
          e.num = num
        })
        that.setData({
          orderList: that.data.orderList
        })
      }
    }).catch(err => {
      util.failToast("获取订单失败");
      console.log(err)
    });
  },

  /** 导航栏改变 */
  navChange(e) {
    this.setData({
      navIndex: e.currentTarget.dataset.index,
      page: 1,
      orderList: [],
      loading: true,
    })
    this.getOrderList();
    this.getOrderCount();
  },

  /** 再次打印小票 */
  printing(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/print/?order=" + e.currentTarget.dataset.id,
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        if (res.data.data == 'failure') {
          util.failToast('请开启打印机之后在打印小票')
        } else {
          util.sucToast("打印成功");
        }

      }
    }).catch(err => {
      util.failToast("打印失败");
      console.log(err)
    });
  },

  /** 订单已发货点击 */
  delivery(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/order/" + e.currentTarget.dataset.id + "/",
      data: {
        pay_status: "TRADE_SENDING"
      },
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.orderList.splice(e.currentTarget.dataset.index, 1)
        that.setData({
          orderList: that.data.orderList,
        })
        that.getOrderCount();
        util.sucToast("订单已配送");
      }
    }).catch(err => {
      util.failToast("操作失败");
      console.log(err)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.navIndex) {
      that.setData({
        navIndex: options.navIndex
      })
    }
    that.getOrderCount();
    that.getOrderList();
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
      this.getOrderList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})