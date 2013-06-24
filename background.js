//监控页面请求
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name == 'Referer') {
                details.requestHeaders[i].value = 'http://baike.baidu.com';
                //  details.requestHeaders.splice(i, 1);
                break;
            }
        }
        return {requestHeaders:details.requestHeaders};
    }, { urls:["http://imgsrc.baidu.com/baike/pic/item/*", "http://baike.baidu.com/*"]}, ["requestHeaders", "blocking"]);


chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    var enableBaike = true;
    var enableSimple = false;
    if (localStorage["enableBaike"] == 'false') {
        enableBaike = false;
    }
    if (localStorage["enableSimple"] == 'true') {
        enableSimple = true;
    }
    switch (request.type) {
        case 'getOptions':
            sendResponse({enableBaike:enableBaike,enableSimple:enableSimple});
            break;
        case 'setOptions':
            if( typeof request.enableBaike != 'undefined'){
              localStorage["enableBaike"] = request.enableBaike;  
                setIconStatus(enableBaike)
            } 
            if( typeof request.enableSimple != 'undefined'){
                localStorage["enableSimple"] = request.enableSimple;
            }
    }
});

function setIconStatus() {
    if (localStorage["enableBaike"] == 'false') {
        chrome.browserAction.setBadgeBackgroundColor({
            color:[255, 0, 0, 100]
        });
        chrome.browserAction.setBadgeText({
            text:"-"
        });
    } else {
        chrome.browserAction.setBadgeText({
            text:""
        });
    }
}

setIconStatus();

//添加右键查询功能
var id = chrome.contextMenus.create({"title":"查看百度百科词条:“%s”", "contexts":["selection", "link", "editable"],
    "onclick":function (e) {
        console.log(e);
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, {type: "getBaikeInfo",selectionText:e.selectionText}, function(response) {
            });
        });

    }});



