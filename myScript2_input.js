myScript._input=function (id,width,height,ob) {
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

	//标题栏
	this.menu = document.createElement('div');
	this.menu.style.height = '20px';
	//this.menu.style.position = 'relative';
	this.menu.style.width = width+'px';
	this.menu.style.backgroundColor = '#999';
	this.menu.style.margin = 0;
	this.menu.innerHTML='编辑器使用的是markdown的标记了哦';
	this.root.appendChild(this.menu);

	//输入框的创建
	this.input = document.createElement('textarea');
	//this.input.style.position = 'relative';
	this.input.style.width = width/2 + 'px';
	this.input.style.margin = 0;
	this.input.style.height = height-40+'px';
	//this.input.style.backgroundColor = '#99F';
	this.input.contentEditable = 'true';//设置可写属性
	this.input.style.overflow = 'auto';//如果文字过多自动显示滚动条
	this.input.style.float='left';
	this.root.appendChild(this.input);

	//预览框的创建
	this.output = document.createElement('div');
	//this.input.style.position = 'relative';
	//this.output.style.width = width/2 + 'px';
	this.output.style.margin = 0;
	this.output.style.height = height-40+'px';
	//this.input.style.backgroundColor = '#99F';
	this.output.style.overflow = 'auto';//如果文字过多自动显示滚动条
	this.output.float='left';
	this.root.appendChild(this.output);

	//预览转换
	var out=this.output;var input=this.input;
	this.input.onkeydown=(function(){
		var i=0
		return function(ev){
			i++;
			setTimeout(function(){
				if(--i==0){
					myScript.marked(input.value,function(html){
						out.innerHTML=html;
					},ob)
				}
			},800);
			if(ev.keyCode==9){
				var s= this.selectionStart
				this.value = this.value.substring(0,s)+"\t"+this.value.substring(s);
				ev.preventDefault();
				 this.selectionStart=this.selectionEnd=s+1;
				return false;
			}
		}
	})();
	
	//状态栏
	this.s = document.createElement('div');
	this.s.style.height = '20px';
	//this.menu.style.position = 'relative';
	this.s.style.width = width+'px';
	this.s.style.backgroundColor = '#ddd';
	this.s.style.margin = 0;
	this.s.innerHTML='显示为sh代码';
	this.root.appendChild(this.s);

	//获取内容的方法
	this.get = function () {
		return this.input.value;
	}
	//强制更新内容的方法
	this.set = function (mk) {
		return this.input.value=mk;
	}
}