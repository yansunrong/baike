/**
 * @author yansunrong
 * @date   2012-11-3
 */
//初始化信息框
var baikebox = document.createElement('div');
baikebox.className = "baike-box";
baikebox.id = "baike-box";
baikebox.style.position = 'absolute';
baikebox.style.display = 'none';
var mainHTML = '<div class="baike-hd" id="baike-box-top"><a href="http://baike.baidu.com"><img width = "16" src="' + chrome.extension.getURL("icon.png") + '"/></a> <a target="_blank" href="#" class="baike-view-link" id="baike-box-title"  titile="查看详细解释">百科词条</a><a class="baike-close" id="baike-close">×</a>\
<a class="baike-more baike-view-link" id="baike-link-detail">详细</a></div>\
		<div class="baike-no" id="baike-baidu">\
		</div>\
		<div class="baike-bd">\
				<div class="baike-tab"><span>基本解释</span></div>\
				<div class="baike-detail" id="baike-detail">\
				<div class="img-box" id="baike-image-box"><a class="baike-view-link"><img id="baike-image" width="100"/></a></div>\
				<div id="baike-info"></div>\
				</div>\
				<div class="baike-tab"><span>更多解释</span></div>\
				<ul class="baike-category" id="baike-category"">\
				</ul>\
  </div>';
baikebox.innerHTML = mainHTML;
document.documentElement.appendChild(baikebox);
baikebox.addEventListener("mouseup", function (e) {
    e.stopPropagation();
})
//关闭浮层的功能
document.getElementById('baike-close').onclick = function () {
    baikebox.style.display = "none";
}

//手动添加drag的功能。
var box = document.getElementById("baike-box-top");
box.onmousedown = dragDown;
box.onmouseup = dragUp;
document.addEventListener("mousemove", dragMove);
var isDrag = false;
var px = 0;
var py = 0;
function dragMove(e) {
    if (isDrag) {
        baikebox.style.pixelLeft = px + e.x;
        baikebox.style.pixelTop = py + e.y;
    }
}
function dragDown(e) {
    var oDiv = baikebox;
    px = oDiv.style.pixelLeft - e.x;
    py = oDiv.style.pixelTop - e.y;
    isDrag = true;
}
function dragUp(e) {
    isDrag = false;
    e.stopPropagation();
}
var text = "";// 选重时的文本
// 绑定选中的事件
document.addEventListener('mouseup', function (event) {
    checkEnabled(function () {
        var sel = window.getSelection();
        if (sel.type == "Range") {
            text = sel.getRangeAt(0).toString();
            if (text.length > 0 && text.length < 15) {
                baikebox.style.left = event.pageX + 5 + 'px';
                baikebox.style.top = event.pageY + 10 + 'px';
                getBaikeInfo();
                return;
            }
        }
        baikebox.style.display = "none";
    });

});
function $(id) {
    return document.getElementById(id);
}
//异步请求百科的API，拿到相关数据，并展现
function getBaikeInfo() {
    ajax(
        'http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=' + encodeURIComponent(text) + '&bk_length=600',
        function (data) {
            var json = JSON.parse(data);
            if (json['error_code'] == 20000) {
                baikebox.className = "baike-box baike-box-noresult";
                $('baike-box-title').innerHTML = '来自百度百科信息';
                $('baike-box-title').href = "javascript:void(0)";
                $('baike-link-detail').href = "http://baike.baidu.com";
                $('baike-baidu').innerHTML = '百度百科没有查到：<strong> ' + text + ' </strong><br/>' +
                    '<a href="http://www.baidu.com/s?wd=' + text + '">百度一下:<b>  ' + text + ' </b></a>';
            } else {
                baikebox.className = "baike-box baike-box-result";
                if (json.image == 'http:\/\/imgsrc.baidu.com\/baike\/pic\/item\/.jpg') {
                    json.image = null;
                } else {
                    $('baike-image').src = json.image;
                }
                $('baike-image-box').style.display = json.image == null ? "none" : "";
                json['abstract'] = json['abstract'].replace(/(\/view\/\d+)/g, 'http://baike.baidu.com$1');
                var links = document.querySelectorAll("#baike-box .baike-view-link");
                for (var i = 0; i < links.length; i++) {
                    links[i].href = "http://baike.baidu.com/view/" + json.id;
                }
                $('baike-info').innerHTML = json.abstract;
                var cates = [];
                for (var i = 0; i < json.catalog.length; i++) {
                    cates.push('<li>' + json.catalog[i] + '</li>');
                }
                $('baike-category').innerHTML = cates.join('');
                $('baike-box-title').innerHTML = '百科词条：' + json.title;
                var links = document.querySelectorAll("#baike-box a");
                for (var i = 0; i < links.length; i++) {
                    links[i].target = "_blank";
                }
            }
            baikebox.style.display = "";
        });
}


function ajax(url, suc) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = state_Change;
    xmlhttp.open("GET", url, true);
    xmlhttp.send(null);
    function state_Change() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            suc && suc(xmlhttp.responseText);
        }
    }
}

function checkEnabled(fn) {
    chrome.extension.sendRequest(
        {type:"getOptions"},
        function (response) {
            if (response.enableBaike) {
                fn();
            }
        })
}

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "getBaikeInfo") {
            text = request.selectionText;
            baikebox.style.left = mousePos.x + 5 + 'px';
            baikebox.style.top = mousePos.y + 10 + 'px';
            getBaikeInfo();
            mousePos = null;
        }
    });

//右键的时候记录一下位置
var mousePos = null;
document.addEventListener("mousedown", function (e) {
    if (e.button == 2) {
        mousePos = {
            x:event.pageX,
            y:event.pageY
        }
    }
});

//显示精简版
function showSimple(){
    //制取百科的界面
    var main = document.querySelectorAll('.main-body');
    if(main.length > 0){
        main[0].className+=' modal';
        var mask = '<div id="__nightingale_view_cover" style="width: 100%; height: 100%; -webkit-transition: -webkit-transform 10s ease-in-out; transition: -webkit-transform 10s ease-in-out; position: fixed !important; left: 0px !important; bottom: 0px !important; overflow: hidden !important; background-color: rgb(0, 0, 0) !important; pointer-events: none !important; z-index: 1000; opacity: 0.85; background-position: initial initial !important; background-repeat: initial initial !important;"></div>';
        var maskDiv = document.createElement('div');
        maskDiv.innerHTML  =  mask;
        document.documentElement.appendChild(maskDiv);
    }
    
}


chrome.extension.sendRequest(
        {type:"getOptions"},
        function (response) {
            if (response.enableSimple) {
                showSimple();
            }
})
