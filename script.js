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
    document.querySelector(".paginator").innerHTML = "";
    contentContainer.innerHTML = "";

    var year = +e.target.value, 
        user = document.querySelector("#db-usr-profile a").href.split("/").reverse()[1],
        total = +document.querySelector("title").textContent.match(/\w+/)[0],
        films = localStorage[user] ? JSON.parse( localStorage[user] ) : [];
    
    if(films.length === total) return render(films, year);
    var pages = getPages(user, total), percent = {
        init: function() {
            contentContainer.innerHTML = '<div class="percent" style="font-size:100px;text-align:center;"><span>0</span>%</div>';
        },
        update: function(percent) {
            contentContainer.querySelector(".percent span").innerHTML = (percent*100).toFixed(2);
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
                desDOM  = item.querySelector(".opt-ln").previousElementSibling,
                film = {
                    id   : item.querySelector(".nbg").href.split("subject/")[1].split("/")[0],
                    date : dateDOM.innerHTML
                };
            var film = {
                id   : film.id,
                img  : "http://iphoto.sinaapp.com/{id}.jpg".replace("{id}", film.id),
                des  : desDOM.querySelector(".date") ? "" : desDOM.textContent,
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

    function showPostByRate(rate) {
        rate = rate !== "all" ? "li."+rate : "*";
        var style = document.querySelector("#showPostByRate"),
            styleSheet = "#msh li {\
                display:none\
            } \
            #msh {{rate}} {\
                display:inline-table!important\
        }".replace("{{rate}}", rate);
        if(style) style.innerHTML = styleSheet;
        else {
            style = document.createElement("style");
            style.id = "showPostByRate";
            style.innerHTML = styleSheet;
            document.body.appendChild(style);
        }
    }

    function showPostWall(DOM) {
        DOM = DOM || document.querySelector("#msh");
        var width = 67, height = 97, padding = 6, line = 8;
        var canvas = document.createElement("canvas");
        canvas.width = DOM.clientWidth, canvas.height = DOM.clientHeight;
        var ctx = canvas.getContext("2d");

        var images = [].forEach.call(DOM.querySelectorAll("img"), function(image, k) {
            var x = k % line * ( width + padding ), y = parseInt( k / line ) * ( height + padding );
            ctx.drawImage(image, x, y, width, height);
        })
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        var postWall = document.createElement("div"), 
            postWallClose = document.createElement("span"),
            style = document.createElement("style");
        postWall.className = "post-wall";
        postWallClose.className = "post-wall-close";
        postWallClose.innerHTML = "×";
        style.innerHTML = "\
            html,body {overflow:hidden}\
            .post-wall {\
                position:absolute;\
                top:0;\
                left:0;\
                right:0;\
                bottom:0;\
                background:rgba(0,0,0,0.5);\
                overflow-y:auto;\
                width:100%;\
                height:100%;\
            }\
            .post-wall-close {\
                cursor:pointer;\
                color:#FFF;\
                font-size:80px;\
                font-weight:bold;\
                transition:all 0.5s;\
                position:fixed;\
                right:35px;\
            }\
            .post-wall-close:hover {\
                -webkit-transform:rotate(90deg);\
            }\
            .post-wall canvas {\
                margin:200px 400px;\
            }\
        ";
        postWallClose.onclick = function() {document.body.removeChild(postWall)}
        postWall.appendChild(canvas);
        postWall.appendChild(postWallClose);
        postWall.appendChild(style);
        document.body.appendChild(postWall);
        // document.body.innerHTML = "";
        // document.body.appendChild(canvas);
        //window.open( canvas.toDataURL() );
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
                {{filmList}}\
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
                <textarea style="height:600px;resize:vertical;width:100%;">\
                    <ul id="msh">\
                        {{filmList}}\
                    </ul>\
                </textarea>\
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
        filmListItem:'<li class="{{rateName}}">\
            <a href="http://movie.douban.com/subject/{{id}}" title="{{title}}">\
                <img src="{{img}}" crossOrigin="*" alt="{{title}}" width="67px" height="97px" />\
            </a>\
        </li>',
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
    var filmList = films.map(function(film) {
        var date = film.date.split("-"),
            filmMonth = +date[1]-1;
            filmDay   = +date[2]-1;
        counts.rate[ film.rate ] += 1;
        counts.month[ filmMonth ] += 1;
        counts.day[ filmMonth ][ filmDay ] += 1;
        film.rateName = RATENAME[film.rate];
        return template.render(template.filmListItem, film);
    }).join("");

    var mostWatchKey = mwatch(counts.month);
    contentContainer.innerHTML = template.render(template.basicHTML, {
        filmList:filmList, 
        url:"http://douban.com", 
        title:"豆瓣", 
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
function getHTML(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open("GET", url, true);
        xhr.onload = function() {
            xhr.status !== 200 ? reject(Error(xhr.statusText)) : resolve(xhr.response);
        }
        xhr.onerror = function() {
            reject(Error("Network Error!"));
        }
        xhr.send();
    })
}
function getPages(user, total) {
    var url = 'http://movie.douban.com/people/'+user+'/collect?sort=time&rating=all&filter=all&mode=grid&start=',
        urls = [], start = 0;

    do {
        urls.push(url+start);
        start += 15;
    } while(start < total);

    return urls;
}
function exportRAW(name, data) {
    var urlObject = window.webkitURL;

    var export_blob = new Blob([data]);

    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
        );
    save_link.dispatchEvent(ev);
}
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