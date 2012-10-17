//监控页面请求
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name == 'Referer') {
        details.requestHeaders[i].value = 'http://baike.baidu.com';
       //  details.requestHeaders.splice(i, 1);
        break;
      }
    }
    return {requestHeaders: details.requestHeaders};
  }, { urls: ["http://imgsrc.baidu.com/baike/pic/item/*","http://*.baidu.com/*"]},["requestHeaders","blocking"]);