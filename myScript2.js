var myScript = {
	root:(function(){
		try{
			return document.currentScript.src.substr(0,document.currentScript.src.lastIndexOf('/')+1);
		}catch(e){
			for(var i=document.scripts.length;i>0;i--){
				if(document.scripts[i-1].src.indexOf("myScript2.js")>-1){
					return document.scripts[i-1].src.substring(0,document.scripts[i-1].src.lastIndexOf("/")+1);
				}
			}
		}
		return '';
	})(),
	getCaller:function(len){
		if(!len) var res=[];
		var caller=arguments.callee.caller;
		for(var i=0;i<len||!len&&caller;i++){
			if(!len){
				res.push(caller.toString());
			}
			caller=caller.arguments.callee.caller;
		}
		return len?(caller?caller.toString():main):res;
	},
	include:function(src){
		if(src.indexOf('//')<0) src=this.root+src;
		//document.write('<script src="'+this.root+src+'" ><\/script>');
		var s=myScript.set_dom('script',document.body);
		s.src=src;
		/*var ajax=myScript.ajax();
		ajax.keep=true;
		ajax.page=this.root+src;
		ajax.type='GET';
		ajax.callback=function(ajax){
			eval(ajax.text);
		}
		ajax.send();*/
		return s;
	},
	include_once:function(src){
		if(src.indexOf('//')<0) src=this.root+src;
		var list=this.$get('script');
		for(var i=0;i<list.length;i++){
			if(list[i].src==src) return list[i];
		}
		return this.include(src);
	},
	marked:function(mk,fun,ob){
		//mk=mk.replace('$',"\n\n$");
		if(ob){
			for(var i in ob){
				mk=mk.replace(new RegExp('\\{\\$'+i+'\\}','g'),ob[i]);
			}
		}
		if(typeof(marked)!='function'){
			var s=this.include_once('marked.js');
			s.addEventListener('load',function(){
				fun(marked(mk));
			});
		}else{
			fun(marked(mk));
		}
	},
	marked_html:function(dom){
		if(this.marked_code_js) dom.innerHTML=this.marked_code_html(dom.innerHTML);
		else this.include_once('code_html.js').addEventListener('load',function(){
			dom.innerHTML=myScript.marked_code_html(dom.innerHTML);
		});
	},
	marked_js:function(dom){
		if(this.marked_code_js) dom.innerHTML=this.marked_code_js(dom.innerHTML);
		else this.include_once('code_html.js').addEventListener('load',function(){
			dom.innerHTML=myScript.marked_code_js(dom.innerHTML);
		});
	},
	marked_dom:function(dom,ob,mk){
		if(!mk) mk=dom.innerHTML;
		dom.className+=" mk";
		this.marked(mk.replace('&lt;','<').replace('&gt;','>'),function(res){
			dom.innerHTML=res;
			var codes=myScript.$get('code',dom);
			for(var i=0;i<codes.length;i++){
				switch(codes[i].className.toLowerCase()){
					case 'lang-html':
						myScript.marked_html(codes[i].firstChild);
						break;
					case 'lang-javascript':
					case 'lang-js':
						myScript.marked_js(codes[i].firstChild);
						break;
				}
			}
		},ob)
	},
	marked_langs:function(dom,langPrefix){
		if(!langPrefix) langPrefix=''
		var codes=myScript.$get('code',dom);
		for(var i=0;i<codes.length;i++){
			switch(codes[i].className.toLowerCase()){
				case langPrefix+'html':
					myScript.marked_html(codes[i].firstChild);
					break;
				case langPrefix+'javascript':
				case langPrefix+'js':
					myScript.marked_js(codes[i].firstChild);
					break;
			}
		}
	},
	copyTo:function(from,to){//实现马甲对象
		for(var i in from){
			to[i]=from[i];
		}
	},
	input:function(id,width,height,ruler,body){
		if(myScript._input){
			myScript.copyTo(new myScript._input(id,width,height,ruler,body),this);
			return;
		}
		var s=myScript.include_once('myScript2_input.js');
		//this={get:function(){alert('load_error')}};
		var temp=this;
		s.addEventListener('load',function(){
			myScript.copyTo(new myScript._input(id,width,height,ruler,body),temp);
		});
	},

	in_array: function(str,arr){
		for(i=0;i<arr.length;i++){   
			if(arr[i] == str) return true;
		}
		return false; 
	},
	remove_from_array: function(arr,value){

		for(var i=0; i<arr.length;i++){
			if(arr[i]==value){
				delete(arr[i]);
				return true;
			}
		}
		return false;
	},

	getajax: function () {
		if (window.ActiveXObject) {
			this.ajax = new ActiveXObject("Microsoft.XMLHTTP");
		} else {
			this.ajax = new XMLHttpRequest();
		}
		this.setHead = true;
		this.setCont = function (obj) {
			var str = '';
			for (k in obj) {
				str += k + '=' + encodeURIComponent(obj[k]) + '&';
			}
			this.data = str;
		}
		this.send = function () {
			if (!this.page) {
				return;
			}
			if (!this.data) {
				this.data = null;
			}
			if (!this.type) {
				this.type = this.data?'POST':"GET";
			}
			this.ajax.open(this.type, this.page,this.keep?false:true);
			//定义http头
			if(this.setHead){
				this.ajax.setRequestHeader("content-type", "application/x-www-form-urlencoded");
			};
			//this.ajax.setRequestHeader('X_REQUESTED_WITH','ajax');
			if(this.withCredentials)this.ajax.withCredentials = true;
			//回调函数
			this.ajax.onreadystatechange =(function(obj){
				return function () {
					if (obj.ajax.readyState == 4) {
						if (obj.ajax.status == 200) {
							if (obj.callback) {
								obj.ajax.text = obj.ajax.responseText;
								try{
									if(JSON&&JSON.parse){
										obj.ajax.json=JSON.parse(myScript.strip_json_comments(obj.ajax.text));
									}else{
										obj.ajax.json=eval('('+decodeURI(obj.ajax.text)+')');
									}
								}catch(e){
									debugger
									console.log(obj.ajax.text,myScript.strip_json_comments(obj.ajax.text))
									obj.ajax.json=false;
								}
								obj.callback(obj.ajax);
							}
						} else {
							console.log('ajax故障' + "\n" +  obj.ajax.status + '未收到服务器数据');
						}
					}
				}
			})(this)
			//发送请求
			this.ajax.send(this.data);
		}
	},
	ajax: function () {
		return new this.getajax();
	},
	fast_ajax:function(page,back,data){
		var ajax=this.ajax();
		ajax.page=page;
		if(back)ajax.callback=back;
		data&&ajax.setCont(data);
		ajax.send();
	},
	strip_json_comments:function(data){
		var line=0;c=0;
		var flag="";
		var l_flag="";
		var res="";
		for(var i=0;i<data.length;i++){
			c++;
			if(data[i]=="\n"){
				c=-1;
				line++;
			}
			if(data[i]=="/")console.log(flag);
			if(flag=="/"){
				if(data[i]=="\n"){
					flag="";
				}
			}else if(flag=="*"){
				if(l_flag=="*"&&data[i]=="/"){
					flag="";
				}else{
					l_flag=data[i];
				}
			}else{
				//非注释
				if(l_flag!="\\"){
					if(l_flag=="/"){
						if(data[i]=="/"){
							//行注释开始
							flag="/";
							l_flag="";
							continue;
						}
						if(data[i]=="*"){
							//行注释开始
							flag="*";
							l_flag="";
							continue;
						}
						res+="/"
					}
					if(data[i]==flag){
						console.log("end",data.substr(i,5),line,c)
						flag="";
					}else if((data[i]=="\""||data[i]=="'")&&flag==""){
						console.log("start",data.substr(i,5),line,c)
						flag=data[i];
					}
					l_flag="";
					if(flag==""){
						if(data[i]=="/"){
							l_flag="/"
							continue;
						}
					}
					if(data[i]=="\\"){
						l_flag="\\";
					}
				}else{
					l_flag="";
				}
				res+=data[i];
			}
		}
		return res;
	},
	//names 选择器,p父节点,flag标记递归调用
	$get:function(names,p,flag){
		p=p||document;//从哪个节点取

		//有多重选择器
		if(names.indexOf(",")>0){
			var res=[],list=names.split(",");
			for(var i=0;i<list.length;i++){
				var c=this.$get(list[i],p,true);
				if(c){
					if(list[i].indexOf(" ")==-1&&list[i][0]=="#"){
						res[res.length]=c;
					}else{
						res=res.concat(Array.prototype.slice.call(c,0));//把子节点组转换成数组合并进数组
					}
				}
			}
			dom=res;
		}else{
			var index,dom;
			if((index=names.indexOf(' '))>0){//是否有子选择器
				name=names.substr(0,index);
			}else{
				name=names;
			}
			if (name[0] == '#') {
				dom= p.getElementById(name.substr(1));
				if(names.length==name.length){
					return dom;
				}else{
					dom=[dom];
				}
			} else if (name[0] == '.') {
				dom=p.getElementsByClassName(name.substr(1));
			} else if (name[0] == '@') {
				dom=p.getElementsByName(name.substr(1));
			} else {
				dom=p.getElementsByTagName(name);
			}
			if(names.length!=name.length){
				var res=[];
				for(var i=0;i<dom.length;i++){
					res=res.concat(Array.prototype.slice.call(this.$get(names.substr(index+1),dom[i],true),0));//把子节点组转换成数组合并进数组
				}
				dom=res;
			}
		}
		if(!flag){//递归调用最外层
			dom.set=function (name,value,nu){
				for(var i=0;this[i];i++){
					if(!nu){
						this[i][name]=value;
					}else if(myScript.in_array(i,nu)){
						this[i][name]=value;
					}
				}
				return this;
			}
			dom.set_style=function (name,value,nu){
				for(var i=0;this[i];i++){
					if(!nu){
						this[i].style[name]=value;
					}else if(myScript.in_array(i,nu)){
						this[i].style[name]=value;
					}
				}
				return this;
			}
		}
		return dom;
	},
	set_dom:function(type,p){
		new_dom=document.createElement(type)
		p.appendChild(new_dom);
		return new_dom;
	},
	remove_dom:function(dom){
		dom.parentNode.removeChild(dom);
	},
	show:function(html,w,h,u_title){
		var win={};
		win.onoff=function(){};
		var box={};
		if(!w) w=150;
		if (window.innerWidth<w) {
			w=window.innerWidth*0.9;
		}
		if(!h) h=100;
		var bg=$.set('div',$('body')[0]);
		bg.style.background = 'rgba(100,100,100,0.5)';
		bg.style.position = 'fixed';
		bg.style.top = 0;
		bg.style.left = 0;
		bg.style.width = '100%';
		bg.style.height = '100%';
		box.off=function(){
			$('body')[0].removeChild(bg);
			win.onoff();
		}
		var input_box=$.set('div',bg);
		input_box.style.position = 'fixed';
		input_box.style.background='#FFF';
		input_box.style.top='45%';
		input_box.style.left='50%';
		input_box.style.width=w+'px';
		input_box.style.height=h+'px';
		input_box.style.marginLeft=-w/2+'px';
		input_box.style.marginTop=-h/2+'px';
		var title=$.set('div',input_box);
		title.innerHTML=u_title?u_title:'来自网页的消息';
		title.style.textAlign='center';
		title.style.background='rgb(100,100,255)';
		title.style.height='25px';
		var off=$.set('div',title);
		off.innerHTML='关闭';
		off.style.float='right';
		off.onclick=function(){
			box.off();
		};
		var body=$.set('div',input_box);
		body.innerHTML+=html;
		win.off=function(){
			box.off();
		}
		body.style.overflow='auto';
		body.style.height=(h-25)+'px';
		return win;
	},
	message:(function(){
		var mlist=[],r=0,timeout=null;
		var remove=function(){	
			myScript.remove_dom(mlist.shift()[4]);
		}
		var moveup=function(endi,h){
			for(var i=0;i<endi;i++){
				mlist[i][5]+=h;
				mlist[i][4].style.bottom=(50+mlist[i][5])+'px';
			}
		}
		var move=function(){
			for(var i in mlist){
				mlist[i][3]+=10
				if(mlist[i][3]<10){
					mlist[i][4].style.right=mlist[i][3]+'px';
				}else if(mlist[i][3]<50){
					moveup(i,10);
					mlist[i][4].style.right='5px';
					mlist[i][4].style.height=mlist[i][3]+'px';
				}else if(mlist[i][3]>2500){
					remove();
				}
			}
			timeout=setTimeout(move,20);
		}
		var next=function(now){
			moveup(mlist.length,5);
			var dom=myScript.set_dom('div',myScript.$get('body')[0]);
			dom.innerHTML='<div style="font-size:18px;">'+now[0]+'</div>'+now[1];
			dom.style.background=now[2];
			dom.style.fontSize='12px';
			dom.style.lineHeight='20px';
			dom.style.height='0px';
			if(navigator.userAgent.indexOf('moblie')&&document.body.offsetWidth<400){
				dom.style.width='95%';
				dom.style.right='-290px';
				dom.style.top='1px';
			}else{
			dom.style.width='290px';
			dom.style.right='-290px';
			dom.style.bottom='50px';
			}
			dom.style.color='#FFF';
			dom.style.overflow='hidden';
			dom.style.border='2px solid #000';
			dom.style.position='fixed';
			now.push(-290);
			now.push(dom);
			now.push(0);
			mlist.push(now);
			if(!timeout) move();
		}
		return function(title,html,color){
			if(!color) color='#08F';
			mlist.push();
			next([title,html,color]);
		}
	})(),
	get_os:function(str){
		if(!str) str=navigator.userAgent;
		if(/Xbox One/gi.exec(str)) return 'Xbox One(windows8)';
		if(/Xbox/gi.exec(str)) return 'Xbox360(windows7)';
		var new_str=/windows nt \d+.\d+/gi.exec(str);
		if(new_str){
			switch(new_str[0].toLowerCase()){
				case 'windows nt 5.0':
					return 'windows 2000';
				case 'windows nt 5.1':
					return 'windows xp';
				case 'windows nt 5.2':
					return 'windows 2003';
				case 'windows nt 6.0':
					return 'windows Vista ';
				case 'windows nt 6.1':
					return 'windows7';
				case 'windows nt 6.2':
					return 'windows8';
				case 'windows nt 6.3':
					return 'windows8.1';
				case 'windows nt 6.4':
				case 'windows nt 10.0':
					return 'windows10';
				default:
					return new_str[0];
			}
		}
		new_str=/Windows Phone (OS )?\d+.\d+/gi.exec(str);
		if(new_str) return new_str[0];
		new_str=/Android( ?\d\.?)*/gi.exec(str);
		if(new_str) return new_str[0];
		new_str=/linux( ?\d\.?)*/gi.exec(str);
		if(new_str) return new_str[0];
		if(str.indexOf('iPhone')>0) return 'iPhone';
		if(str.indexOf('Mac OS X')>0) return 'Mac OS X';
		return '未知系统';
	},
	get_browser:function(str){
		if(!str) str=navigator.userAgent;
		if(str.indexOf('Edge')>0) return 'Edge';
		new_str=/MSIE (\d+.\d+)/gi.exec(str);
		if(new_str) return 'IE'+new_str[1];
		new_str=/Firefox\/(\d+.\d+)/gi.exec(str);
		if(new_str) return '火狐'+new_str[1];
		var new_str=/Chrome\/(\d+.\d+)/gi.exec(str);
		if(new_str) return 'Chrome'+new_str[1];
		var new_str=/rv:(\d+.\d+)/gi.exec(str);
		if(new_str) return 'IE'+new_str[1];
		return '未知浏览器';
	},

	//基于在前端的模板返回HTML
	template_list:{},
	template_init:function(){
		var templatess=myScript.$get("templates");
		for(var i=0;i<templatess.length;i++){
			var templates=myScript.$get("template",templatess[i]);
			for(var j=0;j<templates.length;j++){
				var template=templates[j];
				this.template_list[template.getAttribute("name")]=template.innerHTML;
			}
			myScript.remove_dom(templatess[i]);
		}
	},
	template_get_html:function(name,obj){
		//var dom=myScript.$get("#__"+name+"__");
		if(!this.template_list[name]){
			console.log("cannot fount template "+name);
			return;
		}
		var html=this.template_list[name];
		for(var i in obj){
			html=html.replace(new RegExp("\{"+i+"\}","g"),obj[i]);
		}
		var self=this;
		html=html.replace(/@__([a-z0-9_]+)__(#[a-z0-9_]+=[a-z0-9]+)*/gi,function(a,b){
			if(b==name){
				console.log("cannot use self in "+name);
				return "";
			}
			var data_s=a.split("#"),data={};
			for(var i=1;i<data_s.length;i++){
				var temp=data_s[i].split("=");
				data[temp[0]]=temp[1];
			}
			return self.template_get_html(b,data);
		});
		return html;
	},
};
(function(){
	var isload=false;
	window.addEventListener('load',function(){
		isload=true;
	});
 $=function(s) {
	if (typeof (s) == 'string') {
		return myScript.$get(s);
	}else if(typeof (s) == 'function'){
		if(isload){
			s();
		}else{
			window.addEventListener('load',s);
		}
	}
};
})();
$.input=function(id,w,h){
	return new myScript.input(id,w,h);
};
$.ajax=function(){
	return new myScript.getajax();
}
$.set=function(type,p){
	return myScript.set_dom(type,p);
}
$.remove=myScript.remove_dom;
