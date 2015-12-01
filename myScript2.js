var myScript = {
	root:'',//document.currentScript.src.substr(0,document.currentScript.src.lastIndexOf('/')+1),
	include:function(src){
		var s=document.getElementsByTagName('script');
		for (var i = 0; i < s.length; i++) {
			if(s[i].src==src) return;
		}
		//document.write('<script src="'+this.root+src+'" ><\/script>');
		var s=myScript.set_dom('script',document.body);
		s.src=this.root+src;
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
	marked:function(mk,fun,ob){
		//mk=mk.replace('$',"\n\n$");
		if(ob){
			for(var i in ob){
				mk=mk.replace(new RegExp('\\{\\$'+i+'\\}','g'),ob[i]);
			}
		}
		if(typeof(marked)!='function'){
			var s=this.include('marked.js');
			s.onload=function(){
				fun(marked(mk));
			}
		}else{
			fun(marked(mk));
		}
	},
	copyTo:function(from,to){//实现马甲对象
		for(var i in from){
			to[i]=from[i];
		}
	},
	input:function(id,width,height,ruler){
		if(myScript._input){
			myScript.copyTo(new myScript._input(id,width,height,ruler),this);
			return;
		}
		var s=myScript.include('myScript2_input.js');
		//this={get:function(){alert('load_error')}};
		var temp=this;
		s.onload=function(){
			myScript.copyTo(new myScript._input(id,width,height,ruler),temp);
		}
	},
	html_to_ubb:function(html,array){
		if(typeof(html)!='string') return false;
		if(typeof (array)=='string'){
			array=[array];
		}
		if(array){
			for (var i in array) {
				eval('html=html.replace(/<'+array[i]+'(.*?)>(.*?)<\\/'+array[i]+'>/gi,"['+array[i]+'$1]$2[/'+array[i]+']")');
				eval('html=html.replace(/<'+array[i]+'(.*?)>/gi,"['+array[i]+'$1]")');
			};
		}
		ubb=html.replace(/<.*?>/gi,"");
		return ubb;
	},
	ubb_to_html:function(ubb,array){
		if(typeof(ubb)!='string') return false;
		if(typeof (array)=='string'){
			array=[array];
		}
		if(array){
			for (var i in array) {
				eval('ubb=ubb.replace(/\\['+array[i]+'(.*?)\\](.*?)\\[\\/'+array[i]+'\\]/gi,"<'+array[i]+'$1>$2</'+array[i]+'>")');
				eval('ubb=ubb.replace(/\\['+array[i]+'(.*?)\\]/gi,"<'+array[i]+'$1>")');
			};
		}
		html=ubb.replace(/\[.*?\]/gi,"");
		return html;
	},
	html_sh:function(html,ruler){
		var ruler_array=ruler.split(";");
		for(i in ruler_array){
			if(!ruler_array[i]) continue;//拆分导致的空规则
			var a_ruler=ruler_array[i].split(":");//一条规则
			reg=eval('/<'+a_ruler[0]+'( [a-z]+\=(?:\'|\").+(?:\'|\"))* ?(>.*?<\\/'+a_ruler[0]+'>|\\/?>)/gi');
		//alert(reg);
			html=html.replace(reg,function(a){
				//alert(a)
				var strs=a.split(/(?:<|>)/gi);
				var b=strs[1].split(' ');
				var news='['+b[0];
				var c;
				//拆分出的数组第一位为空   格式类似\0<\1>\2(<\3>\4)
				if(b[1]){
					if(a_ruler.length>=2){//对参数有要求
						b=b[1].split(' ');//拆分参数
						c_ruler=a_ruler[1].split(',');//参数规则
						for(var j=0;j<b.length;j++){
							//alert(b[j]);
							if(myScript.in_array(b[j].split('=')[0],c_ruler)){//允许的参数才拼接
								news+=' '+b[j];
							}
						}
					}else {//对参数无要求，直接通过
						for(var k=1;k<b.length;k++){
							news+=' '+b[k];
						}
					}
				}
				if(strs[2]||strs[3]){
					if(strs[3]){
						news+=']'+strs[2]+'['+strs[3]+']';
					}else if(strs[2][0]=='/'){
						news+=']['+strs[2]+']';
					}else{
						news+=']'+strs[2];
					}
				}else{
					news+=']';
				}
				//alert(news);
				return news;
			});
		}
			return html.replace(/<.*?>/gi,"");
	},
	sh_html:function(sh,ruler){
		//alert(ruler);//return 123;
		var ruler_array=ruler.split(";");
		//alert(1);
		for(i in ruler_array){
			if(!ruler_array[i]) continue;//拆分导致的空规则
			var a_ruler=ruler_array[i].split(":");//一条规则
			//alert(a_ruler);
			reg=eval('/\\['+a_ruler[0]+'( [a-z]+\=(?:\'|\").+(?:\'|\"))* ?(\\].*?\\[\\/'+a_ruler[0]+'\\]|\\/?\\])/gi');
			//alert(reg);
			sh=sh.replace(reg,function(a){
				var strs=a.split(/\[|\]/gi);
				//alert(strs);
				var b=strs[1].split(' ');
				var news='<'+b[0];
				var c;
				//拆分出的数组第一位为空   格式类似\0<\1>\2(<\3>\4)
				if(b[1]){
					if(a_ruler.length>=2){//对参数有要求
						b=b[1].split(' ');//拆分参数
						c_ruler=a_ruler[1].split(',');//参数规则
						for(var j=0;j<b.length;j++){
							//alert(b[j]);
							if(myScript.in_array(b[j].split('=')[0],c_ruler)){//允许的参数才拼接
								news+=' '+b[j];
							}
						}
					}else {//对参数无要求，直接通过
						for(var k=1;k<b.length;k++){
							news+=' '+b[k];
						}
					}
				}
				if(strs[2]||strs[3]){
					if(strs[3]){
						news+='>'+strs[2]+'<'+strs[3]+'>';
					}else if(strs[2][0]=='/'){
						news+='><'+strs[2]+'>';
					}else{
						news+='>'+strs[2];
					}
				}else{
					news+='>';
				}
				//alert(news);
				return news;
			});
		}
			return sh;
	},

	in_array: function(str,arr){
		for(i=0;i<arr.length;i++){   
			if(arr[i] == str) return true;
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
				this.type = 'POST';
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
									obj.ajax.json=eval('('+decodeURI(obj.ajax.text)+')');
								}catch(e){
									obj.ajax.json=false;
								}
								obj.callback(obj.ajax);
							}
						} else {
							alert('ajax故障' + "\n" + '未收到服务器数据');
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
	$get:function(name){
		if (name[0] == '#') {
			return document.getElementById(name.substr(1));
		} else if (name[0] == '.') {
			var dom=document.getElementsByClassName(name.substr(1));
		} else if (name[0] == '@') {
			var dom=document.getElementsByName(name.substr(1));
		} else {
			var dom=document.getElementsByTagName(name);
		}
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
		new_str=/MSIE (\d+.\d+)/gi.exec(str);
		if(new_str) return 'IE'+new_str[1];
		new_str=/Firefox\/(\d+.\d+)/gi.exec(str);
		if(new_str) return '火狐'+new_str[1];
		var new_str=/Chrome\/(\d+.\d+)/gi.exec(str);
		if(new_str) return 'Chrome'+new_str[1];
		var new_str=/rv:(\d+.\d+)/gi.exec(str);
		if(new_str) return 'IE'+new_str[1];
		return '未知浏览器';
	}
};
try{
	myScript.root=document.currentScript.src.substr(0,document.currentScript.src.lastIndexOf('/')+1);
}catch(e){
	for(var i=document.scripts.length;i>0;i--){
		if(document.scripts[i-1].src.indexOf("myScript2.js")>-1){
			myScript.root=document.scripts[i-1].src.substring(0,document.scripts[i-1].src.lastIndexOf("/")+1);
			break;
		}
	}
}
function $(s) {
	if (typeof (s) == 'string') {
		return myScript.$get(s);
	}
};
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