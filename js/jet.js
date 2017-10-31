//

// j-bind
// j-for
// j-switch
// j-case
// j-input  j-type
// j-text 
// $each
// $index
// $value

// j-if = exp:class[a,b|b];attr[a=b,a=b|a];func
// $  class[a|b]  attr[a|b]  function
// j-on 
// j-run
(function(){
  var _bind="j-bind",
    _for="j-for",
    _switch="j-switch",
    _case="j-case",
    _input="j-input",
    _type="j-type",
    _text="j-text",
    _if="j-if",
    _on="j-on",
    _run="j-run",
    _route="j-route",
    _routeout="routerout",
    _origin_html="_origin_html",
    _html_path="/assets/html/";
  if(typeof J=="undefined"){
    throw new Error("该框架依赖Jetter.js,http://www.theajack.com/jetterjs/assets/js/jetter-lite.min.js");
  }
  J.ready(function(){
    Jet.router.reload();
  });
  Jet=function(ele,opt){
    this.ele=ele;//html元素
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    this.par=this;
    this.type="jet";
    this.data=J.checkArg(opt.data,{});
    this.func=J.checkArg(opt.func,{});
    //this.eleArr=[];
    this.jets=[];
    this.jetTools=[];
    this.bindName=ele.attr(_bind);
    _initJet.call(this);
  };Jet.prototype.get=function(){
    return this.data[this.bindName];
  };Jet.prototype.set=function(name,call){
    var d;
    if(J.type(name)=="function"){
      call=name;
      d=this.data;
    }else{
      d=this.data[name];
    }
    call(d);
    this.refresh();
  };Jet.prototype.refresh=function(obj){
    var _this=this;
    this.jets.each(function(ele){
      _jetRefreshOne(ele,obj);
    });
    this.jetTools.each(function(ele){
      _jetRefreshOne(ele,obj);
    });
  };Jet.prototype.find=function(name){//
    return _findCommon(this.jets,name);
  };
  function _jetRefreshOne(one,obj){
    if(obj==undefined){
      one.refresh();
    }else if((one.bindName==obj.bindName&&one!=obj)||one.type=="if"){
      one.refresh(obj);
    }
  };
  function _findCommon(arr,name,i,run){  
    if(run==undefined){//需要递归查找
      if(J.type(name)!="string"){
        throw new Error("find:第一个参数必须是字符串");
      }
      var obj=arr;
      var a=name.split(".");
      a.each(function(item,j){
        var rname=item,index;
        if(item.has("[")){
          var _a=item.split("[");
          rname=_a[0];
          index=_a[1].substring(0,_a[1].length-1);
        }
        if(j<a.length-1&&index==undefined){
          throw new Error("find:'"+name+"'调用错误");
        }
        obj=_findCommon(obj,rname,index,true);
      });
      return obj;
    }else{
      var items;
      var a = findJetByName(arr,name);
      if(a.length==1&&a[0].type=="for"){
        if(i==undefined){
          items = a[0];
        }else{
          items = a[0].jetArr[i];
        }
      }else{
        if(i==undefined){
          if(a.length==1){
            items=a[0];
          }else{
            items = a;
          }
        }else{
          if(parseInt(i).toString()=="NaN"){
            items=[];
            a.each(function(_a){
              if(_a.type==i){
                items.push(_a);
              }
            });
            if(items.length==1){
              items=items[0];
            }
          }else{
            items = a[parseInt(i)];
          }
        }
      }
      return items;
    }
  }
  function findJetByName(arr,name,type){
    var items=[];
    arr.each(function(a){
      if(a.ele.attr(_for)==name||a.ele.attr(_text)==name||a.ele.attr(_input)==name)
        items.push(a);
    });
    return items;
  }
  function checkIsBelong(str,list,jet,type){
    checkIsBelongEle(jet.ele.findAttr(str),list,jet,type)
  }
  function checkIsBelongEle(ele,list,jet,type){
    ele.each(function(item){
      item.jet.each(function(j){
        if((type==undefined||j.type==type)&&j.par==jet){
          list.push(j);
        }
      });
    });
  }
  function _initJet(){
    if(!this.ele.hasAttr(_bind)){
      throw new Error("参数错误：必须含有j-bind");
    }
    var _this=this;
    if(_this.ele.hasAttr(_for)){
      var bindName=_this.ele.attr(_for);
      var opt={
        origin:_this,
        obj:_this,
        ele:_this.ele,
        data:_this.data,
        func:_this.func
      };
      if(bindName==""){
        opt.bindName=_this.ele.attr(_bind);
        _this.ele.attr(_for,opt.bindName);
        opt.bindData=_this.data;
      }else{
        if((bindName in _this.data[_this.bindName])&&_this.ele.hasJeted!=true){
          opt.bindName=bindName;
          opt.bindData=_this.data[_this.bindName];
        }else{
          throw new Error("对象没有 "+bindName+" 属性");
        }
      }
      _this.jets.push(new JetFor(opt));
    }else{
      this.ele.findAttr(_for).each(function(item){
        var bindName=item.attr(_for);
        if((bindName in _this.data[_this.bindName])&&item.hasJeted!=true){
          _this.jets.push(new JetFor({
            origin:_this,
            obj:_this,
            ele:item,
            bindName:bindName,
            bindData:_this.data[_this.bindName],
            data:_this.data,
            func:_this.func
          }));
        }
      });
      this.ele.findAttr(_text).each(function(item){
        if(item.hasJeted!=true){
          _this.jets.push(new JetText({
            obj:_this,
            ele:item,
            bindName:item.attr(_text),
            bindData:_this.data[_this.bindName],
            data:_this.data,
            origin:_this
          }));
        }
      });
      this.ele.findAttr(_input).each(function(item){
        if(item.hasJeted!=true){
          _this.jets.push(new JetInput({
            obj:_this,
            ele:item,
            bindName:item.attr(_input),
            bindData:_this.data[_this.bindName],
            data:_this.data,
            origin:_this
          }));
        }
      });
      this.ele.findAttr(_if).each(function(item){
        if(item.hasJetIf!=true){
          _this.jetTools.push(new JetIf({
            obj:_this,
            ele:item,
            bindData:_this.data[_this.bindName],
            data:_this.data,
            func:_this.func
          }));
        }
      });
      this.ele.findAttr(_on).each(function(item){
        if(item.hasJetOn!=true){
          _this.jetTools.push(new JetOn({
            origin:_this,
            ele:item,
            obj:_this,
            bindData:_this.data,
            bindName:_this.bindName
          }));
        }
      });
      this.ele.findAttr(_run).each(function(item){
        if(item.hasJetRun!=true){
          _this.jetTools.push(new JetRun({
            origin:_this,
            ele:item,
            obj:_this,
            bindData:_this.data,
            bindName:_this.bindName
          }));
        }
      });
    }
    _checkJetToolArr({
      origin:_this,
      ele:_this.ele,
      obj:_this,
      bindData:_this.data,
      bindName:_this.bindName,
      data:_this.data,
      func:_this.func
    },_this.jetTools);
  };
  Jet.version="1.0.0";
  Jet.author="theajack";
  Jet.router={
    url:"",
    config:"/assets/js/router.json",
    path:{},
    init:function(){
      J.attr(_route).each(function(item){
        item.clk(function(){
          Jet.router.route(this.attr(_route))
        });
      });
    },
    reload:function(){
      J.load(Jet.router.config,function(json){
        Jet.router.path=new Function("return "+json)();
        Jet.router.route(location.pathname);
      });
      Jet.router.init();
    },
    route:function(url){
      if(!(url in Jet.router.path)&&url!="/"){
        url="/404";
      }
      Jet.router.url=url;
      var stateObject = {};
      var title = url;
      var newUrl = url;
      history.pushState(stateObject,title,newUrl);
      if(url!="/"){
        if(url[0]!="/"){url="/"+url;};
        J.load(_html_path+Jet.router.path[url],function(html){
          J.attr(_routeout).html(html).findTag("script").each(function(item){
            if(item.hasAttr("src")){
              J.load(item.attr("src"),function(script){
                new Function(script)();
                Jet.router.init();
              });
            }else{
              new Function(item.html())();
              Jet.router.init();
            }
          });
        });
      }
    }
  };
  //基本组成：循环
  JetFor=function(opt){
    this.origin=opt.origin;
    this.par=opt.obj;
    this.ele=opt.ele;
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    opt.ele.hasJeted=true;
    this.data=opt.data;
    this.func=opt.func;
    this.bindData=opt.bindData;
    this.bindName=opt.bindName;
    this.length=opt.bindData[opt.bindName].length;
    this.type="for";
    this.cLen;//孩子元素的个数
    //this.eleArr=[];
    this.jetArr=[];//二维数组
    this.jetToolArr=[];//二维数组
    this.jetTools=[];//自己上面绑定的tool
    _initJetFor.call(this);
    _checkJetToolArr({
      origin:this.origin,
      ele:this.ele,
      obj:this,
      bindData:this.bindData,
      bindName:this.bindName,
      data:this.origin.data,
      func:this.origin.func
    },this.jetTools);
  };JetFor.prototype.find=function(name,index){
    if(index==undefined){
      throw new Error("JetFor.find 方法需要索引");
    }
    return _findCommon(this.jetArr[index],name);
  };JetFor.prototype.get=function(){
    return this.bindData[this.bindName];
  };JetFor.prototype.set=function(index,call){
    var d;
    if(J.type(index)=="function"){
      index(this.bindData[this.bindName]);
      this.refresh();
    }else{
      call(this.bindData[this.bindName][index]);
      this.refresh(index);
    }
  };JetFor.prototype.insert=function(d,i){
    if(J.type(d)=="array"){
      var _this=this;
      d.each(function(single){_this.insert(single)});
    }else{
      this.bindData[this.bindName].insert(d,i);
    }
  };JetFor.prototype.prepend=function(d){
    this.insert(d,0);
  };JetFor.prototype.append=function(d,isFromArr){
    if(J.type(d)=="array"){
      var _this=this;
      d.each(function(single){_this.append(single,true)});
      this.refresh("last");
    }else{
      this.bindData[this.bindName].push(d);
      if(isFromArr!=true){
        this.refresh("last");
      }
    }
  };JetFor.prototype.remove=function(i){
    this.bindData[this.bindName].removeByIndex(i);
    this.refresh(i);
  };JetFor.prototype.insert=function(d,i){
    if(J.type(d)=="array"){
      var _this=this;
      d.each(function(single,k){_this.insert(single,i+k)});
    }else{
      this.bindData[this.bindName].insert(d,i);
    }
    this.refresh(i);
  };JetFor.prototype.refresh=function(o){
    var t=J.type(o);
    var data=this.get();
    if(t=="string"||t=="number"){
      if(t=="string"){
        if(o=="first"){
          o=0;
        }else if(o=="last"){
          o=this.length;
        }else{
          throw new Error("无效的字符串参数:"+o);
        }
      }
      var newLength=data.length-this.length;
      this.length=data.length;
      var _this=this;
      if(newLength>0){
        var temp=this.ele.clone().empty();
        temp.html(this.ele.data(_origin_html));
        var htmlEle=[];
        for(var i=o;i<o+newLength;i++){
          _initJetForOne.call(_this,data[i],i,temp,htmlEle,o);
        }
        if(o==0){
          htmlEle.each(function(item,i){
            _this.ele.append(item,i);
          });
        }else{
          htmlEle.each(function(item,i){
            _this.ele.child(_countClen(_this.cLen,0,o)-1+i).after(item)
            //_this.ele.child(_this.cLen*o-1+i).after(item)
          });
        }
        _refreshIndex(_this,o+newLength);
      }else if(newLength<0){
        for(var i=0;i<_countClen(this.cLen,o,o-newLength);i++){
        //for(var i=0;i<-newLength*this.cLen;i++){
          //_this.ele.child(_this.cLen*(o)).remove();
          _this.ele.child(_countClen(_this.cLen,0,o)).remove();
        }
        if(J.type(this.cLen)=="array"){
          this.cLen.removeByIndex(o);
        }
        for(var i=0;i<-newLength;i++){
          _this.jetArr.removeByIndex(o);//remove
          _this.jetToolArr.removeByIndex(o);
        }
        _refreshIndex(_this,o);
      }else{
        this.jetArr[o].each(function(ele){
          ele.refresh();
        });
        this.jetToolArr[o].each(function(ele){
          ele.refresh();
        });
      }
    }else{
      this.jetArr.each(function(eles){
        eles.each(function(ele){
          if(o==undefined){
            ele.refresh();
          }else if((ele.bindName==o.bindName&&ele!=o)||ele.type=="if"){
            ele.refresh(o);
          }
        });
      });
      this.jetToolArr.each(function(eles){
        eles.each(function(ele){
          ele.refresh();
        });
      });
    }
    this.jetTools.each(function(ele){
      ele.refresh();
    });
  };
  function _initJetFor(){
    if(J.type(this.bindData[this.bindName])!="array"){
      throw new Error("参数错误：j-for属性对应的数据必须是数组类型");
    }
    var temp=this.ele.clone().empty();
    if(this.ele.data(_origin_html)==undefined){
      this.ele.data(_origin_html,this.ele.html());
      this.ele.empty();
    }
    temp.html(this.ele.data(_origin_html));
    if(this.ele.hasAttr(_switch)){
      this.cLen=[];
    }else{
      this.cLen=temp.child().length;
    }
    var htmlEle=[];
    var _this=this;
    this.bindData[this.bindName].each(function(data,i){
      _initJetForOne.call(_this,data,i,temp,htmlEle)
    });
    _this.ele.append(htmlEle);
  };
  function _initJetForOne(data,i,temp,htmlEle,o){
    var _this=this;
    var _c=temp.clone();
    var arr=[];
    var toolArr=[];
    if(_this.ele.hasAttr(_switch)){
      var attr=_this.ele.attr(_switch);
      if(attr in data){
        _c.html(_c.findAttr(_case+"="+data[attr]).html());
      }
    }
    _c.child().each(function(item){
      htmlEle.push(item);
    });
    if(J.type(this.cLen)=="array"){//添加孩子长度
      if(o==undefined){
        this.cLen.push(_c.child().length);
      }else{
        this.cLen.insert(_c.child().length,o);
      }
    }
    _c.findAttr(_for).each(function(item){
        var bindName=item.attr(_for);
        if((bindName in data)&&item.hasJeted!=true){
          var opt={
            origin:_this.origin,
            obj:_this,
            ele:item,
            bindData:data,
            data:_this.data,
            func:_this.func,
            bindName:bindName
          };
          var jetFor=new JetFor(opt);
          arr.push(jetFor);
        }
    });
    _c.findAttr(_text).each(function(item){
      if(item.hasJeted!=true){
        var attr=item.attr(_text);
        var opt={
          ele:item,
          obj:_this,
          bindData:data,
          data:_this.data,
          origin:_this.origin
        };
        if(attr=="$each"){
          opt.bindData=_this.bindData[_this.bindName];
          opt.bindName=i;
        }else if(attr=="$index"){
          opt.bindName=i;
          opt.bindIndex=i;
        }else{
          opt.bindName=attr;
        }
        arr.push(new JetText(opt));
      }
    });
    _c.findAttr(_input).each(function(item){
      if(item.hasJeted!=true){
        var attr=item.attr(_input);
        var opt={
          ele:item,
          obj:_this,
          bindData:data,
          data:_this.data,
          origin:_this.origin
        };
        if(attr=="$each"){
          opt.bindData=_this.bindData[_this.bindName];
          opt.bindName=i;
        }else if(attr=="$index"){
          throw new Error("j-input不支持$index参数");
        }else{
          opt.bindName=item.attr(_input);
        }
        arr.push(new JetInput(opt));
      }
    });
    _c.findAttr(_if).each(function(item){
      if(item.hasJetIf!=true){
        toolArr.push(new JetIf({
          ele:item,
          obj:_this,
          bindData:data,
          data:_this.data,
          func:_this.func,
          bindIndex:i
        }));
      }
    });
    _c.findAttr(_on).each(function(item){
      if(item.hasJetOn!=true){
        toolArr.push(new JetOn({
          origin:_this.origin,
          ele:item,
          obj:_this,
          bindData:_this.bindData[_this.bindName],
          bindName:i
        }));
      }
    });
    _c.findAttr(_run).each(function(item){
      if(item.hasJetRun!=true){
        toolArr.push(new JetRun({
          origin:_this.origin,
          ele:item,
          obj:_this,
          bindData:_this.bindData[_this.bindName],
          bindName:i
        }));
      }
    });
    _this.jetArr.push(arr);
    _this.jetToolArr.push(toolArr);
  };
  function _refreshIndex(_this,o){
    var childs=_this.ele.child();
    for(var i=_countClen(_this.cLen,0,o);i<childs.length;i++){
    //for(var i=_this.cLen*(o);i<childs.length;i++){
      var index=Math.floor(i/_this.cLen);
      var c=childs[i];
      _refreshOneIndex(_this,c,index);
      var arr=[];
      arr.push(c.findAttr(_text));
      arr.push(c.findAttr(_input));
      arr.push(c.findAttr(_on));
      arr.push(c.findAttr(_if));
      arr.each(function(list){
        list.each(function(item){
          _refreshOneIndex(_this,item,index);
        });
      });
    }
  };
  function _countClen(clen,start,end){
    if(J.type(clen)=="number"){
      return clen*(end-start);
    }else{
      return clen.sum(start,end);
    }
  };
  function _refreshOneIndex(_this,c,index){
    if(c.jet!=undefined&&c.jet[0].par==_this){
      c.jet.each(function(item){
        switch(item.type){
          case "text":{
            var attr=c.attr(_text);
            if(attr=="$each"){
              item.bindName=index;
            }else if(attr=="$index"){
              item.bindName=index;
              item.bindIndex=index;
              item.refresh();
            }
          }break;
          case "input":{
            if(c.attr(_input)=="$each"){
              item.bindName=index;
            }
          }break;
          case "on":item.bindName=index;break;
          case "if":item.bindIndex=index;break;
          default:break;
        }
      });
    }
  };
  function _checkJetToolArr(opt,arr){
    if(opt.ele.hasAttr(_on)){
      if(opt.ele.hasJetOn!=true){
        arr.push(new JetOn(opt));
      }
    }
    if(opt.ele.hasAttr(_run)){
      if(opt.ele.hasJetRun!=true){
        arr.push(new JetRun(opt));
      }
    }
    if(opt.ele.hasAttr(_if)){
      if(opt.ele.hasJetIf!=true){
        arr.push(new JetIf(opt));
      }
    }
  }
  
  JetOn=function(opt){
    this.origin=opt.origin;
    this.par=opt.obj;
    this.ele=opt.ele;
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    opt.ele.hasJetOn=true;
    this.bindData=opt.bindData;//绑定的数据
    this.bindName=opt.bindName;
    this.bindIndex=opt.bindIndex;
    this.type="on";
    _initJetOn.call(this);
  };JetOn.prototype.get=function(){
    if(this.bindIndex!=undefined){
      return this.bindIndex;
    }
    return this.bindData[this.bindName];
  };JetOn.prototype.refresh=function(i){
    if(this.bindIndex!=undefined&&i!=undefined&&this.bindIndex!=i){
      this.bindIndex=i;
    }
    _initJetOn.call(this);
  };
  function _initJetOn(){
    var _this=this;
    var e=this.ele.attr(_on).split(":");
    this.ele.on(e[0],function(){
      //第一个是源数据 第二个是HTML元素 第三个绑定的数据 第四个是JetOn元素
      _this.origin.func[e[1]].call(_this.origin,this,_this.get(),_this,event);
    });
  }
  
  //exp:class[a,b|a,b]
  //exp:attr[a,b|a,b]
  JetIf=function(opt){
    this.par=opt.obj;
    this.ele=opt.ele;
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    opt.ele.hasJetIf=true;
    this.data=opt.data;//总的数据
    this.func=opt.func;//总的数据
    this.bindData=opt.bindData;//绑定的数据
    this.bindName;//绑定的名字
    this.bindIndex=opt.bindIndex;
    this.bindExp;
    this.type="if";
    this.func_true;
    this.func_false;
    _initJetIf.call(this);
    this.refresh();
  };JetIf.prototype.get=function(){
    var bool;
    if(this.bindName==null){
      if(this.bindIndex!=undefined){
        bool=this.bindExp(this.par.bindData[this.par.bindName][this.bindIndex]);
      }else{
        bool=this.bindExp(this.bindData);
      }
    }else{
      bool=this.bindData[this.bindName];
    }
    return bool;
  };JetIf.prototype.refresh=function(i){
    if(this.bindIndex!=undefined&&i!=undefined&&this.bindIndex!=i){
      this.bindIndex==i;
    }
    if(this.get()===true){
      this.func_true.call(this,this.ele,this.bindData[this.bindName]);
    }else{
      this.func_false.call(this,this.ele,this.bindData[this.bindName]);
    }
  };
  function _initJetIf(){
    var ifAttr=this.ele.attr(_if);
    var temp=ifAttr.substring(0,ifAttr.indexOf(":"));
    if(temp.has('$each')&&J.type(this.bindData)=="string"){
      this.bindName=null;
      temp=temp.replaceAll("\\$each","d");
      this.bindExp=new Function("d","return ("+temp+")");
    }else{
      if(temp in this.bindData){
        this.bindName=temp;
      }else{
        this.bindName=null;
        temp=temp.replaceAll("\\$","d.");
        this.bindExp=new Function("d","return ("+temp+")");
      }
    }
    ifAttr=ifAttr.substring(ifAttr.indexOf(":")+1);
    var _this=this;
    var func_t="";
    var func_f="";
    ifAttr.split(";").each(function(item){
      if(item.has("class[")){
        var cls=item.substring(item.indexOf("[")+1,item.length-1);
        if(cls.has("|")){
          var c1=cls.split("|")[0].split(",").join(" ");
          var c2=cls.split("|")[1].split(",").join(" ");
          func_t+="obj.removeClass('"+c2+"').addClass('"+c1+"');";
          func_f+="obj.removeClass('"+c1+"').addClass('"+c2+"');";
        }else{
          cls=cls.split(",").join(" ");
          func_t+="obj.addClass('"+cls+"');";
          func_f+="obj.removeClass('"+cls+"');";
        }
      }else if(item.has("attr[")){
        var attr=item.substring(item.indexOf("[")+1,item.length-1);
        if(attr.has("|")){
          attr.split("|")[0].split(",").each(function(a){
            var pv=a.split("=");
            if(pv.length==1){
              pv[1]="";
            }
            func_t+="obj.attr('"+pv[0]+"','"+pv[1]+"');";
          });
          attr.split("|")[1].split(",").each(function(a){
            var pv=a.split("=");
            if(pv.length==1){
              pv[1]="";
            }
            func_f+="obj.attr('"+pv[0]+"','"+pv[1]+"');";
          })
        }else{
          attr.split(",").each(function(a){
            var pv=a.split("=");
            if(pv.length==1){
              pv[1]="";
            }
            func_t+="obj.attr('"+pv[0]+"','"+pv[1]+"');";
            func_f+="obj.removeAttr('"+pv[0]+"');";
          });
        }
      }else if(item.has("text[")){
        var text=item.substring(item.indexOf("[")+1,item.length-1);
        if(text.has("|")){
          func_t+="obj.txt('"+text.split("|")[0]+"');";
          func_f+="obj.txt('"+text.split("|")[1]+"');";
        }else{
          func_t+="obj.txt('"+text+"');";
          func_f+="obj.txt('');";
        }
      }else if(item.has("html[")){
        var html=item.substring(item.indexOf("[")+1,item.length-1);
        if(html.has("|")){
          func_t+="obj.html('"+html.split("|")[0]+"');";
          func_f+="obj.html('"+html.split("|")[1]+"');";
        }else{
          func_t+="obj.html('"+html+"');";
          func_f+="obj.html('');";
        }
      }else{
        if(item.has("|")){
          item=item.split("|");
          if(item[0] in _this.par.func&&item[1] in _this.par.func){
            func_t+="this.func."+item[0]+".call(this,obj);";
            func_f+="this.func."+item[1]+".call(this,obj);";
          }else{
            throw new Error("j-if属性值错误")
          }
        }else{
          if(!(item in _this.par.func)){
            throw new Error("j-if属性值错误")
          }
          func_t+="this.func."+item+".call(this,obj);";
        }
      }
    });
    this.func_true=new Function("obj",func_t);
    this.func_false=new Function("obj",func_f);
  }
  
  //基本组成：输入
  JetInput=function(opt){
    this.par=opt.obj;
    this.ele=opt.ele;
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    opt.ele.hasJeted=true;
    this.origin=opt.origin;
    this.data=opt.data;//总的数据
    this.bindData=opt.bindData;//绑定的数据
    this.bindName=opt.bindName;//绑定的名字
    this.type="input";
    this.inputType=this.ele.attr(_type);
    var _this=this;
    this.ele.on("input",function(){
      _this.setData(this.val());
    });
    this.jetTools=[];
    _checkJetToolArr({
      origin:_this.origin,
      ele:_this.ele,
      obj:_this,
      bindData:_this.bindData,
      bindName:_this.bindName,
      data:_this.origin.data,
      func:_this.origin.func
    },this.jetTools);
    this.ele.val(this.bindData[this.bindName]);
  };JetInput.prototype.get=function(){
    return this.bindData[this.bindName];
  };JetInput.prototype.set=function(data){
    if(J.type(data)=="function"){
      data(this.bindData[this.bindName]);
    }else{
      this.bindData[this.bindName]=data;
    }
    this.refresh();
    this.par.refresh(this);
  };JetInput.prototype.refresh=function(){
    this.ele.val(this.bindData[this.bindName]);
    this.jetTools.each(function(item){
      item.refresh();
    });
  };JetInput.prototype.setData=function(val){
    val=(this.inputType=="number")?parseFloat(val):"`"+val+"`";
    if(J.type(this.bindName)=="string"){
      (new Function("data","data."+this.bindName+"="+val+""))(this.bindData);
    }else{
      (new Function("data","data["+this.bindName+"]="+val+""))(this.bindData);
    }
    this.par.refresh(this);
  };
  //基本组成：显示
  JetText=function(opt){
    this.par=opt.obj;
    this.ele=opt.ele;
    if(this.ele.txt()!=""){
      this.exp="return "+opt.ele.html();
    }
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    opt.ele.hasJeted=true;
    this.origin=opt.origin;
    this.data=opt.data;//总的数据
    this.bindData=opt.bindData;//绑定的数据
    this.bindName=opt.bindName;//绑定的名字
    this.bindIndex=opt.bindIndex;//绑定的索引 针对于for
    this.type="text";
    this.jetTools=[];
    _checkJetToolArr({
      origin:this.origin,
      ele:this.ele,
      obj:this,
      bindData:this.bindData,
      bindName:this.bindName,
      bindIndex:this.bindIndex,
      data:this.origin.data,
      func:this.origin.func
    },this.jetTools);
    _initJetText.call(this);
  };JetText.prototype.get=function(i){
    var d;
    if(this.bindIndex!=undefined){
      if(i!=undefined&&J.type(i)=="number"){
        this.bindIndex=i;
      }
      d=this.bindIndex;
    }else{
      d=(new Function("data","return data"))(this.bindData[this.bindName]);
    }
    return d;
  };JetText.prototype.set=function(data){
    if(J.type(data)=="function"){
      data(this.bindData[this.bindName]);
    }else{
      this.bindData[this.bindName]=data;
    }
    this.par.refresh();
  };JetText.prototype.getExpText=function(i){
    return (new Function("$value",this.exp))(this.get(i));
  };JetText.prototype.refresh=function(i){
    _initJetText.call(this,i);
    this.jetTools.each(function(item){
      item.refresh(i);
    });
  };
  function _initJetText(i){
    var txt;
    if(this.exp!=undefined){
      txt=this.getExpText(i);
    }else{
      txt=this.get(i);
    }
    this.ele.txt(txt);
  }
  //基本组成：自定义函数
  JetRun=function(opt){
    this.par=opt.obj;
    this.ele=opt.ele;
    if(this.ele.jet!=undefined){
      this.ele.jet.push(this);
    }else{
      this.ele.jet=[this];
    }
    opt.ele.hasJetRun=true;
    this.origin=opt.origin;
    this.bindData=opt.bindData;//绑定的数据
    this.bindName=opt.bindName;//绑定的名字
    this.bindIndex=opt.bindIndex;
    this.runs=this.ele.attr(_run).split(",");
    this.type="run";
    this.refresh();
  };JetRun.prototype.get=function(){
    if(this.bindIndex!=undefined){
      return this.bindIndex;
    }
    return this.bindData[this.bindName];
  };JetRun.prototype.refresh=function(i){
    var _this=this;
    if(this.bindIndex!=undefined&&i!=undefined&&this.bindIndex!=i){
      this.bindIndex==i;
    }
    this.runs.each(function(name){
      _this.origin.func[name].call(_this.origin,_this.ele,_this.get(),_this);
      //根JetBind元素，绑定的html元素，绑定的数据，绑定的jet元素
    });
  };JetRun.prototype.run=function(){
    this.refresh();
  };
})();
var Jet,JetFor,JetIf,JetInput,JetText,JetOn,JetRun;