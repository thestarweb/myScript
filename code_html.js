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
	var cap,res="";
	while(string.length>0){
		cap=/^([\n\r\t ]|<li>|<\/li>)*/.exec(string);
		if(cap){
			res+=cap[0];
			string=string.substr(cap[0].length);
		}
		if(b&&string.indexOf('&lt;/script&gt;')==0){
			return {s:string,r:res};
		}
		cap=/^(?:(?:var|new|function|document|window|this|\d+|0x[\da-f]+)(?=\W)|(\/\/.*?)(<\/li>)|\+|-|\*|\/|=|("|').*?[^\\]\3|("|')\3)/i.exec(string);
		if(cap){
			if(cap[2]){
				res+='<span style="color:green;">'+cap[1]+'</span></li>';
			}else if(cap[3]){
				res+='<span style="color:green;">'+cap[0]+'</span>';
			}else{
				res+='<span style="color:';
				switch(cap[0]){
					case 'var':
						res+='#8A0';	
						break;
					case 'function':
						res+='#0A0';
						break;
					case 'new':
						res+='#A80';
						break;
					case 'document':
						res+='#80A';
						break;
					case '+':
					case '-':
					case '*':
					case '/':
					case '=':
						res+='orange';
						break;
					default:
						res+='#00F';
				}
				res+=';">'+cap[0]+'</span>';
			}
			string=string.substr(cap[0].length);
		}else if(b&&string.indexOf('&lt;/script&gt;')==0){
			return {s:string,r:res};
		}else{
			if(string){
				res+=string[0];
				string=string.substr(1);
			}
		}
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