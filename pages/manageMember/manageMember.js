const util = require('../../utils/util.js')
Page({

  data: {
    cdn_url: util.cdn_url,
    timeFlag: false,
    timeParam: 0,
    time: '',
    pageSize: 10,
    page: 1,
    detailList: [],
    navIndex: 0,
    news: 0,
    all: 0,
    next: true,
    loading: true
  },

  /** 选项改变 */
  navchange(e) {
    if (this.data.navIndex == e.currentTarget.dataset.index) {
      return;
    }
    this.setData({
      page: 1,
      navIndex: e.currentTarget.dataset.index,
      detailList: [],
      loading: true
    })
    this.getAll()
  },

  /** 日期改变 */
  changeTime(e) {
    this.setData({
      timeParam: e.currentTarget.dataset.time,
      detailList: [],
      loading: true
    })
    let time = '';
    switch (e.currentTarget.dataset.time) {
      case '7':
        time = util.formatTime(new Date(new Date().getTime() - 86400000 * 7)) + ' - ' + util.formatTime(new Date())
        break;
      case '30':
        time = util.formatTime(new Date(new Date().getTime() - 86400000 * 30)) + ' - ' + util.formatTime(new Date())
        break;
      case '90':
        time = util.formatTime(new Date(new Date().getTime() - 86400000 * 90)) + ' - ' + util.formatTime(new Date())
        break;
      default:
        time = util.formatTime(new Date())
        break;
    }
    this.setData({
      time: time
    })
    this.getAll()
  },

  getAll() {
    this.getAmount()
    this.getCount()
  },

  /** 获取详细数据列表 */
  getAmount() {
    let that = this;
    let data = {
      page: that.data.page,
      pageSize: that.data.pageSize,
      time: that.data.navIndex == 1 ? '90' : that.data.timeParam
    }
    util.WxRequest({
      url: util.api + "/xadmin/ulist/",
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
        that.data.detailList = that.data.detailList.concat(res.data.results)
        that.setData({
          detailList: that.data.detailList
        })
      }
    }).catch(err => {
      util.failToast("获取会员数据失败");
      console.log(err)
    });
  },

  /** 获取详情数据 */
  getCount() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/ulist/?count=1",
      data: {
        time: that.data.timeParam
      },
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.setData({
          news: res.data.data[0].news,
          all: res.data.data[0].all,
        })
      }
    }).catch(err => {
      util.failToast("获取详细数据失败");
      console.log(err)
    });
  },

  /** 打开时间选择 */
  openTime() {
    this.setData({
      timeFlag: true
    })
  },

  /** 关闭时间选择 */
  closeTime() {
    this.setData({
      timeFlag: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getAll()
    let time = util.formatTime(new Date())
    this.setData({
      time: time
    })
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
      this.getAll()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})