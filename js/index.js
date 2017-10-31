
    var lotto,
      initSet=function(){
        var arr;
        if(J.id('list-input').val()==""){
          arr=[
              "一元现金",
              "两元现金",
              "没有中奖",
              "十元现金",
              "一个亲亲",
              "没有中奖",
              "一个抱抱",
              "一元现金",
              "两元现金",
              "没有中奖",
              "一个亲亲",
              "一个抱抱",
              "没有中奖"
              ]
        }else{
          arr=J.id('list-input').val().split("\n");
          arr.each(function(a,i){
            if(a==""){
              arr[i]="没有中奖";
            }
          });
        }
        var times=J.id('times-input').val();
        if(times==""){
          times=false;
        }else{
          times=parseInt(times);
        }
        common();
        init(arr,times);
      },
      initSetDefault=function(){
        common();
        init([
              "一元现金",
              "两元现金",
              "没有中奖",
              "十元现金",
              "一个亲亲",
              "没有中奖",
              "一个抱抱",
              "一元现金",
              "两元现金",
              "没有中奖",
              "一个亲亲",
              "一个抱抱",
              "没有中奖"
              ],false);
      },
      common=function(){
        J.id("title").txt("幸运抽奖");
        J.id("inputWrapper").hide();
        J.id("circle-wrapper").show();
      };
    
      J.noteStyle("simple");
      function init(list,times){
        lotto=new Jet(J.id("circle-wrapper"),{
          data:{
            main:{
              list:list
            },
            deg:0,
            num:0,
            len:50,
            clen:300,
            color:['#ef6e6e','#ef6ed9','#b176ff','#767aff','#58c0f1',
                  '#51d5c2','#5eed7d','#aaa','#cbd956','#d99f56'],
            times:times
                  
          },
          func:{
            initTop:function(obj){
              var par=obj.parent();
              par.css('margin-top',(J.height()-par.hei())/2+"px");
            },
            initPosition:function(obj){
              var list=obj.child();
              var d=this.data;
              var f=this.func;
              d.num=list.length;
              d.deg=360/list.length;
              list.each(function(item,i){
                var r=d.clen/2-d.len/2;
                var rad=f.toRad(i*d.deg);
                var left=d.clen/2+r*Math.sin(rad)-d.len/2;
                var top=d.clen/2-r*Math.cos(rad)-d.len/2;
                item.css({
                  top:top+"px",
                  left:left+"px",
                  transform:"rotate("+i*d.deg+"deg)",
                  'background-color':d.color[i%10],
                  "-webkit-transform":"rotate("+i*d.deg+"deg)"
                });
              });
            },toRad:function(deg){
              return deg*Math.PI/180;
            },start:function(obj){
              if(obj.isRun!=true&&(this.data.times>0||this.data.times===false)){
                J.close();
                obj.child(0).html('抽奖<br>中...');
                obj.isRun=true;
                var item=J.id("list").removeClass("animation");
                item.removeAttr("style");
                var d=this.data;
                if(J.type(this.data.times)=="number")
                  d.times--;
                J.delay(function(){
                  item.addClass("animation");
                  var lotto_num=J.random(0,d.num-1);
                  var deg=360*15-lotto_num*d.deg;
                  item.css({
                    transform:"rotate("+deg+"deg)",
                    "-webkit-transform":"rotate("+deg+"deg)"
                  });
                  var list=d.main.list;
                  J.delay(function(){
                    if(list[lotto_num]=="没有中奖"){
                      J.showWait("很遗憾，"+list[lotto_num]+"哦","error");
                    }else{
                      J.showWait("恭喜获得"+list[lotto_num]+"！","success");
                    }
                    var text;
                    if(d.times===false||d.times>0){
                      text='再来<br>一次';
                      if(J.type(d.times)=="number"){
                        text+=('('+d.times+')');
                      }
                      obj.isRun=false;
                    }else{
                      text='机会<br>已用完';
                    }
                    obj.child(0).html(text);
                  },10000);
                },30);
              }else{
                if(J.type(this.data.times)=="number"&&this.data.times<=0){
                  J.show("机会已经用完","warn");
                }
              }
            },reload:function(){
              J.reload();
            }
          }
        });
      }
        
      