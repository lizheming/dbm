//some function
function is(m) { return (Math.abs(m-6.5)-0.5) % 2 != 0 ? false : true; }

$('body').on('click', '#command span', function(e){
	var n = parseInt($(this).attr('class'));
	$('#command .click').removeClass('click');
	if(n != 0) {
		for(i=0;i<6;i++) $('#msh .'+i).css('display', 'none');
		$('#command .'+n).addClass('click');
		$('#msh .'+n).css('display', 'inline-table');
	} else {
		$('#command .0').addClass('click');
		for(i=0;i<6;i++) $('#msh .'+i).css('display', 'inline-table');
	}
});
//平均值
function av(total, month) {
	var average = total / 12, variance = 0; 
	$.each(month, function(i, item) {
		variance += (item - average) ^2;
	});
	variance = variance / 12;
	var p = (Math.abs(average^2-variance)/average^2) * 100;
	if(p<=30) return '每月看片量非常平均';
	else if(p>30 && p<=60) return '每月看片量数稍有不均';
	else if(p>60) return '每月看片量极度不均';
}

function arate(rate) {
	var t = 0, a = 0;
	$.each(rate, function(i, value) {
		t += i * value;
		a += value;
	});
	t = Math.round(t/a*10) / 10;
	s = '影片平均评分为'+t+'分，';
	if(t<3) s+= '看片口味颇易于常人啊！';
	else s+= '看片质量还是口以滴！';
	return s;
}
function mwatch(month) {
	var k, m=0;
	$.each(month, function(i,value) {
		if(value>m) {
			m=value;
			k=i;
		}
	});
	return k;
}
//add opt
$('.article .sort').append(
'<span class="gray-dot">·</span><a href="#" id="tj">电影统计</a>'
);
$('#wrapper').on('click', '#tj', function(e){
	$('.article .sort').append(
	'<span class="gray-dot">·</span>选择统计年份：<select id="year" value=""><option> - </option><option>2014</option><option>2013</option><option>2012</option><option>2011</option><option>2010</option><option>2009</option><option>2008</option></select>'
	);
});
$('#wrapper').on('change', '#year', function(e) {
	/* 显示预加载图标 */
	$('.paginator').html('');
	$('.grid-view').html('');
	/*
	$('.paginator').html('');
	$('.grid-view').html('<div class="spinner">'+
	  '<div class="spinner-container container1">'+
	    '<div class="circle1"></div>'+
	    '<div class="circle2"></div>'+
	    '<div class="circle3"></div>'+
	    '<div class="circle4"></div>'+
	  '</div>'+
	  '<div class="spinner-container container2">'+
	    '<div class="circle1"></div>'+
	    '<div class="circle2"></div>'+
	    '<div class="circle3"></div>'+
	    '<div class="circle4"></div>'+
	  '</div>'+
	  '<div class="spinner-container container3">'+
	    '<div class="circle1"></div>'+
	    '<div class="circle2"></div>'+
	    '<div class="circle3"></div>'+
	    '<div class="circle4"></div>'+
	  '</div>'+
	'</div><style type="text/css">.spinner{margin:100px auto;width:20px;height:20px;position:relative;zoom:2.5;}.container1 > div,.container2 > div,.container3 > div{width:6px;height:6px;background-color:#333;border-radius:100%;position:absolute;-webkit-animation:bouncedelay 1.2s infinite ease-in-out;animation:bouncedelay 1.2s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both;}.spinner .spinner-container{position:absolute;width:100%;height:100%;}.container2{-webkit-transform:rotateZ(45deg);transform:rotateZ(45deg);}.container3{-webkit-transform:rotateZ(90deg);transform:rotateZ(90deg);}.circle1{top:0;left:0;}.circle2{top:0;right:0;}.circle3{right:0;bottom:0;}.circle4{left:0;bottom:0;}.container2 .circle1{-webkit-animation-delay:-1.1s;animation-delay:-1.1s;}.container3 .circle1{-webkit-animation-delay:-1.0s;animation-delay:-1.0s;}.container1 .circle2{-webkit-animation-delay:-0.9s;animation-delay:-0.9s;}.container2 .circle2{-webkit-animation-delay:-0.8s;animation-delay:-0.8s;}.container3 .circle2{-webkit-animation-delay:-0.7s;animation-delay:-0.7s;}.container1 .circle3{-webkit-animation-delay:-0.6s;animation-delay:-0.6s;}.container2 .circle3{-webkit-animation-delay:-0.5s;animation-delay:-0.5s;}.container3 .circle3{-webkit-animation-delay:-0.4s;animation-delay:-0.4s;}.container1 .circle4{-webkit-animation-delay:-0.3s;animation-delay:-0.3s;}.container2 .circle4{-webkit-animation-delay:-0.2s;animation-delay:-0.2s;}.container3 .circle4{-webkit-animation-delay:-0.1s;animation-delay:-0.1s;}@-webkit-keyframes bouncedelay{0%,80%,100%{-webkit-transform:scale(0.0)}40%{-webkit-transform:scale(1.0)}}@keyframes bouncedelay{0%,80%,100%{transform:scale(0.0);-webkit-transform:scale(0.0);}40%{transform:scale(1.0);-webkit-transform:scale(1.0);}}</style>');
	*/
	/*导入数据进行加载*/
	y = $(this).val();
	u = String($('#db-usr-profile li a').last().attr('href').split('/').slice(-2,-1));
	n = String($('#db-usr-profile h1').text().match(/\(([0-9]+)\)/g)).slice(1,-1);
	m = new Array();
	w = 'http://movie.douban.com/people/'+u+'/collect?sort=time&rating=all&filter=all&mode=grid&start=';

	(function collect(i) {
	page = i/15 + 1;
	$('.grid-view').prepend('<p>正在准备加载第'+page+'页...</p>');
	$.ajax({
		url:w+i,
		type:'GET',
		dataType:'html',
		success: function(d) {
			$('.grid-view').prepend('<p>第'+page+'页加载成功！</p>');
			/* parse */
			$.each($('.item', d), function(j, item){
				var date = $('.date', item).html();
				if(parseInt(date.split('-')[0])==y) {
					var id = $('.nbg', item).attr('href').split('subject/')[1].split('/')[0];
					var img = 'http://iphoto.sinaapp.com/'+id+'.jpg';
					var title = $('.title em', item).html();

					if($('.date', item).prev().length > 0) var rate = parseInt($('.date', item).prev().attr('class').substring(6,7));
					else var rate = 0;
					
					var _des = $('.opt-ln', item).prev();
					if($('.date', _des).length == 0) var des = _des.html();
					else var des = '';
					console.log([id, title, img, date, rate, des]);
					m.push([id, title, img, date, rate, des]);
				}
			});	
			/* recursion */
			if( i<(n-15) ) {
				collect(i+15);
			} else {
				/* Do */
				$('.grid-view').prepend('数据加载完毕，请等待解析生成统计报告');
				/* Init */
        		var RATE = new Array(), 
        			MONTH = new Array(), 
        			DAY = new Array(), 
        			TOTAL = m.length, 
        			LI = '', 
        			CATEGORIES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

        		for(i=0;i<6;i++) RATE[i] = 0; //评分初始化
        		for(i=0;i<12;i++) {
            	    MONTH[i] = 0;
        	        DAY[i] = new Array();
               		if(i==0||i==2||i==4||i==6||i==7||i==9||i==11){var M=31;}else{var M=30;}
               		for(j=0;j<M;j++) {
                   		DAY[i][j] = 0; //天总量初始化
                	}
        		}
        
			    $.each(m, function(k, item){
			        RATE[item[4]] += 1;
			        EM = parseInt(item[3].split('-')[1])-1;
			        ED = parseInt(item[3].split('-')[2])-1;
			        MONTH[EM] += 1;
			        DAY[EM][ED] += 1;
			        LI += '<li class="'+item[4]+'">';
			        LI += '<a href="http://movie.douban.com/subject/'+item[0]+'" title="'+item[1]+'">';
			        LI += '<img src="'+item[2]+'" alt="'+item[1]+'" width="67px" height="97px" />';
			        LI += '</a></li>';
			    });

        		var maw = mwatch(MONTH), word =  y+'年我一共看了'+TOTAL+'部片儿，平均每月看片'+Math.round(TOTAL/12 * 10) / 10+'部，其中'+CATEGORIES[maw]+'看了'+MONTH[maw]+'部片儿，是我的年度最佳看片月。十二个月'+av(TOTAL, MONTH)+'，'+arate(RATE)+'#豆瓣电影统计工具#';
				$('.grid-view').html('<div id="column"></div><div id="column_2"></div><div id="pie"></div><div id="mc"></div><div id="command"></div><ul id="msh">'+LI+'</ul><div id="raw"><p style="background-color:#d9edf7;color:#3a87ad;padding:8px 35px 8px 14px;margin-bottom:18px;text-shadow: 0 1px 0 rgba(255,255,255,0.5);border:1px solid #bce8f1;-webkit-border-radius:4px;font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:13px;">'+word+'<a class="jiathis_button_douban" href="http://shuo.douban.com/!service/share?image=&href='+w+'&name='+$('title').html()+'&text='+word+'" target="_blank" style="float:right;">分享到豆瓣</a></p><p style="margin-top:50px;"><label>引用代码：</label></p><textarea style="height:600px;resize:vertical;width:100%;">'+LI+'</textarea></div>');
				$('#command').html('<span class="1">一星</span><span class="2">二星</span><span class="3">三星</span><span class="4">四星</span><span class="5">五星</span><span class="0">所有</span>');
		        $('#command').css({
	                'border-bottom': '1px solid #06F',
	                'margin-bottom': '10px',
	                'margin-top': '10px',
	                'padding': '10px 0 6px 0',
	                'font-size': '16px',
	                'text-shadow': '1px 1px 1px #FFF'
		        });
		        $('#command span').css({
	                'padding': '10px 20px'
		        });
		        $('#command span').hover(
	                function() {
                        $(this).css({
                            'cursor': 'pointer',
                            'border': '1px solid #06F',
                            'background': '#FFF',
                            'border-bottom': '1px solid #FFF'
                        });
	                },
	                function() {
                        $(this).css({
                            'border': 'none',
                            'backgrond': 'none',
                            'border-bottom': 'none'
                        });
	                }
		        );        
		        $('#command span.click').css({
        	        'cursor': 'pointer',
            	    'border': '1px solid #06F',
                	'background': '#FFF',
                	'border-bottom': '1px solid #FFF'
        		});
		        $('#msh').css({
		            'width': '100%',
		            'margin': '0'
		        });
		        $('#msh li').css({
		            'display':'inline-table',
		            'margin' : '3px'
		        });

       			//output chart
        		var chart,chart1,chart2,res=new Array();
       		 	var colors = Highcharts.getOptions().colors,name = '电影',m30 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],m31 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];        
		        //数据
		        for (i = 0; i < 12; i++) {
		            if(i==0||i==2||i==4||i==6||i==7||i==9||i==11){var _M=m31;}else{var _M=m30;}
		            res.push({y: MONTH[i],color: colors[0],drilldown: {name: CATEGORIES[i],categories: _M,data: DAY[i],color: colors[0]}});
		        }
		        function setChart(name, categories, data, color) {
		            chart.xAxis[0].setCategories(categories, false);
		            chart.series[0].remove(false);
		            chart.addSeries({
		                name: name,  
		                data: data,
		                color: color
		            },
		            false);
		            chart.redraw()
		        }
		        chart = new Highcharts.Chart({
		            chart: {
		                renderTo: 'column',
		                type: 'column'
		            },
		            title: {
		                text: y + '年你一共看过' + TOTAL + '部电影'
		            },
		            xAxis: {
		                categories: CATEGORIES
		            },
		            yAxis: {
		                title: {text: '数量（部）'}
		            },
		            plotOptions: {
		                column: {
		                    cursor: 'pointer',
		                    point: {
		                        events: {
		                            click: function() {
		                                var drilldown = this.drilldown;
		                                if (drilldown) {
		                                    setChart(drilldown.name, drilldown.categories, drilldown.data, drilldown.color)
		                                } else {
		                                    setChart(name, categories, res, colors[0])
		                                }
		                            }
		                        }
		                    },
		                    dataLabels: {
		                        enabled: true,
		                        formatter: function() {
		                            return this.y
		                        }
		                    }
		                }
		            },
		            tooltip: {
		                formatter: function() {
		                    var point = this.point,
		                    	s = this.x + ': ' + this.y + '部<br/>';
		                    s += point.drilldown ? '单击查看' + point.category + '详情' : '返回月份总览';
		                    return s;
		                }
		            },
		            series: [{
		                name: name,
		                data: res,
		                color: colors[0]
		            }],
		            exporting: {
		                enabled: true
		            }
        		});
		        /*
		        chart1 = new Highcharts.Chart({
		                chart: {renderTo: 'column_2',type: 'column'},
		                        title: {text: '观影时间段分布图'},
		                        xAxis: {categories: hours},
		                        yAxis: {min: 0,title: {text: '数量（部）'}},
		                        tooltip: {formatter: function() {return ''+this.x +': '+ this.y +' 部';}},
		                        plotOptions: {column: {cursor: 'pointer',dataLabels: {enabled: true,formatter: function() {return this.y}}}},
		                        series: [{name: '时段',data: hour}]
		        });
		        */
        		chart2 = new Highcharts.Chart({
                	chart: {
                        renderTo: 'pie',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                	},
                	title: {
                        text: '评分分布'
                	},
                	tooltip: {
                        pointFormat: '',
                        percentageDecimals: 0
                	},
                	plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                        	    color: '#000000',
                                connectorColor: '#000000',
                                formatter: function() {
                                    return '<b>' + this.point.name + '</b>: ' + Math.round(this.percentage) + ' %'
                                }
                            }
                        }
                	},
                	series: [{
                        type: 'pie',
                        name: '数量',
                        data: [['无', RATE[0]], ['1星', RATE[1]], ['2星', RATE[2]], ['3星', RATE[3]], ['4星', RATE[4]], ['5星', RATE[5]]]
                	}]
        		});
			}
		}
	});
	})(0);
});

