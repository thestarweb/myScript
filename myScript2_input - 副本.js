myScript._input=function (id,width,height) {
	if(!ruler) ruler='';
	//外部div初始化
	if (!width || width < 200) {
		width =400;
	}
	if (!height || height < 100) {
		height = 140;
	}
	this.root = document.getElementById(id);
	this.root.style.height = height+'px';
	this.root.style.width = width + 'px';
	this.root.style.border = '1px solid #000';

	//菜单栏
	this.menu = document.createElement('div');
	this.menu.style.height = '20px';
	//this.menu.style.position = 'relative';
	this.menu.style.width = width+'px';
	this.menu.style.backgroundColor = '#999';
	this.menu.style.margin = 0;
	this.root.appendChild(this.menu);

	//输入框的创建
	this.input = document.createElement('div');
	//this.input.style.position = 'relative';
	this.input.style.width = width + 'px';
	this.input.style.margin = 0;
	this.input.style.height = height-40+'px';
	//this.input.style.backgroundColor = '#99F';
	this.input.contentEditable = 'true';//设置可写属性
	this.input.style.overflow = 'auto';//如果文字过多自动显示滚动条
	/*this.input.onkeydown=function(ev){
		if(ev.keyCode==13){
			return false;
		}
	}//实际上要做到这一点的是源码部分不过。。*/
	this.root.appendChild(this.input);
	
	//状态栏
	this.s = document.createElement('div');
	this.s.style.height = '20px';
	//this.menu.style.position = 'relative';
	this.s.style.width = width+'px';
	this.s.style.backgroundColor = '#ddd';
	this.s.style.margin = 0;
	this.s.innerHTML='显示为sh代码';
	this.root.appendChild(this.s);
	//显示sh源码
	this.pre=document.createElement('input');
	this.pre.type='checkbox';
	this.pre.onclick=(function(input){
		return function(){
			if(this.checked){
				input.set(input.get_sh());
			}else{
				input.set(myScript.sh_html(input.get(),ruler));
			}
		}
	})(this);
	this.pre.style.height=this.pre.style.width='15px';
	this.s.appendChild(this.pre);

	//获取内容的方法
	this.get = function () {
		return this.input.innerHTML;
	}
	//强制更新内容的方法
	this.set = function (html) {
		return this.input.innerHTML=html;
	}
	this.to_ubb=function(array){
		return myScript.html_to_ubb(this.get(),array);
	}
}