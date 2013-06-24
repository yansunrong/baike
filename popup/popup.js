$(function () {
    $.getScript('js/jquery-ui-1.10.3.custom.min.js', function () {

        window.baidu = window.baidu || {};
        window.baidu.sug = function (data) {
            response($.map(data.s, function (item) {
                return {
                    label:item,
                    value:item
                }
            }));
            document.body.style.height = 90 + 24 * data.s.length + "px";

        }
        $("#searchbox").autocomplete({
            source:function (request, response) {
                window.response = response;
                $.get("http://nssug.baidu.com/su", {
                        prod:'baike',
                        wd:request.term
                    },
                    function (data) {
                        eval(data);
                    }, 'text');
            },
            minLength:1,
            select:function (event, ui) {
                window.open('http://baike.baidu.com/search/word?word=' + ui.item.value + '&pic=1&sug=1&enc=utf8');
            },
            open:function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close:function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
                document.body.style.height = "100px";
            }
        });
    })
    var checkbox = $('#baike_disable');
    var simpleCheckbox = $('#baike_simple_disable');
    chrome.extension.sendRequest(
        {type:"getOptions"},
        function (response) {
            if (response.enableBaike) {
                checkbox.attr("checked", true);
            }
            if (response.enableSimple) {
                simpleCheckbox.attr("checked", true);
            }
            
        })

    checkbox.change(function() {
        chrome.extension.sendRequest(
            {type:"setOptions",enableBaike:(checkbox.attr("checked") == "checked")?true:false},
            function (response) {
            })
    });

    simpleCheckbox.change(function() {
        chrome.extension.sendRequest(
            {type:"setOptions",enableSimple:(simpleCheckbox.attr("checked") == "checked")?true:false},
            function (response) {
            })
    });

});
