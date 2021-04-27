const {apiDomain, apiProHost} = require('./env');

//
// GET 请求
const GET = function(path, params, configs) {
  return request('GET', path, params, configs);
}

//
// POST 请求
const POST = function(path, params, configs) {
  return request('POST', path, params, configs);
}

//
// HTTP 请求
const request = function(type, path, params, configs) {
  let APP = getApp();
  let apiToken = APP ? APP.globalData.apiToken : '';

  if (configs === undefined) {
    configs = {};
  }

  return new Promise(function(resolve, reject) {
    wx.request({
      method: type,
      header: {
        'Authorization': 'Bearer ' + apiToken,
      },
      url: makeApiPath(path),
      data: params,
      success: function(res) {
        if (wxRequestIsOk(res)) {
          resolve(res.data, res);
          console.debug('[HTTP-' + type + '] ' + path + ' successful', res);
        } else {
          reject(res.data, res);
          console.error('[HTTP-' + type + '] ' + path + ' fail', res);
        }
      },
      fail: function(res) {
        if (configs.showRequestFailModal != false) {
          wx.showModal({
            title: '网络请求失败',
            content: res.errMsg,
            showCancel: false,
          });
        }

        reject('WX.REQUEST FAIL', res);
        console.error('[HTTP-' + type + '] ' + path + ' wx.request fail', res);
      },
    });
  });
};

//
// wx.request 请求是否成功
const wxRequestIsOk = function(res) {
  return res.statusCode.toString()[0] == 2;
};

//
// HTTP 请求
const httpRequest = function(type, path, params, successCallback, failCallback, requestFailCallback) {
  let APP = getApp();
  let apiToken = APP ? APP.globalData.apiToken : '';

  wx.request({
    method: type,
    header: {
      'Authorization': 'Bearer ' + apiToken,
    },
    url: makeApiPath(path),
    data: params,
    success: function(res) {
      if (httpSuccessful(res)) {
        console.debug('[HTTP-' + type + '] ' + path + ' successful', res);
        if (successCallback) successCallback(res.data.data, res);
      } else {
        console.error('[HTTP-' + type + '] ' + path + ' fail', res);
        if (failCallback) failCallback(res);
      }
    },
    fail: function(res) {
      console.error('[HTTP-' + type + '] ' + path + ' wx.request fail', res);
      if (requestFailCallback) requestFailCallback(res);
    },
  });
};

//
// HTTP GET 请求
const httpGet = function(path, params, successCallback, failCallback, requestFailCallback) {
  httpRequest('GET', path, params, successCallback, failCallback, requestFailCallback);
};

//
// HTTP POST 请求
const httpPost = function(path, params, successCallback, failCallback, requestFailCallback) {
  httpRequest('POST', path, params, successCallback, failCallback, requestFailCallback);
};

/**
 * 上传文件
 */
const uploadFile = function(path, filePath, params, successCallback, failCallback, requestFailCallback) {
  let APP = getApp();

  // API 返回失败回调
  if (!failCallback) failCallback = function(res) {};

  // 请求异常回调
  if (!requestFailCallback) {
    requestFailCallback = function(res) {
      console.error('UploadFile fail', filePath, res);
    };
  }

  wx.uploadFile({
    header: {
      'Authorization': 'Bearer ' + APP.globalData.apiToken
    },
    url: makeApiPath(path),
    filePath: filePath,
    name: 'file',
    formData: params,
    success: function(res) {
      if (httpSuccessful(res)) {
        res.data = JSON.parse(res.data);

        console.debug('[UploadFile] ' + filePath + ' successful', res);
        successCallback(res.data.data, res);
      } else {
        console.error('[UploadFile] ' + filePath + ' fail', res);
        failCallback(res);
      }
    },
    fail: requestFailCallback,
  });
}

//
// 生成 Api URL
const makeApiPath = function(path) {
  return apiProHost + '/' + path;
};

//
// 生成 Web Page URL
const makeWebPagePath = function(path) {
  let APP = getApp();

  return apiDomain + '/' + path + '?token=' + APP.globalData.apiToken;
};

//
// HTTP 请求是否成功
const httpSuccessful = function(res) {
  return res.statusCode.toString()[0] == 2;
};

//
// module exports
module.exports = {
  makeApiPath, makeWebPagePath, httpSuccessful,
  httpGet, httpPost, httpRequest,
  GET, POST,
  uploadFile,
};
