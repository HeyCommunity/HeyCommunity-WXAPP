const HTTP = require('../../../../utils/http.js');

//
// 点赞处理
function thumbHandler(event, entity) {
  if (getApp().needAuth()) return;

  let params = {
    entity_id: event.currentTarget.dataset.entityId,
    entity_class: event.currentTarget.dataset.entityClass,
    type: event.currentTarget.dataset.type,
    value: event.currentTarget.dataset.value,
  };

  return new Promise(function(resolve, reject) {
    thumbRequest(params).then(function(result) {
      let message;

      if (result.statusCode === 201 || result.statusCode === 200) {
        message = '点赞成功';
        entity.i_have_thumb_up = true;
        entity.thumb_up_num += 1;

        wx.showToast({title: message});
      } else if (result.statusCode === 202) {
        message = '点赞已取消';
        entity.i_have_thumb_up = false;
        entity.thumb_up_num -= 1;

        wx.showToast({title: message, icon: 'none'});
      }

      // if (message) wx.showToast({title: message});

      return resolve(result);
    }).catch(function(res) {
      reject(res);
    });
  });
}

//
// 点赞 API 请求
function thumbRequest(params) {
  let apiPath = 'thumbs';

  return new Promise(function(resolve, reject) {
    HTTP.POST(apiPath, params).then(function(result) {
      resolve(result);
    }).catch(function(res) {
      wx.showModal({
        title: params.value ? '点赞失败' : '取消点赞失败',
        content: HTTP.wxRequestIsOk(res) ? res.data.message : res.errMsg,
        showCancel: false,
      });

      reject(res);
    });
  });
}

function thumbHandler2(event, pageThis, entityKey) {
  let newData = {};
  newData[entityKey] = {content_preview: 'hihi'};

  pageThis.setData(newData);
}

//
// module exports
module.exports = {
  thumbHandler,
  thumbHandler2,
}
