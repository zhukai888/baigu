const app = getApp();

function request(obj) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: obj.url,
      data: obj.data,
      method: obj.method,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Token ' + obj.token
      },
      success(res) {
        if (res.statusCode == 401) {
          wx.clearStorageSync();
          WxRequest(obj);
        } else {
          resolve(res)
        }
      },
      fail(err) {
        console.log("请求错误");
        reject(err);
      },
      complete(res) {
        wx.hideLoading()
      }
    })
  })
}


function WxRequest(obj) {
  wx.showLoading({
    title: "正在加载···"
  })
  return new Promise((resolve, reject) => {
    let utoken = wx.getStorageSync('utoken');
    if (!utoken || utoken == "undefined") {
      if (!app.globalData.loginFlag) {
        app.globalData.loginFlag = true;
        wx.navigateTo({
          url: '/pages/toLogin/toLogin',
        })
      }
    } else {
      obj.token = utoken;
      request(obj).then(res => {
        resolve(res);
      })
    }
  })
}


function sucToast(msg) {
  wx.showToast({
    title: msg,
    icon: "none",
    duration: 1500
  })
}

function failToast(msg) {
  wx.showToast({
    title: msg,
    icon: "none",
    duration: 1500
  })
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var cdn_url = "https://api.zbaigu.com";
var api = "https://api.zbaigu.com";
var appid = "wx71231d014dbe202a";
var secret = "90a1252e15848d67ca21106680436982"

module.exports = {
  WxRequest: WxRequest,
  sucToast: sucToast,
  failToast: failToast,
  formatTime: formatTime,
  cdn_url: cdn_url,
  api:api,
  appid: appid,
  secret: secret
}