const util = require('../../utils/util.js')
const app = getApp();
Page({

  data: {
    cdn_url: util.cdn_url,
    chatList: [],
    page: 1,
    next: true,
    inputIndex: "",
    inputIdx: "",
    replayName: "",
    height: "0px",
    inputShadow: false,
    tchat: "",
    ruser: {},
    replayValue: "",
    page_size: 10,
    nick_name: "",
    loading: true,
    lev: false //false表示非二级回复，true表示二级回复
  },

  /** 点击评论数量评论 */
  talkShadow(e) {
    this.data.lev = true;
    this.data.tchat = e.currentTarget.dataset.tchat;
    this.data.inputIndex = e.currentTarget.dataset.index;
    this.setData({
      replayValue: '',
      replayName: '',
      inputShadow: true
    })
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

  /** 回复输入框调动 */
  changeShadow(e) {
    this.data.lev = false;
    this.data.inputIndex = e.currentTarget.dataset.index;
    this.data.inputIdx = e.currentTarget.dataset.idx;
    this.data.tchat = e.currentTarget.dataset.tchat;
    this.data.ruser = e.currentTarget.dataset.ruser;
    this.setData({
      replayName: e.currentTarget.dataset.ruser.nick_name,
      replayValue: '',
      inputShadow: true
    })
  },

  /** 回复输入框关闭 */
  closeShadow() {
    this.setData({
      inputShadow: false,
      height:0
    })
  },

  /** 输入框聚焦事件 */
  focus(e) {
    this.setData({
      height: e.detail.height + "px"
    })
  },

  /**解决遮罩层冲突 */
  returnNull() {
    return;
  },

  /** 绑定回复文本 */
  bindReplayValue(e) {
    this.setData({
      replayValue: e.detail.value
    })
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

  /** 跳转到发布页面 */
  navTo() {
    wx.navigateTo({
      url: '/pages/photo/photo',
    })
  },

  /** 获取社群论坛列表 */
  getChat() {
    let that = this;
    util.WxRequest({
      url: util.api + "/chat/?my=1",
      data: {
        page: that.data.page,
        page_size: this.data.page_size
      },
      method: "GET"
    }).then(res => {
      if (res.statusCode == 403) {
        wx.reLaunch({
          url: '/pages/member/member?type=1'
        })
      } else if (res.data.status == 1) {
        res.data.results.forEach(e => {
          e.showAll = false;
          e.value = "";
          e.talkCount = 0;
          e.sub_chat.forEach(chat => {
            e.talkCount++;
            chat.sub_tchat.forEach(tchat => {
              e.talkCount++;
            })
          })
        })
        that.data.chatList = that.data.chatList.concat(res.data.results)
        that.data.next = res.data.next == null ? false : true
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

  /** 评论/回复评论 */
  confirmTalk(e) {
    let that = this;
    if (that.data.replayValue.length == 0) {
      return;
    }
    let data = null;
    if (that.data.lev) { //二级回复
      data = {
        chat: that.data.tchat,
        title: that.data.replayValue,
      }
    } else {
      data = {
        tchat: that.data.tchat,
        title: that.data.replayValue,
        ruser: that.data.ruser.id
      }
    }
    util.WxRequest({
      url: util.api + "/rechat/",
      data: data,
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        that.data.chatList[that.data.inputIndex].talkCount++;
        util.sucToast("评论成功");
        if (!that.data.lev) {
          that.data.chatList[that.data.inputIndex].sub_chat[that.data.inputIdx].sub_tchat.push({
            user: {
              nick_name: res.data.data.user_name,
              user_font: wx.getStorageSync("user_font")
            },
            ruser: that.data.ruser,
            add_time: res.data.data.add_time,
            chat: res.data.data.chat,
            title: res.data.data.title,
            ruser: that.data.ruser,
          })
        } else {
          that.data.chatList[that.data.inputIndex].sub_chat.push({
            user: {
              nick_name: res.data.data.user_name,
              user_font: wx.getStorageSync("user_font")
            },
            // ruser: that.data.ruser,
            add_time: res.data.data.add_time,
            chat: res.data.data.chat,
            title: res.data.data.title,
            sub_tchat: []
          })
        }

        that.closeShadow();
      }
      that.setData({
        chatList: that.data.chatList
      })
    }).catch(err => {
      util.failToast("评论失败");
      console.log(err)
    });
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
    if (app.globalData.previewImageFlag) {
      this.setData({
        nick_name: wx.getStorageSync("nick_name"),
        chatList: [],
        page: 1,
        loading: true
      })
      this.getChat();
    } else {
      app.globalData.previewImageFlag = true
    }
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