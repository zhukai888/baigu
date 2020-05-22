const util = require('../../utils/util.js')
Page({

  data: {
    navIndex: 0,
    categoryList: [],
    goodList: [],
    cdn_url: util.cdn_url,
    sureFlag: false,
    delObj: null,
    page: 1,
    page_size: 10,
    searchTitle: '',
    searchFlag: false,
    next: true,
    loading: true
  },

  /** 搜索绑定 */
  searchInput(e) {
    this.setData({
      searchTitle: e.detail.value
    })
  },

  /** 搜索提交事件 */
  search() {
    if (this.data.searchTitle.length == 0) {
      util.failToast("搜索内容不能为空");
      return;
    }
    this.data.searchFlag = true
    this.setData({
      goodList: [],
      page: 1,
      loading: true,
      searchFlag: true
    })
    this.searchGoods();
  },
  /** 搜索商品 */
  searchGoods() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/goods/?name=" + this.data.searchTitle,
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
        that.data.goodList = that.data.goodList.concat(res.data.results);
        that.setData({
          goodList: that.data.goodList
        })
      }
    }).catch(err => {
      util.failToast("操作失败");
      console.log(err)
    });
  },

  /** 删除商品弹窗打开 */
  openDel(e) {
    this.data.delObj = e.currentTarget.dataset.item
    this.data.delObj.index = e.currentTarget.dataset.index
    this.setData({
      sureFlag: true
    })
  },

  /** 删除商品弹窗关闭 */
  closeDel() {
    this.setData({
      sureFlag: false
    })
  },

  /**导航栏改变 */
  navChange(e) {
    if (this.data.navIndex == e.currentTarget.dataset.index) {
      return;
    }
    this.setData({
      navIndex: e.currentTarget.dataset.index,
      goodList: [],
      searchFlag: false,
      searchTitle: '',
      loading: true
    })
    this.data.top_category = this.data.categoryList[this.data.navIndex].id;
    this.getGoodList();
  },

  /** 获取分类 */
  getCategory() {
    return new Promise((resolve, reject) => {
      let that = this;
      wx.showLoading({
        title: "正在加载···"
      })
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
            resolve(that.data.categoryList);
          }
        },
        fail(err) {
          reject(err)
        },
        complete(res) {
          wx.hideLoading()
        }
      })
    })
  },

  /** 获取商品列表 */
  getGoodList() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/goods/",
      data: {
        top_category: that.data.categoryList[that.data.navIndex].id
      },
      method: "GET"
    }).then(res => {
      if (that.data.loading) {
        that.setData({
          loading: false
        })
      }
      if (res.data.status == 1) {
        that.data.goodList = that.data.goodList.concat(res.data.results)
        that.data.next = res.data.next ? true : false;
        that.setData({
          goodList: that.data.goodList
        })
        this.closeDel()
      }
    }).catch(err => {
      util.failToast("获取商品列表失败");
      console.log(err)
    });
  },

  /** 上下架商品 */
  lowGood(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/goods/" + e.currentTarget.dataset.id + "/",
      data: {
        is_use: e.currentTarget.dataset.status == 1 ?  true:false
      },
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.goodList[e.currentTarget.dataset.index].is_use = res.data.data.is_use;
        that.setData({
          goodList: that.data.goodList
        })
      }
    }).catch(err => {
      util.failToast("操作失败");
      console.log(err)
    });
  },

  /** 删除商品 */
  sureDel(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/goods/" + that.data.delObj.id + "/",
      data: {
        is_delete: true
      },
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.goodList.splice(that.data.delObj.index, 1)
        util.failToast("删除成功");
        that.setData({
          delObj: null,
          goodList: that.data.goodList
        })
      }
    }).catch(err => {
      util.failToast("删除失败");
      console.log(err)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCategory().then(res => {
      this.getGoodList()
    });
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
      this.data.page++
        if (this.data.searchFlag) {
          this.searchGoods()
        } else {
          this.getGoodList()
        }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})