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
function getPages(user, total, type) {
    type = type || "movie";
    var url = 'http://'+type+'.douban.com/people/'+user+'/collect?sort=time&rating=all&filter=all&mode=grid&start=',
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