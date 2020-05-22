const util = require('../../utils/util.js')
Page({

  data: {
    categoryList: [{
        title: "基本信息",
      },
      {
        title: "小票打印机",
      }
    ],
    navIndex: 0,
    is_use: false,
    printFlag: false,
    multiIndex: [8, 15],
    sendMoney: '',
    deliverMoney: '',
    fullAmount: '',
    key: '',
    count: '',
    name: '',
    is_use: false,
    customArray: [
      ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '22:00', '23:00'],
      ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '22:00', '23:00'],
    ]
  },

  /** 切换导航栏 */
  navChange(e) {
    this.setData({
      navIndex: e.currentTarget.dataset.index
    })
  },

  /** 份数绑定 */
  countInput(e) {
    this.data.count = e.detail.value.replace(/[^\d]/g, "");
    this.setData({
      count: this.data.count
    })
  },

  /** 打印机名称绑定 */
  nameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  /** 密钥绑定 */
  keyInput(e) {
    this.setData({
      key: e.detail.value
    })
  },

  /** 配送时间选择 */
  bindPickerChange(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },

  /** 配送费输入验证 */
  sendMoneyInput(e) {
    this.data.sendMoney = this.clearNoNum(e.detail)
    this.setData({
      sendMoney: this.data.sendMoney
    })
  },

  /** 设备号绑定 */
  numberInput(e) {
    this.setData({
      number: e.detail.value
    })
  },
  /** 起送价验证 */
  deliverMoneyInput(e) {
    this.data.deliverMoney = this.clearNoNum(e.detail)
    this.setData({
      deliverMoney: this.data.deliverMoney
    })
  },

  /** 满额免配送费 */
  fullAmountInput(e) {
    this.data.fullAmount = this.clearNoNum(e.detail)
    this.setData({
      fullAmount: this.data.fullAmount
    })
  },

  /** 绑定开关 */
  switchChange(e) {
    this.setData({
      is_use: e.detail.value
    })
  },

  /** 判断配送费和起送价 */
  clearNoNum(obj) {
    obj.value = obj.value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符   
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数   
    if (obj.value.indexOf(".") < 0 && obj.value != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
      obj.value = parseFloat(obj.value);
    }
    return obj.value
  },

  /** 打印设置 */
  setPrint() {
    let that = this;
    if (!that.data.name) {
      util.failToast('请输入打印机名称')
      return
    } else if (!that.data.number) {
      util.failToast('请输入设备号')
      return
    } else if (!that.data.key) {
      util.failToast('请输入密钥')
      return
    } else if (!that.data.count) {
      util.failToast('请输入打印份数')
      return
    }
    util.WxRequest({
      url: util.api + "/xadmin/print/",
      data: {
        is_use: that.data.is_use,
        name: that.data.name,
        number: that.data.number,
        key: that.data.key,
        page: that.data.count
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast('设置成功')
      }
    }).catch(err => {
      util.failToast("设置失败");
      console.log(err)
    });
  },

  /** 基本信息设置 */
  setBaseInfo() {
    let that = this;
    if (!that.data.sendMoney) {
      util.failToast('请输入配送费')
      return
    } else if (!that.data.deliverMoney) {
      util.failToast('请输入起送价')
      return
    } else if (!that.data.fullAmount) {
      util.failToast('请输入满额免配送费')
      return
    }
    util.WxRequest({
      url: util.api + "/xadmin/ps/",
      data: {
        time: that.data.customArray[0][that.data.multiIndex[0]] + '-' + that.data.customArray[1][that.data.multiIndex[1]],
        price: that.data.sendMoney,
        start_price: that.data.deliverMoney,
        max_price: that.data.fullAmount
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast('设置成功')
      }
    }).catch(err => {
      util.failToast("设置失败");
      console.log(err)
    });
  },

  /** 确定修改 */
  sureSet() {
    if (this.data.navIndex == 0) {
      this.setBaseInfo();
    } else {
      this.setPrint();
    }
  },

  /** 获取默认信息 */
  getBaseInfo() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/print/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        this.setData({
          is_use: res.data.data[0].is_use,
          key: res.data.data[0].key,
          name: res.data.data[0].name,
          number: res.data.data[0].number,
          count: res.data.data[0].page
        })
      }
    }).catch(err => {
      util.failToast("获取默认数据失败");
      console.log(err)
    });
    util.WxRequest({
      url: util.api + "/xadmin/ps/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        var time = res.data.data[0].time.split('-');
        let count = -1;
        that.data.customArray[0].forEach(e => {
          count++;
          if (time[0] == e) {
            that.data.multiIndex[0] = count
          }
          if (time[1] == e) {
            that.data.multiIndex[1] = count
          }
        })
        that.setData({
          sendMoney: res.data.data[0].price,
          fullAmount: res.data.data[0].max_price,
          deliverMoney: res.data.data[0].start_price,
          multiIndex: that.data.multiIndex
        })
      }
    }).catch(err => {
      util.failToast("获取默认数据失败");
      console.log(err)
    });
  },

  /** 跳转工作台 */
  navToJob() {
    wx.navigateTo({
      url: '/pages/workbench/workbench'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getBaseInfo()
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})