var b_color = "rgba(23,149,249,";
var g_color = "rgba(238,88,87,";
var canvas = J.ct("canvas#bgCanvas");
var _w=J.width();
var _h=J.height();
var _n=20;
var ctx = canvas.getContext("2d");
var circles=new Array();
var frame_func = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(func) {
        window.setTimeout(func, 1000 / 45);
    };

var cacheCanvas = document.createElement("canvas");
var cache_ctx = cacheCanvas.getContext("2d");

(function () {
    canvas.width=_w;
    canvas.height=_h;
    cacheCanvas.width = _w;
    cacheCanvas.height = _h;
    canvas.css({
        position: 'fixed',
        top: '0',
        left: '0',
        'z-index': '-2'
    });
    var _cover = J.ct("div#bgCover").css({
        width:_w+"px",
        height:_h+"px",
        position: 'fixed',
        top: '0',
        left: '0',
        'z-index': '-2'
    });
    J.body().append([canvas,_cover]);
    for(var i=0;i<_n;i++){
      circles.push(new Circle());
    }
    _draw();
})();
function _draw() {
    cache_ctx.clearRect(0, 0, _w, _h);
    circles.each(function (item) {
        item.act();
    });
    ctx.clearRect(0, 0, _w, _h);
    ctx.drawImage(cacheCanvas, 0, 0, _w, _h);
    frame_func(_draw);
}
function Circle(x,y) {
    this.x=J.checkArg(x,J.random(0,_w));
    this.y=J.checkArg(y,J.random(0,_h));
    this.r=0;
    this.max_r=J.random(10,50);
    this.speed=J.random(2,6)*0.02;
    this.alpha=J.random(2,9)*0.1;
    this.per_a=0;
    this.color_base=((J.random(0,1)==0)?g_color:b_color);
    this.color=this.color_base+this.alpha+")";
    this.stop=false;
    this.reinit=function(){
        this.x=J.random(0,_w);
        this.y=J.random(0,_h);
        this.r=0;
        this.max_r=J.random(10,50);
        this.speed=J.random(2,6)*0.02;
        this.alpha=J.random(2,9)*0.1;
        this.per_a=0;
        this.color_base=((J.random(0,1)==0)?g_color:b_color);
        this.color=this.color_base+this.alpha+")";
    };
    this.act=function(){
        this.r += this.speed;
        if (this.r > this.max_r * 0.7) {
            if (this.r >= this.max_r) {
                this.reinit();
            } else {
                if (this.alpha > 0) {
                    if (this.per_a == 0) {
                        this.per_a = (this.alpha) / ((this.max_r - this.r) / this.speed);
                    }
                    this.alpha -= this.per_a;
                    if (this.alpha <= 0) {
                        this.alpha=0;
                    }
                    this.color = this.color_base + this.alpha + ")";
                } else {
                    this.alpha=0;
                    this.color = this.color_base + this.alpha + ")";
                }
            }
        }
        this.draw();
    };
    this.draw=function(){
        cache_ctx.beginPath();
        cache_ctx.arc(this.x , this.y ,this.r,0,2*Math.PI);
        cache_ctx.fillStyle=this.color;
        cache_ctx.fill();
        cache_ctx.closePath();
    };
};
window.onresize=function () {
    _w=J.width();
    _h=J.height();
    cacheCanvas.width=_w;
    cacheCanvas.height=_h;
    canvas.width=_w;
    canvas.height=_h;
    J.id("bgCover").css({
        width:_w+"px",
        height:_h+"px"
    });
}
window.onclick=function (e) {
    circles.push(new Circle(e.clientX,e.clientY));
}
