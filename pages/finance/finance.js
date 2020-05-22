const util = require('../../utils/util.js')

Page({

  data: {
    timeFlag: false,
    detailList: [],
    nums: 0,
    total: 0,
    time: '',
    timeParam: 0,
    next: true,
    page_size:10,
    page:1,
    loading: false
  },

  /** 获取商品详情和数据 */
  getAll() {
    this.getAmount()
    this.getCount()
  },

  /** 获取详细数据列表 */
  getAmount() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/amount/",
      data: {
        page: that.data.page,
        page_size: that.data.page_size,
        time: that.data.timeParam
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
        that.data.detailList = that.data.detailList.concat(res.data.results)
        this.setData({
          detailList: that.data.detailList
        })
      }
    }).catch(err => {
      util.failToast("获取财务信息失败");
      console.log(err)
    });
  },

  /** 获取详情数据 */
  getCount() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/amount/?count=1",
      data: {
        time : that.data.timeParam
      },
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.setData({
          nums: res.data.data[0].nums,
          total: res.data.data[0].total,
        })
      }
    }).catch(err => {
      util.failToast("获取详细数据失败");
      console.log(err)
    });
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