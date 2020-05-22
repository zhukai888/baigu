const util = require('../../utils/util.js')

Page({
  data: {
    addressObj: null,
    good: null,
    cart: null,
    goodObj: null, //单个商品
    cartList: [], //购物车商品
    cdn_url: util.cdn_url,
    couponList: [],
    animationData: null,
    showCostDetail: false,
    couponObj: null,
    post_script: "",
    total: 0,
    count: 0,
    ps: 0
  },

  /** 选择地址 */
  chooseAddress() {
    wx.navigateTo({
      url: '/pages/address/address?addressId=1',
    })
  },

  /** 绑定备注 */
  postBlur(e) {
    this.setData({
      post_script: e.detail.value
    })
  },

  /** 获取配送费 */
  getPs() {
    let that = this;
    util.WxRequest({
      url: util.api + "/ps/",
      data: {},
      method: "Get"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.setData({
          ps: res.data.data.price
        })
      }
    }).catch(err => {
      util.failToast("获取配送费失败");
      console.log(err)
    });
  },



  /** 创建订单 */
  createOrder() {
    let that = this;
    if (!that.data.addressObj) {
      util.failToast("请选择地址");
      return;
    }
    let data;
    if (that.data.goodObj) {
      data = {
        address: that.data.addressObj.id,
        goodsid: that.data.goodObj.id.toString(),
        nums: that.data.goodObj.nums.toString(),
        post_script: that.data.post_script
      }
    } else if (that.data.cartList.length != 0) {
      let cart = ""
      that.data.cartList.forEach(e => {
        cart = cart ? cart + "-" + e.id : e.id
      })
      data = {
        address: that.data.addressObj.id,
        cart: cart,
        post_script: that.data.post_script
      }
    } else {
      let goodsid = "";
      let nums = "";
      that.data.goods.forEach(e => {
        goodsid = goodsid.length == 0 ? e.id : goodsid + "-" + e.id,
          nums = nums.length == 0 ? e.nums : nums + "-" + e.nums
      })

      data = {
        address: that.data.addressObj.id,
        goodsid: goodsid,
        nums: nums,
        post_script: that.data.post_script
      }
    }
    if (that.data.couponObj) {
      data.oupons = that.data.couponObj.id
    }
    util.WxRequest({
      url: util.api + "/order/",
      data: data,
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast("订单创建成功")
        that.payTap(res.data.data.id);
      }
    }).catch(err => {
      util.failToast("订单创建失败");
      console.log(err)
    });
  },

  /** 支付 */
  payTap: function(id) {
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
              that.changeOrderStatus(id, "TRADE_SEND")
            } else {
              that.changeOrderStatus(id, "PAYING")
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
  changeOrderStatus(id, status) {
    let that = this;
    util.WxRequest({
      url: util.api + "/order/" + id + "/",
      data: {
        pay_status: status
      },
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        wx.navigateTo({
          url: '/pages/payRecord/payRecord',
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },


  /** 获取优惠券 */
  getCoupon() {
    let that = this;
    util.WxRequest({
      url: util.api + "/coupons/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        res.data.data.forEach(e => {
          e.st_time = e.st_time.replace(/-/g, ".");
          e.en_time = e.en_time.replace(/-/g, ".");
          if (e.max < that.data.total) {
            that.data.couponObj = that.data.couponObj > e.max ? that.data.couponObj : e
          }
        })
        that.setData({
          couponObj: that.data.couponObj,
          couponList: res.data.data
        })
      }
    }).catch(err => {
      util.failToast("获取优惠券失败");
      console.log(err)
    });
  },

  /** 获取地址列表 */
  getAddress() {
    util.WxRequest({
      url: util.api + "/address/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].is_default) {
            this.setData({
              addressObj: res.data.data[i]
            })
            break;
          }
        }
      }
    }).catch(err => {
      util.failToast("获取地址失败");
      console.log(err)
    });
  },

  /** 删除地址后改变地址 */
  AddressChange() {
    if (!this.data.addressObj) {
      return;
    }
    util.WxRequest({
      url: util.api + "/address/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        let exist = false;
        let defAddress = null;
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].is_default) {
            defAddress = res.data.data[i]
          }
          if (res.data.data[i].id == this.data.addressObj.id) {
            exist = true
            break;
          }
        }
        if (!exist) {
          if (defAddress) {
            this.setData({
              addressObj: defAddress
            })
          } else {
            this.setData({
              addressObj: null
            })
          }
        }

      } else {
        this.setData({
          addressObj: null
        })
      }
    }).catch(err => {
      util.failToast("获取地址失败");
      console.log(err)
    });
  },

  /** 打开优惠券遮罩层 */
  showCostDetailFun() {
    if (this.data.couponList.length == 0) {
      return;
    }
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(600).step()
    this.setData({
      animationData: animation.export(),
      showCostDetail: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  /** 隐藏优惠券遮罩层 */
  hideCostDetailFun() {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(600).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        showCostDetail: false
      })
    }.bind(this), 200)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCoupon();
    this.getAddress();
    this.getPs();
    if (options.good) {
      this.data.goodObj = JSON.parse(options.good);
      this.data.goodObj.nums = this.data.goodObj.nums ? this.data.goodObj.nums : 1
      this.setData({
        count: this.data.goodObj.nums,
        total: this.data.goodObj.nums * this.data.goodObj.shop_price,
        goodObj: this.data.goodObj
      })
    } else if (options.cart) {
      let cart = JSON.parse(options.cart);
      console.log(cart)
      cart.forEach(e => {
        this.data.total += e.total_fee;
        this.data.count += e.nums;
      })
      this.setData({
        count: this.data.count,
        total: this.data.total,
        cartList: cart
      })
    } else if (options.goodList) {
      console.log(JSON.parse(options.goodList));
      let goods = JSON.parse(options.goodList);
      goods.forEach(e => {
        this.data.total += e.nums * e.shop_price;
        this.data.count += e.nums;
      })
      this.setData({
        count: this.data.count,
        total: this.data.total,
        goods: goods
      })
    }
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
    this.AddressChange();
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})