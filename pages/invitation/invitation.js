const util = require('../../utils/util.js')

Page({

  data: {
    cdn_url: util.cdn_url,
    postType: ['被投诉帖子', '全部帖子'],
    activeTab: 0, // 当前选中类型
    utoken: '', // utoken
    normal: '', // 正常的帖子
    report: '', // 被举报的帖子
    page: 1, // 当前页
    results: [], // 帖子数量
    timeFlag: false, // 日期判断状态
    nowTime: 1, // 选择时间
    dateNow: '', // 当前时间
    page_size: 10,
    next: true,
    loading: true,
    valueDate: [{
        date: '当前',
        time: '1',
      },
      {
        date: '近七天',
        time: '7',
      },
      {
        date: '近30天',
        time: '30',
      },
      {
        date: '全部',
        time: '1000',
      }
    ],
  },

  /** 解决遮罩层冲突 */
  returnNull() {
    return;
  },

  /** 帖子置顶 */
  changeZD(e) {
    var that = this;
    util.WxRequest({
      url: util.api + '/xadmin/chat/' + e.currentTarget.dataset.id + '/',
      data: {
        is_top: e.detail.value ? 'top' : 'basic'
      },
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.results[e.currentTarget.dataset.index].is_top = e.detail.value
        that.setData({
          results: that.data.results
        })
      } else if (res.data.status.code == 1001) {
        util.failToast("置顶不超过三个")
        that.data.results[e.currentTarget.dataset.is_top] = false;
        that.setData({
          results: that.data.results
        })
      }
    }).catch(err => {
      util.failToast("帖子置顶失败");
    });
  },

  /** 打开时间选择 */
  openTime() {
    this.setData({
      timeFlag: !this.data.timeFlag
    })
  },

  /** 关闭时间选择 */
  closeTime() {
    this.setData({
      timeFlag: false
    })
  },

  // 点击更多弹出遮罩层
  choice(e) {
    this.close();
    this.data.results[e.currentTarget.dataset.index].showView = true;
    this.setData({
      results: this.data.results
    })
  },

  // 点击关闭
  close() {
    this.data.results.forEach(e => {
      e.showView = false
    })
    this.setData({
      results: this.data.results
    })
  },

  // 选择状态
  changeTab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.id,
      page: 1,
      results: [],
      timeParam: e.currentTarget.dataset.time,
      loading: true
    })
    this.getAll();
  },

  // 选择时间
  getTimeNum(e) {
    var that = this;
    that.setData({
      nowTime: e.currentTarget.dataset.time,
      timeFlag: false,
      results: [],
      page: 1,
      loading: true
    })
    let dateNow = '';
    switch (e.currentTarget.dataset.time) {
      case '7':
        dateNow = util.formatTime(new Date(new Date().getTime() - 86400000 * 7)) + ' - ' + util.formatTime(new Date())
        break;
      case '30':
        dateNow = util.formatTime(new Date(new Date().getTime() - 86400000 * 30)) + ' - ' + util.formatTime(new Date())
        break;
      default:
        dateNow = util.formatTime(new Date())
        break;
    }
    this.setData({
      dateNow: dateNow
    })
    that.getAll();
  },

  // 获取帖子数据
  getAll() {
    this.getPostsNum();
    this.getAllNum();
  },

  /** 获取帖子数量 */
  getPostsNum() {
    var that = this;
    util.WxRequest({
      url: util.api + "/xadmin/chat/",
      data: {
        count: '1',
        time: that.data.nowTime
      },
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.setData({
          normal: res.data.data[0].zc,
          report: res.data.data[0].jb
        })
      }
    }).catch(err => {
      util.failToast("获取帖子数量失败");
    });
  },

  // 获取帖子
  getAllNum() {
    var that = this;
    var data = {};
    if (that.data.activeTab == 1) {
      data = {
        page_size: that.data.page_size,
        page: that.data.page,
        time: that.data.nowTime
      }
    } else {
      data = {
        page_size: that.data.page_size,
        jb: '1',
        time: that.data.nowTime
      }
    }
    util.WxRequest({
      url: util.api + "/xadmin/chat/",
      data: data,
    }).then(res => {
      if (that.data.loading) {
        that.setData({
          loading: false
        })
      }
      if (res.data.status == 1) {
        that.data.next = res.data.next ? true : false;
        res.data.results.forEach(e => {
          e.is_top = e.is_top == 'basic' ? false : true
          e.showView = false;
        })
        that.data.results = that.data.results.concat(res.data.results)
        that.setData({
          results: that.data.results
        })
      }
    }).catch(err => {
      util.failToast("获取帖子列表数据失败");
    });
  },

  // 拒绝
  redusePost(e) {
    var that = this;
    util.WxRequest({
      url: util.api + "/xadmin/chat/" + e.currentTarget.dataset.id + '/',
      data: {
        is_jb: false
      },
      method: 'PUT',
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.results.splice(e.currentTarget.dataset.index, 1)
        that.setData({
          results: that.data.results
        })
        that.getPostsNum();
        util.failToast("操作成功")
      }
    }).catch(err => {
      util.failToast("操作失败");
    });
  },

  // 删除帖子数据
  deletePost(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/chat/" + e.currentTarget.dataset.id + '/',
      method: 'DELETE',
    }).then(res => {
      if (res.data.status.code == 2004) {
        that.data.results.splice(e.currentTarget.dataset.index, 1);
        // if (that.data.activeTab == 1) {
        //   that.data.normal--
        // } else {
        //   that.data.report--
        // }
        that.getPostsNum();
        that.setData({
          results: that.data.results,
          normal: that.data.normal,
          report: that.data.report
        })
        util.failToast("删除成功")
      }
    }).catch(err => {
      util.failToast("删除失败");
    });
  },

  // 点击图片预览
  preview(e) {
    let urls = [];
    this.data.results[e.currentTarget.dataset.index].imgs.forEach(e => {
      urls.push(this.data.cdn_url + e)
    })
    wx.previewImage({
      current: this.data.cdn_url + e.currentTarget.dataset.src,
      urls: urls
    })
  },

  // 下拉加载
  onReachBottom() {
    if (this.data.next) {
      this.page++;
      that.getAllNum();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getAll();
    var dateNow = util.formatTime(new Date());
    this.setData({
      dateNow: dateNow,
      results: []
    });

  },

  onShow() {}
})