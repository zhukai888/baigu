const util = require('../../utils/util.js')

Page({

  data: {
    cdn_url: util.cdn_url,
    chatObj: [],
    inputIdx: "",
    replayName: "",
    replayValue: "",
    height: "0px",
    inputShadow: false,
    tchat: "",
    ruser: {},
    loadinig: true,
    nick_name: '',
    lev: false //false表示非二级回复，true表示二级回复
  },

  /** 绑定回复文本 */
  bindReplayValue(e) {
    this.setData({
      replayValue: e.detail.value
    })
  },

  /** 输入框聚焦事件 */
  focus(e) {
    this.setData({
      height: e.detail.height + "px"
    })
  },

  /** 点赞 */
  changLove() {
    let that = this;
    util.WxRequest({
      url: util.api + "/chatfav/",
      data: {
        chat: that.data.chatObj.id
      },
      method: "Post"
    }).then(res => {
      if (res.data.status.code == 2001) {
        if (that.data.chatObj.is_fav == 0) {
          that.data.chatObj.is_fav = 1;
          that.data.chatObj.fav_nums++;
        } else {
          that.data.chatObj.is_fav = 0;
          that.data.chatObj.fav_nums--;
        }
        that.setData({
          chatObj: that.data.chatObj
        })
      }
    }).catch(err => {
      util.failToast("操作失败");
      console.log(err)
    });
  },
  /**点击评论数量品论 */
  talkShadow() {
    this.data.lev = true;
    this.setData({
      replayValue: '',
      replayName: '',
      inputShadow: true
    })
  },

  /** 回复输入框调动 */
  changeShadow(e) {
    this.data.lev = false;
    this.data.inputIdx = e.currentTarget.dataset.idx;
    this.data.tchat = e.currentTarget.dataset.tchat;
    this.data.ruser = e.currentTarget.dataset.ruser;
    this.setData({
      replayName: e.currentTarget.dataset.ruser.nick_name,
      replayValue: [],
      inputShadow: true
    })
  },

  /**解决遮罩层冲突 */
  returnNull() {
    return;
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
        that.data.chatObj.talkCount++
          util.sucToast("评论成功");
        if (!that.data.lev) {
          that.data.chatObj.sub_chat[that.data.inputIdx].sub_tchat.push({
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
          that.data.chatObj.sub_chat.push({
            user: {
              nick_name: res.data.data.user_name,
              user_font: wx.getStorageSync("user_font")
            },
            sub_tchat: [],
            add_time: res.data.data.add_time,
            chat: res.data.data.chat,
            title: res.data.data.title,
          })
        }
        that.closeShadow();
      }
      that.setData({
        chatObj: that.data.chatObj
      })
    }).catch(err => {
      util.failToast("评论失败");
      console.log(err)
    });
  },

  /** 回复输入框关闭 */
  closeShadow() {
    this.setData({
      inputIdx: "",
      tchat: "",
      ruser: {},
      replayName: "",
      replayValue: "",
      inputShadow: false,
      height:0
    })
  },

  /** 预览图片 */
  previewImage: function(e) {
    let urls = [];
    this.data.chatObj.imgs.forEach(e=>{
      urls.push(this.data.cdn_url + e)
    })
    wx.previewImage({
      current: this.data.cdn_url + e.currentTarget.dataset.src,
      urls: urls
    })
  },

  /** 获取帖子详情 */
  getPost(id) {
    let that = this;
    util.WxRequest({
      url: util.api + "/chat/" + id + "/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        res.data.data.talkCount = 0;
        res.data.data.sub_chat.forEach(chat => {
          res.data.data.talkCount++;
          chat.sub_tchat.forEach(tchat => {
            res.data.data.talkCount++;
          })
        })
        that.setData({
          chatObj: res.data.data
        })
      }
      if (that.data.loading) {
        this.setData({
          loading: false
        })
      }
    }).catch(err => {
      util.failToast("获取失败");
      console.log(err)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let nick_name = wx.getStorageSync("nick_name")
    this.setData({
      loading: true,
      nick_name: nick_name
    })
    if (options.id) {
      this.getPost(options.id)
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