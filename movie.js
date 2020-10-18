var optionContainer = document.querySelector(".article .sort"),
    contentContainer = document.querySelector(".grid-view");
optionContainer.innerHTML += '<span class="gray-dot">·</span><a href="javascript:void(0);" id="tj">电影统计</a>';
optionContainer.addEventListener("click", function(e) {
    if(e.target.id === "tj") {
        if(document.querySelector("#year")) return true;
        var now = new Date().getFullYear(), option = "<option> - </option>";
        for(var year=now;year>=2005;year--) option+="<option>{{year}}</option>".replace("{{year}}",year);
        optionContainer.innerHTML += '<span class="gray-dot">·</span>选择统计年份：<select id="year" value="">'+option+'</select>';
    }
    return true;      
})
optionContainer.addEventListener("change", function(e) {
    if(e.target.id != "year") return true;
    try {
        document.querySelector(".paginator").innerHTML = "";
    } catch(e) {};
    contentContainer.innerHTML = "";

    var year = +e.target.value, 
        user = document.querySelector("#db-usr-profile a").href.split("/").reverse()[1],
        total = +document.querySelector("title").textContent.match(/[0-9]+/),
        films = localStorage[user] ? JSON.parse( localStorage[user] ) : [];

    if(films.length === total) return render(films, year);
    else films = [];
    
    var pages = getPages(user, total), percent = {
        init: function() {
            contentContainer.innerHTML = '<div class="percent" style="font-size:100px;text-align:center;"><span>0</span>%</div>';
        },
        update: function(percent) {
            contentContainer.querySelector(".percent span").innerHTML = (percent*100).toFixed(1);
        },
        remove: function() {
            contentContainer.innerHTML = "";
        },
        length: pages.length
    };

    percent.init();
    getPages(user, total).map(getHTML).reduce(function(seq, html) {
        return seq.then(function() {
            percent.length--;
            percent.update((pages.length - percent.length)/pages.length);
            return html;
        }).then(getFilms);
    }, Promise.resolve()).then(function() {
        percent.remove();
        render(films, year);
        localStorage.setItem(user, JSON.stringify(films));
    });
    function getFilms(dom) {
        return [].forEach.call(dom.querySelectorAll(".item"), function(item) {
            var dateDOM = item.querySelector(".date"),
                rateDOM = dateDOM.previousElementSibling,
                desDOM  = item.querySelector(".comment"),
                film = {
                    id   : item.querySelector(".nbg").href.split("subject/")[1].split("/")[0],
                    date : dateDOM.innerHTML
                };
            var film = {
                id   : film.id,
                img  : item.querySelector(".pic img").src,
                des  : desDOM ? desDOM.textContent : "",
                date : film.date,
                year : +film.date.split("-")[0],
                rate : rateDOM ? rateDOM.className.substring(6,7) : 0,
                title: item.querySelector(".title em").innerHTML
            };
            films.push(film);
        });
    }
});
contentContainer.addEventListener("click", function(e) {
    switch(e.target.tagName.toLowerCase()) {
        case "span":
            var clicked;
            if(clicked = document.querySelector("#command span.click")) {
                clicked.classList.toggle("click");
            }
            showPostByRate(e.target.className);
            e.target.classList.toggle("click");
            break;
        case "button":
            showPostWall();
            break;
    }
})
function render(films, year) {
    const MONTHES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const SMALLMONTH = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    const BIGGERMONTH = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    const BIGMONTH = [0,2,4,6,7,9,11];
    const RATENAME = ["zero", "one", "two", "three", "four", "five"];
    var counts = {
        rate: [].slice.call(new Uint8Array(6)),
        month: [].slice.call(new Uint8Array(12)),
        day: [].slice.call(new Uint8Array(12)).map(function(v,k) {
            return [].slice.call(new Uint8Array( BIGMONTH.indexOf(k) != -1 ? 31 : 30 ));
        })
    },
    template = {
        basicHTML: '\
            <div id="column"></div>\
            <div id="column_2"></div>\
            <div id="pie"></div>\
            <div id="mc"></div>\
            <div id="command">\
                <span class="one">一星</span>\
                <span class="two">二星</span>\
                <span class="three">三星</span>\
                <span class="four">四星</span>\
                <span class="five">五星</span>\
                <span class="all">所有</span>\
                <button class="poster-wall" style="float: right;">生成海报墙</button>\
            </div>\
            <ul id="msh">\
                {{videoList}}\
            </ul>\
            <div id="raw">\
                <p style="background-color:#d9edf7;color:#3a87ad;padding:8px 35px 8px 14px;margin-bottom:18px;text-shadow: 0 1px 0 rgba(255,255,255,0.5);border:1px solid #bce8f1;-webkit-border-radius:4px;font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:13px;">\
                    {{word}}\
                    <a class="jiathis_button_douban" href="http://shuo.douban.com/!service/share?image=&href={{url}}&name={{title}}&text={{word}}" target="_blank" style="float:right;">\
                        分享到豆瓣\
                    </a>\
                </p>\
                <p style="margin-top:50px;">\
                    <label>\
                        引用代码：\
                    </label>\
                </p>\
                <textarea style="height:600px;resize:vertical;width:100%;"><h3>{{year}}年</h3><ul class="db-items">{{videoList}}</ul></textarea>\
            </div>\
            <style type="text/css">\
                #command {\
                    border-bottom: 1px solid #06F;\
                    margin-bottom: 10px;\
                    margin-top: 10px;\
                    padding: 10px 0 6px 0;\
                    font-size: 16px;\
                    text-shadow: 1px 1px 1px #FFF;\
                }\
                #command span {\
                    cursor: pointer;\
                    padding: 10px 20px;\
                }\
                #command span:hover, #command span.click {\
                    border: 1px solid #06F;\
                    background: #FFF;\
                    border-bottom: 1px solid #FFF;\
                }\
                #msh {\
                    width: 100%;\
                    margin: 0;\
                }\
                #msh li {\
                    display: inline-table;\
                    margin: 3px;\
                }\
            </style>',
        videoListItem:'<li class="{{rateName}}"><a href="http://movie.douban.com/subject/{{id}}" title="{{title}}"><img src="{{img}}" crossOrigin="*" alt="{{title}}" width="67px" height="97px" /></a></li>',
        word : "{{year}}年我一共看了{{total}}部影片，平均每月看片{{average}}部。其中{{mostMonth}}看了{{mostWatch}}部影片，是我的年度最佳看片月。十二个月{{watchAverage}}，{{watchLevel}} #豆瓣电影统计工具#",
        render: function(str, obj) {
            return str.replace(/{{(\w+)}}/g, function(_,O) {return obj[O] || O});
        }
        
    },
    charts = {
        renderByYear: function(title, categories, data) {
            function setChart(name, categories, data, color) {
                chart.xAxis[0].setCategories(categories, false);
                chart.series[0].remove(false);
                chart.addSeries({
                    name: name,  
                    data: data,
                    color: color
                }, false);
                chart.redraw()
            }
            var basicName = "电影", colors = Highcharts.getOptions().colors;
            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'column',
                    type: 'column'
                },
                title: {text: title},
                xAxis: {categories: categories},
                yAxis: {title: {text: '数量（部）'}},
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
                                        setChart(basicName, categories, data, colors[0])
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
                    name: basicName,
                    data: data,
                    color: colors[0]
                }],
                exporting: {
                    enabled: true
                }
            });
            return chart;
        },
        renderByYears: function() {

        },
        renderByRate: function(rate) {
            return new Highcharts.Chart({
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
                    data: [['无', rate[0]], ['1 星', rate[1]], ['2 星', rate[2]], ['3 星', rate[3]], ['4 星', rate[4]], ['5 星', rate[5]]]
                }]
            });
        },
        renderByRates: function() {

        }
    };

    films = films.filter(function(film) {return film.year === year});
    var videoList = films.map(function(film) {
        var date = film.date.split("-"),
            filmMonth = +date[1]-1;
            filmDay   = +date[2]-1;
        counts.rate[ film.rate ] += 1;
        counts.month[ filmMonth ] += 1;
        counts.day[ filmMonth ][ filmDay ] += 1;
        film.rateName = RATENAME[film.rate];
        return template.render(template.videoListItem, film);
    }).join("");

    var mostWatchKey = mwatch(counts.month);
    contentContainer.innerHTML = template.render(template.basicHTML, {
        videoList:videoList, 
        url:"http://douban.com", 
        title:"豆瓣", 
        year: year,
        word: template.render(template.word, {
            year:year, 
            total:films.length, 
            average:Math.round(films.length/12*10)/10, 
            mostMonth:MONTHES[mostWatchKey], 
            mostWatch:counts.month[mostWatchKey], 
            watchAverage:av(films.length, counts.month), 
            watchLevel:arate(counts.rate)
        })
    });

    var colors = Highcharts.getOptions().colors;
    charts.renderByYear(year + '年你一共看过' + films.length + '部电影', MONTHES, counts.month.map(function(count, i) {
        return {
            y: count,
            color: colors[0],
            drilldown: {
                name: MONTHES[i],
                categories: BIGMONTH.indexOf(i) != -1 ? BIGGERMONTH : SMALLMONTH,
                data: counts.day[i],
                color: colors[0]
            }
        }
    }));
    charts.renderByRate(counts.rate);
}
