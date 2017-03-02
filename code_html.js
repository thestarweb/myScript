//document.write('<link rel="stylesheet" type="text/css" href="'+myScript.root+'mk/code_html.css" ><\/link>');
(function(){
	var d=$.set('link',$('head')[0]);
	d.type="text/css";
	d.rel="stylesheet";
	d.href=myScript.root+"mk/code_html.css";
})();
myScript.marked_code_css=function(string,b){
	var cap,ins=false,res="";
	while(string.length>0){
		cap=/^([\n\r\t ]|<li>|<\/li>)*/.exec(string);
		if(cap){
			res+=cap[0];
			string=string.substr(cap[0].length);
		}
		cap=ins?(/^([a-z]+)( *):( *)(.*?);/i).exec(string):/^(\.|#|)([a-z0-9]+|\*)( *|\t*)(\{|,)/i.exec(string);
		if(cap){
			//alert(ins?(/^(\.|#|)([a-z0-9]+|\*)( *|\t*)(\{|,)/i):/^([a-z]+)( *):( *)(.*?);/i)
			if(ins){
				res+='<span style="color:#A82;">'+cap[1]+cap[2]+'</span>:'+cap[3]+'<span style="color:#A40;">'+cap[4]+'</span>;';
			}else{
				res+='<span style="color:#A82;">'+cap[1]+cap[2]+'</span>'+cap[3]+cap[4];
				if(cap[4]=='{') ins=true;
			}
			string=string.substr(cap[0].length);
		}else if(b&&string.indexOf('&lt;/style&gt;')==0){
			return {s:string,r:res};
		}else{
			if(string[0]=='}') ins=false;
			res+=string[0];
			string=string.substr(1);
		}
	}
	return b?{s:'',r:res}:res;
}
myScript.marked_code_js=function(string,b){
	var cap,res="",color="";
	while(string.length>0){
		//空格与换行
		cap=/^([\n\r\t ]|<li>|<\/li>)*/.exec(string);
		if(cap){
			res+=cap[0];
			string=string.substr(cap[0].length);
		}
		//script结束标签
		if(b&&string.indexOf('&lt;/script&gt;')==0){
			return {s:string,r:res};
		}
		
		if(cap=/^((\/\/.*?)(?:<\/li>)|\/\*.*?\*\/)/.exec(string)){//注释
			type="zhushi";
		}else if(cap=/^((\+|-|\*|\/|=)|(while|if|else|do)(?=\W))/.exec(string)){//语法
			type="main";
		}else if(cap=/^(var|function)(?=\W)/.exec(string)){//keyword
			type="keywords";
		}else if(cap=/^(window|document)(?=\W)/.exec(string)){//objs
			type="obj";
		}else if(cap=/^(this|\d+|0(x|X)[\da-fA-F]+)(?=\W)/.exec(string)){//this number
			type="number";
		}
		if(type){
			res+='<span class="js_'+type+'">'+cap[0].replace(/<\/li><li>/g,'</span></li><li><span class="js_'+type+'">')+'</span>';
			type="";
		}else if(cap=/^(new )?(\w+(\.\w+)*)(?=\()/.exec(string)){
			console.log(cap);
			var list=cap[2].split('.');
			if(cap[1]=='new ')res+='<span class="js_new">new</span> ';
			for(var i=0;i<list.length-1;i++) res+='<span class="js_obj_head">'+list[i]+'</span>.';
			res+='<span class="js_obj_last">'+list.pop()+'</span>';
		}else if(cap=/^([\$_\w][_\w0-9]*|.)/.exec(string)){
			res+=cap[0];
		}else{
			continue;
		}
		string=string.substr(cap[0].length);
	}
	return b?{s:'',r:res}:res;
}
myScript.marked_code_html=function(string){
	//res=string.replace(/^<li>(&lt;!DOCTYPE.+?&gt;)/i,'<li><span style="color:#00F">$1</span>');
	var cap=/^<li>(&lt;!DOCTYPE.+?&gt;)/i.exec(string);	
	var b_type='',res='';
	if(cap){
		res='<li><span style="color:#00F">'+cap[1]+'</span>';
		string=string.substr(res.length-32);
	}
	while(string.length>0){
		//	console.log(res,string)
		cap=/^(.*?)(&lt;\/?)([a-z0-9]+)/i.exec(string);
		if(!cap){
			res+=string;
			break;
		}
		string=string.substr(cap[0].length);
		res+=cap[1]+'<span style="color:';
		switch (cap[3]){
			case 'style':
				res+='#A82';
				if(cap[2].length==4)b_type="style";
				break;
			case 'html':
			case 'head':
			case 'body':
				res+='#00F';
				break;
			case 'script':
				res+='#A00';
				if(cap[2].length==4)b_type="script";
				break;
			default:
				res+='#F80';
		}
		res+=';">'+cap[2]+cap[3];
		while(true){
			cap=/^(.*?)("|&gt;)/i.exec(string);
			if(!cap&&!cap[0]) break;
			if(cap[2]=='&gt;'){//alert(cap);alert(string)
				res+=cap[0];
				string=string.substr(cap[0].length);
				break;
			}
			res+=cap[1];
			string=string.substr(cap[0].length-1);
			cap=/^"(.*?[^\\]|)"/.exec(string);
			res+='<span style="color:#2D2;">'+cap[0]+'</span>';
			string=string.substr(cap[0].length);
		}
		res+="</span>";
		if(b_type=="style"){
			var temp=myScript.marked_code_css(string,true);
			string=temp.s;
			res+=temp.r;
			b_type='';
		}else if(b_type=="script"){
			var temp=myScript.marked_code_js(string,true);
			string=temp.s;
			res+=temp.r;
			b_type='';
		}
	}
	return res;
}