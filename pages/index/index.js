const app = getApp();
const util = require('../../utils/util.js')

Page({
  data: {
    cdn_url: util.cdn_url,
    bannerList: [],
    categoryList: [],
    recomendNum: 1,
    activeList: [],
    newsList: [],
    title: ""
  },

  /** 绑定搜索内容 */
  inputTitle(e) {
    this.setData({
      title: e.detail.value
    })
  },

  /** 搜索框 */
  search() {
    if (this.data.title.length == 0) {
      util.failToast("搜索内容不能为空");
      return;
    }
    app.globalData.title = this.data.title;
    wx.switchTab({
      url: '/pages/goods/goods',
    })
  },

  /** 滚动图改变 */
  bannerChange(e) {
    this.setData({
      recomendNum: e.detail.current + 1
    })
  },

  /** 热门推荐图点击 */
  goodsTo(e) {
    app.globalData.goodId = e.currentTarget.dataset.id;
    wx.switchTab({
      url: '/pages/goods/goods'
    })
  },

  /** 分类点击 */
  categoryTo(e) {
    app.globalData.classifyId = e.currentTarget.dataset.id;
    wx.switchTab({
      url: '/pages/goods/goods'
    })
  },

  /** 获取公告 */
  getNews() {
    let that = this;
    wx.request({
      url: util.api + '/news/',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.status.code == 1) {
          that.setData({
            newsList: res.data.data
          })
        }
      }
    })
  },

  /** 热门推荐和最新活动列表 */
  getBanner() {
    let that = this;
    wx.request({
      url: util.api + '/banner/',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.status.code == 1) {
          res.data.data.forEach(e => {
            if (e.show_type == 1) {
              that.data.bannerList.push(e);
            } else {
              that.data.activeList.push(e);
            }
          })
          that.setData({
            bannerList: that.data.bannerList,
            activeList: that.data.activeList
          })
        }
      }
    })
  },

  /** 获取商品详情 */
  payRecord(e) {
    let that = this;
    wx.request({
      url: util.api + '/goods/' + e.currentTarget.dataset.id,
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.data.status.code == 1) {
          res.data.data.nums = 1;
          if (!wx.getStorageSync("utoken")) {
            wx.navigateTo({
              url: '/pages/toLogin/toLogin',
            })
          } else {
            wx.navigateTo({
              url: '/pages/confOrder/confOrder?good=' + JSON.stringify(res.data.data),
            })
          }
        }
      }
    })
  },

  /** 获取分类 */
  getCategory() {
    let that = this;
    wx.request({
      url: util.api + '/category/',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.status.code == 1) {
          that.setData({
            categoryList: res.data.data
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getBanner();
    this.getCategory();
    this.getNews();
  },

  /**
 * 生命周期函数--监听页面隐藏
 */
  onHide: function () {
    this.setData({
      title:""
    })
  },
});