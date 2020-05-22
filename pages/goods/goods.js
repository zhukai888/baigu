const app = getApp();
const util = require('../../utils/util.js')

Page({

  data: {
    cdn_url: util.cdn_url,
    categoryList: [], //分类列表
    goodsList: [], //商品列表
    navIndex: 0,
    showCar: false,
    showCoupon: false,
    detailGood: {}, //商品弹窗详情对象
    goodShadow: false,
    page_size: 10,
    page: 1,
    next: true,
    cartList: [], //购物车商品
    chooseAll: false,
    totalPrice: 0,
    couponList: [], //优惠券数组,
    cartCount: 0, //购物车数量
    loading: true,
    searchFlag: false
  },

  /** 详情数量改变input */
  detailNumInput(e) {
    this.data.detailGood.nums = parseInt(e.detail.value.replace(/\D/g, ''));
    if (this.data.detailGood.nums) {
      this.data.detailGood.total = this.data.detailGood.nums * this.data.detailGood.shop_price
    } else {
      this.data.detailGood.total = 0
    }
    this.setData({
      detailGood: this.data.detailGood
    })
  },

  /** 商品数量失焦 */
  detailNumBlur(e) {
    if (e.detail.value == "") {
      this.data.detailGood.nums = 1
    }
    this.data.detailGood.total = this.data.detailGood.nums * this.data.detailGood.shop_price
    this.setData({
      detailGood: this.data.detailGood
    })
  },

  /** 直接下单 */
  placeOrder(e) {
    if (!wx.getStorageSync("utoken")) {
      wx.navigateTo({
        url: '/pages/toLogin/toLogin',
      })
    } else {
      wx.navigateTo({
        url: '/pages/confOrder/confOrder?good=' + JSON.stringify(e.currentTarget.dataset.item),
      })
    }
  },

  /** 购物车直接付款 */
  placePay() {
    let data = [];
    this.data.cartList.forEach(e => {
      if (e.choose) {
        data.push(e);
      }
    });
    if (data.length == 0) {
      util.failToast("请选择商品")
      return;
    }
    wx.navigateTo({
      url: '/pages/confOrder/confOrder?cart=' + JSON.stringify(data),
    })
  },

  /**商品遮罩层打开 */
  detailShow(e) {
    let that = this;
    that.data.goodsList.map(e => {
      e.showShadow = false;
    })
    this.getGoodDetail(that.data.goodsList[e.currentTarget.dataset.index].id);
    that.setData({
      goodsList: that.data.goodsList
    })
  },

  /** 获取商品详情 */
  getGoodDetail(id) {
    let that = this;
    wx.showLoading({
      title: "正在加载···"
    })
    wx.request({
      url: util.api + '/goods/' + id,
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.data.status.code == 1) {
          res.data.data.nums = 1;
          if (app.globalData.goodId) {
            app.globalData.goodId = null
          }
          res.data.data.total = res.data.data.nums * res.data.data.shop_price
          that.setData({
            detailGood: res.data.data,
            goodShadow: true
          })
        }
      },
      fail(err) {
        console.log(err)
      },
      complete(res) {
        wx.hideLoading()
      }
    })
  },

  /**解决遮罩层冲突 */
  returnNull () {
    return;
  },

  /**商品遮罩层关闭 */
  detailClose(e) {
    this.setData({
      goodShadow: false,
      detailGood: {}
    })
  },

  /** 顶部导航栏改变 */
  navChange(e) {
    if (this.data.navIndex == e.currentTarget.dataset.index) {
      return;
    }
    if (app.globalData.title) {
      app.globalData.title = null
    }
    this.setData({
      navIndex: e.currentTarget.dataset.index,
      goodsList: [],
      loading: true,
    })
    this.data.page = 1;
    this.getGoods(this.data.page);
  },

  /** 改变购物券 */
  changeCoupon() {
    this.setData({
      showCoupon: !this.data.showCoupon
    })
  },

  /** 选择/不选择某个购物车商品 */
  choose(e) {
    this.data.cartList[e.currentTarget.dataset.index].choose = !this.data.cartList[e.currentTarget.dataset.index].choose;
    this.data.totalPrice = 0;
    let checkedNum = 0;
    this.data.cartList.forEach(e => {
      if (e.choose) {
        checkedNum++;
        this.data.totalPrice = this.data.totalPrice + e.goods.shop_price * e.nums
      }
    })
    if (checkedNum == this.data.cartList.length) {
      this.data.chooseAll = true
    } else {
      this.data.chooseAll = false;
    }
    this.setData({
      cartList: this.data.cartList,
      chooseAll: this.data.chooseAll,
      totalPrice: this.data.totalPrice
    })
  },

  /** 选择/不选择全部购物车商品 */
  chooseAll() {
    let that = this;
    if (that.data.cartList.length == 0) {
      return;
    }
    if (that.data.chooseAll) {
      that.data.cartList.forEach(e => {
        e.choose = false;
      })
    } else {
      that.data.cartList.forEach(e => {
        e.choose = true;
      })
    }
    that.data.totalPrice = 0;
    that.data.cartList.forEach(e => {
      if (e.choose) {
        that.data.totalPrice = that.data.totalPrice + e.nums * e.goods.shop_price;
      }
    })
    that.setData({
      totalPrice: that.data.totalPrice,
      cartList: that.data.cartList,
      chooseAll: !that.data.chooseAll
    })
  },

  /** 删除购物车 */
  delCart(e) {
    let that = this;
    let total = that.data.cartList[e.currentTarget.dataset.index].goods.shop_price + that.data.cartList[e.currentTarget.dataset.index].nums
    util.WxRequest({
      url: util.api + "/cart/" + e.currentTarget.dataset.id + "/",
      data: {},
      method: "DELETE"
    }).then(res => {
      if (res.data.status.code == 2004) {
        that.data.totalPrice = that.data.totalPrice - total;
        for (let i = 0; i < this.data.cartList.length; i++) {
          if (that.data.cartList[i].id == e.currentTarget.dataset.id) {
            that.data.cartList.splice(i, 1);
            break;
          }
        }
        that.data.cartCount = --that.data.cartCount;
        that.setData({
          totalPrice: that.data.totalPrice,
          cartCount: that.data.cartCount,
          cartList: that.data.cartList
        })
        util.sucToast("删除成功");
      }

    }).catch(err => {
      util.failToast("删除失败");
      console.log(err)
    });
  },

  /** 商品详情数量加 */
  plus() {
    this.data.detailGood.nums++;
    this.data.detailGood.total = this.data.detailGood.nums * this.data.detailGood.shop_price
    this.setData({
      detailGood: this.data.detailGood
    })
  },

  /** 商品详情数量减 */
  reduce() {
    if (this.data.detailGood.nums > 1) {
      this.data.detailGood.nums--;
    }
    this.data.detailGood.total = this.data.detailGood.nums * this.data.detailGood.shop_price
    this.setData({
      detailGood: this.data.detailGood
    })
  },

  /** 购物车数量输入框input方法 */
  cartInput(e) {
    this.data.cartList[e.currentTarget.dataset.index].nums = parseInt(e.detail.value.replace(/\D/g, ''));
    this.setData({
      cartList: this.data.cartList
    })
  },

  /** 商品列表/商品详情添加购物车 */
  listAddCart(e) {
    this.addCart(e.currentTarget.dataset.id, true, 1).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast("添加成功")
        this.setData({
          goodShadow: false,
          cartCount: res.data.data.all_nums
        })
      } else {
        util.failToast("添加失败")
      }
    });
  },

  /** 购物车商品加  */
  cartAdd(e) {
    this.addCart(this.data.cartList[e.currentTarget.dataset.index].goods.id, true, 1).then(res => {
      if (res.data.status.code == 2001) {
        this.data.cartList[e.currentTarget.dataset.index].nums = res.data.data.nums;
        if (this.data.cartList[e.currentTarget.dataset.index].choose) {
          this.data.totalPrice = 0;
          this.data.cartList.forEach(e => {
            if (e.choose) {
              this.data.totalPrice = +e.goods.shop_price * e.nums
            }
          })
        }
        this.setData({
          cartList: this.data.cartList,
          totalPrice: this.data.totalPrice
        })
      } else {
        util.failToast("增加数量失败")
      }
    })
  },

  /** 购物车商品减 */
  cartReduce(e) {
    if (this.data.cartList[e.currentTarget.dataset.index].nums == 1) {
      return;
    }
    this.addCart(this.data.cartList[e.currentTarget.dataset.index].goods.id, false, 1).then(res => {
      if (res.data.status.code == 2001) {
        this.data.cartList[e.currentTarget.dataset.index].nums = res.data.data.nums;
        if (this.data.cartList[e.currentTarget.dataset.index].choose) {
          this.data.totalPrice = 0;
          this.data.cartList.forEach(e => {
            if (e.choose) {
              this.data.totalPrice = +e.goods.shop_price * e.nums
            }
          })
        }
        this.setData({
          cartList: this.data.cartList,
          totalPrice: this.data.totalPrice
        })
      } else {
        util.failToast("减少数量失败")
      }
    })
  },

  /** 输入框改变购物车数量 */
  cartNumsBlur(e) {
    if (e.detail.value == "") {
      this.data.cartList[e.currentTarget.dataset.index].nums = 1
    }
    let that = this;
    util.WxRequest({
      url: util.api + "/cart/" + this.data.cartList[e.currentTarget.dataset.index].id + "/",
      data: {
        nums: this.data.cartList[e.currentTarget.dataset.index].nums
      },
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        this.data.cartList[e.currentTarget.dataset.index].nums = res.data.data.nums;
        if (this.data.cartList[e.currentTarget.dataset.index].choose) {
          this.data.totalPrice = 0;
          this.data.cartList.forEach(e => {
            if (e.choose) {
              this.data.totalPrice = +e.goods.shop_price * e.nums
            }
          })
        }
        this.setData({
          cartList: this.data.cartList,
          totalPrice: this.data.totalPrice
        })
      }
    }).catch(err => {
      util.sucToast("修改失败");
      console.log(err)
    });
  },

  /** 添加/减少购物车 */
  addCart(id, up_down, nums) {
    return new Promise((resolve, reject) => {
      let that = this;
      util.WxRequest({
        url: util.api + "/cart/",
        data: {
          up_down: up_down,
          nums: nums,
          goods: id
        },
        method: "POST"
      }).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
        console.log(err)
      });
    });
  },

  /** 改变购物车遮罩层 */
  changeCar() {
    let that = this;
    if (!this.data.showCar) {
      util.WxRequest({
        url: util.api + "/cart/",
        data: {},
        method: "GET",
      }).then(res => {
        if (res.data.status.code == 1) {
          res.data.data.forEach(e => {
            e.choose = false;
          })
          that.setData({
            cartList: res.data.data
          })
        }
        this.setData({
          showCar: !this.data.showCar
        })
      }).catch(err => {
        console.log(err)
      });
    } else {
      this.setData({
        totalPrice: 0,
        chooseAll: false,
        showCar: !this.data.showCar
      })
    }
  },

  /** 展开商品遮罩层 */
  showShadow(e) {
    this.data.goodsList.map(e => {
      e.showShadow = false;
    })
    this.data.goodsList[e.currentTarget.dataset.index].showShadow = true;
    this.setData({
      goodsList: this.data.goodsList
    })
  },

  /** 关闭商品遮罩层 */
  closeShadow(e) {
    this.data.goodsList[e.currentTarget.dataset.index].showShadow = false;
    this.setData({
      goodsList: this.data.goodsList
    })
  },

  /**获取商品列表 */
  getGoods(page) {
    let that = this;
    wx.showLoading({
      title: "正在加载···"
    })
    let data = {};
    if (that.data.categoryList[that.data.navIndex].id) {
      data = {
        top_category: that.data.categoryList[that.data.navIndex].id,
        page: page,
        page_size: that.data.page_size
      }
    } else {
      data = {
        page: page,
        page_size: that.data.page_size
      }
    }
    wx.request({
      url: util.api + '/goods/?',
      data: data,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.status == 1) {
          that.data.next = res.data.next ? true : false;
          res.data.results.map(e => {
            e.showShadow = false;
            that.data.goodsList.push(e);
          })
          that.setData({
            goodsList: that.data.goodsList,
          })
        }
      },
      fail(err) {
        console.log(err)
      },
      complete(res) {
        if (that.data.loading) {
          that.setData({
            loading: false
          })
        }
        wx.hideLoading()
      }
    })
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
            res.data.data.unshift({
              id: "",
              name: "全部"
            })
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

  /** 获取购物车商品数量 */
  getCartCount() {
    if (!wx.getStorageSync("utoken")) {
      return;
    }
    let that = this;
    util.WxRequest({
      url: util.api + "/cart/?num=1",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.setData({
          cartCount: res.data.data[0].nums
        })
      }
    }).catch(err => {
      util.failToast("获取购物车数量失败")
      console.log(err)
    });
  },

  /** 搜索条件 */
  getForTitle(title) {
    this.data.page = 1;
    this.searchFlag = false;
    this.searchTitle(title)
  },

  /** 搜索条件搜索商品 */
  searchTitle(title) {
    let that = this;
    wx.showLoading({
      title: "正在加载···"
    })
    wx.request({
      url: util.api + '/goods/?name=' + title,
      data: {
        page: that.data.page,
        page_size: that.data.page_size
      },
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.status == 1) {
          that.data.next = res.data.next ? true : false;
          that.data.goodsList = that.data.goodsList.concat(res.data.results);
          that.setData({
            goodsList: that.data.goodsList
          })
        }
      },
      fail(err) {
        console.log(err)
      },
      complete(res) {
        wx.hideLoading()
      }
    })
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
    this.getCartCount();
    this.setData({
      goodsList: [],
      loading: true
    })
    this.getCategory().then(res => {
      if (app.globalData.classifyId) {
        this.data.page = 1;
        for (let i = 0; i < this.data.categoryList.length; i++) {
          if (this.data.categoryList[i].id == app.globalData.classifyId) {
            this.setData({
              navIndex: i
            })
            this.data.page = 1;
            this.getGoods(this.data.page);
            app.globalData.classifyId = null;
            break;
          }
        }
      } else if (app.globalData.goodId) {
        this.data.page = 1;
        this.getGoods(this.data.page);
        this.getGoodDetail(app.globalData.goodId);
      } else if (app.globalData.title) {
        this.data.page = 1;
        this.setData({
          navIndex: 0,
        })
        this.getForTitle(app.globalData.title);
      } else {
        this.data.page = 1;
        this.getGoods(this.data.page);
      }
    }).catch(err => {
      console.log(err)
    });


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      totalPrice: 0,
      chooseAll: false,
      showCar: false
    })
    app.globalData.title = null;
    app.globalData.classifyId = null;
    app.globalData.goodId = null;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.next) {
      if (app.globalData.title) {
        this.data.page++;
        this.searchTitle(app.globalData.title);
      } else {
        this.getGoods(++this.data.page);
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    return {
      title: e.target.dataset.item.name,
      path: '/page/goods/goods',
      imageUrl: this.data.cdn_url + e.target.dataset.item.goods_front_image
    }
  }
})