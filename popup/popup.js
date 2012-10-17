$(function() {
		function log( message ) {
			$( "<div/>" ).text( message ).prependTo( "#log" );
			$( "#log" ).scrollTop( 0 );
		}
        window.baidu = window.baidu || {};
        window.baidu.sug = function(data){
              	response( $.map( data.s, function( item ) {
							return {
								label: item,
								value: item
							}
			}));
            document.body.style.height="300px";

        }
		$( "#searchbox" ).autocomplete({
			source: function( request, response ) {
                window.response = response;
                $.get("http://nssug.baidu.com/su", {
						prod: 'baike',
						wd: request.term
					},
                   function(data){
                        eval(data);
                   },'text');
			},
			minLength: 1,
			select: function( event, ui ) {
                window.open('http://baike.baidu.com/search/word?word='+ui.item.value+'&pic=1&sug=1&enc=utf8');
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
                 document.body.style.height="100px";
			}
		});
	});