const util = require('../../utils/util.js')
const app = getApp();

Page({

  data: {
    cdn_url: util.cdn_url,
    height: "0px",
    showOption: false,
    chatList: [],
    page: 1,
    next: false,
    inputShadow: false,
    replayName: "",
    inputIndex: "",
    ruser: {},
    replayValue: "",
    replayCount: 0,
    tchat: "",
    inputIdx: "",
    page_size: 10,
    timeList: [{
        title: "全部",
        time: 0
      },
      {
        title: "三天内",
        time: 3
      },
      {
        title: "一周内",
        time: 7
      },
      {
        title: "一个月内",
        time: 30
      },
      {
        title: "三个月内",
        time: 90
      }
    ],
    timeObj: {},
    utoken: "",
    mobile: "",
    loading: true,
    // inputFocus: false
  },

  /** 评论输入框失焦 */
  inputblur(e){
    this.data.chatList[e.currentTarget.dataset.index].inputFocus = false;
    this.setData({
      chatList: this.data.chatList
    })
  },

  /** 点击评论数量 */
  talk(e) {
    this.data.chatList[e.currentTarget.dataset.index].inputFocus = true;
    this.setData({
      chatList: this.data.chatList
    })
  },

  /**举报打开 */
  openReport(e) {
    this.data.chatList[e.currentTarget.dataset.index].showReport = !this.data.chatList[e.currentTarget.dataset.index].showReport;
    this.setData({
      chatList: this.data.chatList
    })
  },

  /** 关闭举报 */
  closeReport() {
    this.data.chatList.forEach(e => {
      e.showReport = false
    })
    this.setData({
      chatList: this.data.chatList
    })
  },

  /** 举报 */
  report(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/chat/" + e.currentTarget.dataset.id + '/',
      data: {
        is_jb: true
      },
      method: "PUT"
    }).then(res => {
      // this.closeReport();
      if (res.data.status.code == 1) {
        util.sucToast('举报成功等待管理员审核')
      }
    }).catch(err => {
      util.failToast("举报失败");
      console.log(err)
    });
  },

  /** 选项卡改变 */
  navChange(e) {
    this.setData({
      timeObj: this.data.timeList[e.currentTarget.dataset.index],
      chatList: []
    })
    this.getChat();
    this.closeOption();
  },

  /** 输入框聚焦事件 */
  focus(e) {
    this.setData({
      height: e.detail.height - 55 + "px"
    })
  },

  /**解决遮罩层冲突 */
  returnNull () {
    return;
  },

  /** 绑定回复文本 */
  bindReplayValue(e) {
    this.setData({
      replayValue: e.detail.value
    })
  },

  /**跳转 */
  navTo(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

  /** 跳转详情 */
  navToCard(e) {
    app.globalData.previewImageFlag = false
    wx.navigateTo({
      url: "/pages/cardDetail/cardDetail?id=" + e.currentTarget.dataset.id,
    })
  },

  /** 选项改变 */
  changeOption() {
    this.setData({
      showOption: !this.data.showOption
    })
  },

  /** 选项关 */
  closeOption() {
    this.setData({
      showOption: false
    })
    this.closeReport();
  },

  /** 获取社群论坛列表 */
  getChat() {
    let that = this;
    let data = {};
    if (that.data.timeObj.time != 0) {
      data = {
        time: that.data.timeObj.time,
        page: that.data.page,
        page_size: that.data.page_size
      }
    } else {
      data = {
        page: that.data.page,
        page_size: that.data.page_size
      }
    }
    util.WxRequest({
      url: util.api + "/chat/",
      data: data,
      method: "GET"
    }).then(res => {
      if (res.statusCode == 403) {
        wx.reLaunch({
          url: '/pages/member/member?type=1'
        })
      } else if (res.data.status == 1) {
        res.data.results.forEach(e => {
          e.value = "";
          e.talkCount = 0;
          e.chat = [];
          e.showReport = false;
          e.inputFocus = false;
          e.sub_chat.forEach(chat => {
            e.talkCount++;
            chat.sub_tchat.forEach(tchat => {
              e.talkCount++;
            })
          })

          out: for (let x = 0; x < e.sub_chat.length; x++) {
            e.chat.push(e.sub_chat[x])
            if (e.chat.length == 3) {
              break out;
            }
            inner: for (let y = 0; y < e.sub_chat[x].sub_tchat.length; y++) {
              e.chat.push(e.sub_chat[x].sub_tchat[y]);
              if (e.chat.length == 3) {
                break out;
              }
            }

          }

        })
        that.data.chatList = that.data.chatList.concat(res.data.results)
        that.data.next = res.data.next ? true : false
        that.setData({
          chatList: that.data.chatList
        })
      }
      if (that.data.loading) {
        that.setData({
          loading: false
        })
      }
    }).catch(err => {
      util.failToast("获取失败");
      console.log(err)
    });
  },

  /** 点赞 */
  changLove(e) {
    let that = this;
    util.WxRequest({
      url: util.api + "/chatfav/",
      data: {
        chat: that.data.chatList[e.currentTarget.dataset.index].id
      },
      method: "Post"
    }).then(res => {
      if (res.data.status.code == 2001) {
        if (that.data.chatList[e.currentTarget.dataset.index].is_fav == 0) {
          that.data.chatList[e.currentTarget.dataset.index].is_fav = 1;
          that.data.chatList[e.currentTarget.dataset.index].fav_nums++;
        } else {
          that.data.chatList[e.currentTarget.dataset.index].is_fav = 0;
          that.data.chatList[e.currentTarget.dataset.index].fav_nums--;
        }
        that.setData({
          chatList: that.data.chatList
        })
      }
    }).catch(err => {
      util.failToast("操作失败");
      console.log(err)
    });
  },

  /** 回复输入框调动 */
  changeShadow(e) {
    // let nick_name = wx.getStorageSync("nick_name");
    // if (e.currentTarget.dataset.ruser.nick_name != nick_name) {
    this.setData({
      inputIndex: e.currentTarget.dataset.index,
      inputIdx: e.currentTarget.dataset.idx,
      tchat: e.currentTarget.dataset.tchat,
      ruser: e.currentTarget.dataset.ruser,
      replayName: e.currentTarget.dataset.ruser.nick_name,
      replayValue: '',
      inputShadow: true
    })
    console.log(this.data.inputIndex + "fsdfsd");
    // }
  },

  /** 回复输入框关闭 */
  closeShadow() {
    this.setData({
      inputShadow: false
    })
  },

  /** 评论/回复评论 */
  confirmTalk(e) {
    let that = this;
    let data = {}
    if (e.currentTarget.dataset.type == "discuss") {
      if (e.detail.value.length == 0) {
        return;
      }
      data = {
        chat: e.currentTarget.dataset.id,
        title: e.detail.value
      }
    } else {
      if (this.data.replayValue.length == 0) {
        return;
      }
      data = {
        tchat: this.data.tchat,
        title: this.data.replayValue,
        ruser: this.data.ruser.id
      }
    }
    util.WxRequest({
      url: util.api + "/rechat/",
      data: data,
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast("评论成功");
        if (e.currentTarget.dataset.type == "discuss") {
          that.data.chatList[e.currentTarget.dataset.index].talkCount++;
          that.data.chatList[e.currentTarget.dataset.index].value = "";
          if (that.data.chatList[e.currentTarget.dataset.index].chat.length < 3) {
            that.data.chatList[e.currentTarget.dataset.index].chat.push({
              user: {
                nick_name: res.data.data.user_name
              },
              chat: res.data.data.chat,
              title: res.data.data.title,
              ruser: res.data.data.resuer
            })
          }
        } else {
          console.log(that.data.inputIndex, that.data.inputIdx)
          that.data.chatList[that.data.inputIndex].talkCount++;
          let num = -1;
          for (let z = that.data.inputIdx + 1; z < that.data.chatList[that.data.inputIndex].chat.length; z++) {
            if (that.data.chatList[that.data.inputIndex].chat[z].ruser == null) {
              num = z;
              break;
            }
          }
          if (num != -1) {
            that.data.chatList[that.data.inputIndex].chat.splice(num, 0, {
              user: {
                nick_name: res.data.data.user_name
              },
              chat: res.data.data.chat,
              title: res.data.data.title,
              add_time: res.data.data.add_time,
              ruser: that.data.ruser,
            });
          } else {
            that.data.chatList[that.data.inputIndex].chat.push({
              user: {
                nick_name: res.data.data.user_name
              },
              chat: res.data.data.chat,
              title: res.data.data.title,
              add_time: res.data.data.add_time,
              ruser: that.data.ruser,
            })
          }
          that.data.chatList[that.data.inputIndex].chat = that.data.chatList[that.data.inputIndex].chat.slice(0, 3);
          that.closeShadow();
        }
      }
      that.setData({
        chatList: that.data.chatList
      })
    }).catch(err => {
      util.failToast("评论失败");
      console.log(err)
    });
  },

  /** 需要回复的数量 */
  getReplayCount() {
    if (!this.data.utoken) {
      return;
    }
    util.WxRequest({
      url: util.api + "/chat/?num=1",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.statusCode == 403) {
        wx.reLaunch({
          url: '/pages/member/member?type=1'
        })
      } else if (res.data.status.code == 1) {
        this.setData({
          replayCount: res.data.data[0].nums
        })
      }
    }).catch(err => {
      util.failToast("获取回复数量失败");
      console.log(err)
    });
  },

  /** 预览图片 */
  previewImage(e) {
    app.globalData.previewImageFlag = false
    let urls = [];
    this.data.chatList[e.currentTarget.dataset.index].imgs.forEach(e => {
      urls.push(this.data.cdn_url + e)
    })
    wx.previewImage({
      current: this.data.cdn_url + e.currentTarget.dataset.src,
      urls: urls
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      timeObj: this.data.timeList[0]
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
    if (app.globalData.previewImageFlag) {
      this.setData({
        utoken: wx.getStorageSync("utoken"),
        mobile: wx.getStorageSync("mobile"),
        loading: true,
        page: 1,
        chatList: []
      })
      this.getChat();
      this.getReplayCount();
    } else {
      app.globalData.previewImageFlag = true
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    if (app.globalData.previewImageFlag) {
      let that = this;
      setTimeout(function() {
        that.setData({
          chatList: []
        })
      }, 1000);
    } else {
      app.globalData.previewImageFlag = false
    }
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
    this.getReplayCount();
    this.data.page = 1;
    this.data.chatList = [];
    this.getChat();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.next) {
      this.data.page++;
      this.getChat();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})