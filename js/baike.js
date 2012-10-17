(function() {
	var text = "";// 选重时的文本
	// 绑定选中的事件
	document.addEventListener('mouseup', function(event) {
		var sel = window.getSelection();
		if (sel.type == "Range") {
			text = sel.getRangeAt(0).toString();
			if (text.length > 0 && text.length < 15) {
				popover.style.left = event.pageX + 5 + 'px';
				popover.style.top = event.pageY + 10 + 'px';
				popover.style.display = "";
				return;
			}
		}
		popover.style.display = "none";
	});

	var popover = document.createElement('a');
	popover.className = "btn-baike";
	popover.style.position = 'absolute';
	popover.style.display = 'none';
	popover.innerHTML = '百科一下';
	document.body.appendChild(popover);

	popover.onmouseup = function(event) {
		event.stopPropagation()
	};

	popover.onclick = function() {
		ajax(
				'http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=' + encodeURIComponent(text) + '&bk_length=600',
				function(data) {
					var json = JSON.parse(data);
					if (json.image == 'http:\/\/imgsrc.baidu.com\/baike\/pic\/item\/.jpg') {
						json.image = null;
					}
					// 关闭所有的对话框
					var list = art.dialog.list;
					for ( var i in list) {
						list[i].close();
					}
					;
					if (json['error_code'] == 20000) {
						showNoResultDialog(json);
					} else {
						showResultDialog(json);
					}
				});
	}
	function showResultDialog(json) {
		var html = baidu.template(tpl, json);
		json['abstract'] = json['abstract'].replace(/(\/view\/\d+)/,
				'http://baike.baidu.com$1');
		art.dialog( {
			title : '数据来自百度百科',
			show : true,
			fixed : true,
			width : 400,
			height : 300,
			resize : true,
			padding : 0,
			content : html,
			zIndex : 10000,
			path : chrome.extension.getURL("js"),
			close : function() {
				popover.style.display = 'none';
			},
			init : function() {
				// $(this.content()).find("a").attr("target","_blank");
		}
		});
	}
	function showNoResultDialog() {
		var html = "<p>没有查到相关词条名呢！</p>"
		var dailog = art.dialog( {
			title : '数据来自百度百科',
			show : true,
			fixed : true,
			width : 200,
			height : 100,
			resize : false,
			icon : 'face-sad',
			content : html,
			zIndex : 10000,
			path : chrome.extension.getURL("js"),
			close : function() {
				popover.style.display = 'none';
			}
		});
		dailog.title('3秒后自动关闭').time(3);
	}

	var tpl = '<div class="baike-content">\
    <%if (image){ %><a href="http://baike.baidu.com/view/<%=id%>" class="img-a" target="_blank" title="<%=title%>"> <img src="<%=image%>" width="200" title="<%=title%>" /></a><% }%>\
     <p><%-abstract%></p>\
     <ul class="baike-category"><%for(var i = 0 ;i < catalog.length ;i++){%>\
        <li><%-catalog[i]%></li>\
        <%}%>\
    </ul>\
<div style="clear: both;padding:6px;"><font size="3" style="font-size:8px;">▶</font><a href="http://www.baidu.com/s?wd=<%=title%>" target="_blank">百度一下</a>&nbsp;&nbsp;<font size="3" style="font-size:8px;">▶</font><a href="http://tieba.baidu.com/f?kw=<%=title%>&ie=utf-8" target="_blank">进入贴吧</a>\
    </div></div>\
     <div class="baike-go"><a style="margin:0 auto" class="btn-baike" href="http://baike.baidu.com/view/<%=id%>" target="_blank">查看百科词条：《<%=title%>》</a></div>\
    ';

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
})()
