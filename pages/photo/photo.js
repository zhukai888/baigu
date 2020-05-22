const util = require('../../utils/util.js')

Page({

  data: {
    imageList: [],
    title: "",
    imgs: "",
    submitFlag: true //防重
  },

  /** title赋值 */
  giveTitle(e) {
    this.setData({
      title: e.detail.value
    })
  },

  /** 预览图片 */
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.imageList
    })
  },

  /**选择图片 */
  changPic(e) {
    var that = this;
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        that.data.imageList = that.data.imageList.concat(res.tempFilePaths);
        that.setData({
          imageList: that.data.imageList
        })
      }
    })
  },

  /** 上传路径 */
  uploadDIY(filePaths, i) {
    let that = this;
    wx.uploadFile({
      url: util.api + '/wx/upfile/',
      filePath: filePaths[i],
      name: 'file',
      formData: {},
      success: (res => {
        res.data = JSON.parse(res.data)
        if (res.data.status.code == 1) {
          that.data.imgs = that.data.imgs.length > 0 ? that.data.imgs + "##" + res.data.data : res.data.data
        }
      }),
      fail: (err) => {
        util.failToast("上传图片过程出现错误")
      },
      complete: () => {
        i++;
        if (i < filePaths.length) {
          that.uploadDIY(filePaths, i);
        } else {
          util.WxRequest({
            url: util.api + "/chat/",
            data: {
              title: that.data.title,
              imgs: that.data.imgs
            },
            method: "POST"
          }).then(res => {
            if (res.data.status.code == 2001) {
              util.sucToast("发布成功")
              wx.redirectTo({
                url: '/pages/release/release',
              })
            }
            setTimeout(e=>{
              that.data.submitFlag = true;
            },1500)
          }).catch(err => {
            util.failToast("发布失败");
            console.log(err)
          });
        }
      },
    });
  },

  /** 提交 */
  submit() {
    let that = this;
    if (!that.data.submitFlag) {
      return;
    }
    if (that.data.title.length == 0) {
      util.failToast("内容不能为空");
      return;
    }
    that.data.submitFlag = false;
    that.uploadDIY(that.data.imageList, 0);
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