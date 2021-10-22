const {apiDomain, apiProHost} = require('./env');
const httpTimeout = 1000 * 10;

/**
 * GET 请求
 */
const GET = function(path, params, configs) {
  return request('GET', path, params, configs);
}

/**
 * POST 请求
 */
const POST = function(path, params, configs) {
  return request('POST', path, params, configs);
}

/**
 * HTTP 请求
 */
const request = function(type, path, params, configs) {
  let APP = getApp();
  let apiToken = APP ? APP.globalData.apiToken : '';

  // configs
  let defaultConfigs = {showRequestFailModal: true};
  if (configs === undefined) configs = {};
  configs = Object.assign(defaultConfigs, configs);

  return new Promise(function(resolve, reject) {
    wx.request({
      method: type,
      header: {
        'Authorization': 'Bearer ' + apiToken,
        'Accept': 'application/json',
      },
      url: makeApiPath(path),
      data: params,
      timeout: httpTimeout,
      success: function(res) {
        if (httpRequestIsOk(res)) {
          if (typeof res.data === 'object') {
            res.data.statusCode = res.statusCode;
          } else {
            res.data = {statusCode: res.statusCode};
          }

          resolve(res.data);
          console.debug('[HTTP-' + type + '][' + res.statusCode + ']: /' + path, res);
        } else {
          if (configs.showRequestFailModal) {
            wx.showModal({
              title: '发生错误',
              content: res.data.message,
              showCancel: false,
            });
          }

          reject(res);
          console.error('[HTTP-' + type + '][' + res.statusCode + ']: /' + path, res);
        }
      },
      fail: function(res) {
        APP.showNotify('网络请求失败', 'danger');

        if (configs.showRequestFailModal) {
          wx.showModal({
            title: '网络请求失败',
            content: res.errMsg,          // TODO: 重定义，把 res.errMsg 转为本地语言
            showCancel: false,
          });
        }

        reject(res);
        console.error('[HTTP-' + type + '][WX.REQUEST-FAIL]: /' + path, res);
      },
    });
  });
};

/**
 * 上传文件
 */
const uploadFile = function(apiPath, filePath, params, configs) {
  let APP = getApp();
  let apiToken = APP ? APP.globalData.apiToken : '';

  // configs
  let defaultConfigs = {showRequestFailModal: true};
  if (configs === undefined) configs = {};
  configs = Object.assign(defaultConfigs, configs);

  return new Promise(function(resolve, reject) {
    wx.uploadFile({
      header: {
        'Authorization': 'Bearer ' + apiToken,
      },
      url: makeApiPath(apiPath),
      filePath: filePath,
      name: 'file',
      formData: params,
      success: function(res) {
        res.data = JSON.parse(res.data);

        if (httpRequestIsOk(res)) {
          resolve(res.data);
          console.debug('[HTTP-UploadFile] ' + filePath + ' successful', res);
        } else {
          reject(res);
          console.error('[HTTP-UploadFile] ' + filePath + ' fail', res);
        }
      },
      fail: function(res) {
        APP.showNotify('网络请求失败', 'danger');

        if (configs.showRequestFailModal) {
          wx.showModal({
            title: '网络请求失败',
            content: res.errMsg,
            showCancel: false,
          });
        }

        reject(res);
        console.error('[HTTP-UploadFile] ' + apiPath + ' wx.uploadFile fail', res);
      },
    });
  });
}

/**
 * 生成 Api URL
 */
const makeApiPath = function(path) {
  return apiProHost + '/' + path;
};

/**
 * 生成 Web Page URL
 */
const makeWebPagePath = function(path) {
  let APP = getApp();

  return apiDomain + '/' + path + '?token=' + APP.globalData.apiToken;
};

/**
 * 请求是否成功
 */
const httpRequestIsOk = function(res) {
  return res.statusCode.toString()[0] == 2;
};

/**
 * wx.request 是否成功
 */
const wxRequestIsOk = function(res) {
  if (res.errMsg === 'request:ok') return true;
  return false;
}

/**
 * 获取请求失败的返回消息
 */
const getRequestFailMessage = function(res) {
  return (wxRequestIsOk(res)) ? res.data.message : res.errMsg;
}

//
// module exports
module.exports = {
  makeApiPath, makeWebPagePath,
  httpRequestIsOk, wxRequestIsOk, getRequestFailMessage,
  GET, POST, uploadFile,
};
