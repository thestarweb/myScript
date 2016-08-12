//document.write('<link rel="stylesheet" type="text/css" href="'+myScript.root+'mk/mk.css" ><\/link>');
(function(){
	var s=myScript.set_dom('link',document.body);
		s.rel="stylesheet";
		s.type="text/css";
		s.href=myScript.root+"mk/mk.css";
})();

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 *
 * redevelope for thestarweb/myscript by star
 */
;(function(){
	var block={
		newline:/^\n+/,
		code:/^( {4}[^\n]+\n*)+/,
		fences:noop,
		hr:/^( *[-*_]){3,} *(?:\n+|$)/,
		heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
		nptable:noop,
		lheading:/^([^\n]+)\n *(=|-){3,} *\n*/,
		blockquote:/^( *>[^\n]+(\n[^\n]+)*\n*)+/,
		list:/^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
		html:/^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
		def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
		table:noop,
		paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
		text:/^[^\n]+/
	};
	block.bullet=/(?:[*+-]|\d+\.)/;
	block.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item=replace(block.item,'gm')(/bull/g,block.bullet)();
	block.list=replace(block.list)(/bull/g,block.bullet)('hr',/\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)();
	block._tag='(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';
	block.html=replace(block.html)('comment',/<!--[\s\S]*?-->/)('closed',/<(tag)[\s\S]+?<\/\1>/)('closing',/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,block._tag)();
	block.paragraph=replace(block.paragraph)('hr',block.hr)('heading',block.heading)('lheading',block.lheading)('blockquote',block.blockquote)('tag','<'+block._tag)('def',block.def)();
	block.normal=merge({},block);
	block.gfm=merge({},block.normal,{
		fences:/^ *(`{3,}|~{3,}) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
		paragraph:/^/
	});
	block.gfm.paragraph=replace(block.paragraph)('(?!','(?!'+block.gfm.fences.source.replace('\\1','\\2')+'|')();
	block.tables=merge({},block.gfm,{
		nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
		table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});
	function Lexer(options){
		this.tokens=[];
		this.tokens.links={};
		this.options=options||marked.defaults;
		this.rules=block.normal;
		if(this.options.gfm){
			if(this.options.tables){
				this.rules=block.tables;
			}else{
				this.rules=block.gfm;
			}
		}
	}
	Lexer.rules=block;
	Lexer.lex=function(src,options){
		var lexer=new Lexer(options);
		return lexer.lex(src);
	};
	Lexer.prototype.lex=function(src){
		src=src.replace(/\r\n|\r/g,'\n').replace(/\u00a0/g,' ').replace(/\u2424/g,'\n');
		return this.token(src,true);
	};
	Lexer.prototype.token=function(src,top){
		var src=src.replace(/^ +$/gm,''),next,loose,cap,bull,b,item,space,i,l;
		while(src){
			if(cap=this.rules.newline.exec(src)){
				src=src.substring(cap[0].length);
				if(cap[0].length>1){
					this.tokens.push({type:'space'});
				}
			}
			if(cap=this.rules.code.exec(src)){
				src=src.substring(cap[0].length);
				cap=cap[0].replace(/^ {4}/gm,'');
				this.tokens.push({
					type:'code',
					text:!this.options.pedantic?cap.replace(/\n+$/,''):cap
				});
				continue;
			}
			if(cap=this.rules.fences.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({
					type:'code',
					lang:cap[2],
					text:cap[3]
				});
				continue;
			}
			if(cap=this.rules.heading.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({
					type:'heading',
					depth:cap[1].length,
					text:cap[2]
				});continue;
			}
			if(top&&(cap=this.rules.nptable.exec(src))){
				src=src.substring(cap[0].length);
				item={
					type:'table',
					header:cap[1].replace(/^ *| *\| *$/g,'').split(/ *\| */),
					align:cap[2].replace(/^ *|\| *$/g,'').split(/ *\| */),
					cells:cap[3].replace(/\n$/,'').split('\n')
				};
				for(i=0;i<item.align.length;i++){
					if(/^ *-+: *$/.test(item.align[i])){
						item.align[i]='right';
					}else if(/^ *:-+: *$/.test(item.align[i])){
						item.align[i]='center';
					}else if(/^ *:-+ *$/.test(item.align[i])){
						item.align[i]='left';
					}else{
						item.align[i]=null;
					}
				}
				for(i=0;i<item.cells.length;i++){
					item.cells[i]=item.cells[i].split(/ *\| */);
				}
				this.tokens.push(item);
				continue;
			}
			if(cap=this.rules.lheading.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({
					type:'heading',
					depth:cap[2]==='='?1:2,
					text:cap[1]
				});
				continue;
			}
			if(cap=this.rules.hr.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({type:'hr'});
				continue;
			}
			if(cap=this.rules.blockquote.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({type:'blockquote_start'});
				cap=cap[0].replace(/^ *> ?/gm,'');
				this.token(cap,top);
				this.tokens.push({type:'blockquote_end'});
				continue;
			}
			if(cap=this.rules.list.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({
					type:'list_start',
					ordered:isFinite(cap[2])
				});
				cap=cap[0].match(this.rules.item);
				if(this.options.smartLists){
					bull=block.bullet.exec(cap[0])[0];
				}
				next=false;
				l=cap.length;
				for(var i=0;i<l;i++){
					item=cap[i];
					space=item.length;
					item=item.replace(/^ *([*+-]|\d+\.) +/,'');
					if(~item.indexOf('\n ')){
						space-=item.length;
						item=!this.options.pedantic?item.replace(new RegExp('^ {1,'+space+'}','gm'),''):item.replace(/^ {1,4}/gm,'');
					}
					if(this.options.smartLists&&i!==l-1){
						b=block.bullet.exec(cap[i+1])[0];
						if(bull!==b&&!(bull[1]==='.'&&b[1]==='.')){
							src=cap.slice(i+1).join('\n')+src;i=l-1;
						}
					}
					loose=next||/\n\n(?!\s*$)/.test(item);
					if(i!==l-1){
						next=item[item.length-1]==='\n';
						if(!loose) loose=next;
					}
					this.tokens.push({type:loose?'loose_item_start':'list_item_start'});
					this.token(item,false);
					this.tokens.push({type:'list_item_end'});
				}
				this.tokens.push({type:'list_end'});
				continue;
			}
			if(cap=this.rules.html.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({
					type:this.options.sanitize?'paragraph':'html',
					pre:cap[1]==='pre',
					text:cap[0]
				});
				continue;
			}
			if(top&&(cap=this.rules.def.exec(src))){
				src=src.substring(cap[0].length);
				this.tokens.links[cap[1].toLowerCase()]={href:cap[2],title:cap[3]};
				continue;
			}
			if(top&&(cap=this.rules.table.exec(src))){
				src=src.substring(cap[0].length);
				item={
					type:'table',
					header:cap[1].replace(/^ *| *\| *$/g,'').split(/ *\| */),
					align:cap[2].replace(/^ *|\| *$/g,'').split(/ *\| */),
					cells:cap[3].replace(/(?: *\| *)?\n$/,'').split('\n')
				};
				for(i=0;i<item.align.length;i++){
					if(/^ *-+: *$/.test(item.align[i])){
						item.align[i]='right';
					}else if(/^ *:-+: *$/.test(item.align[i])){
						item.align[i]='center';
					}else if(/^ *:-+ *$/.test(item.align[i])){
						item.align[i]='left';
					}else{
						item.align[i]=null;
					}
				}
				for(i=0;i<item.cells.length;i++){
					item.cells[i]=item.cells[i].replace(/^ *\| *| *\| *$/g,'').split(/ *\| */);
				}
				this.tokens.push(item);
				continue;
			}
			if(top&&(cap=this.rules.paragraph.exec(src))){
				src=src.substring(cap[0].length);
				this.tokens.push({
					type:'paragraph',
					text:cap[1][cap[1].length-1]==='\n'?cap[1].slice(0,-1):cap[1]
				});
				continue;
			}
			if(cap=this.rules.text.exec(src)){
				src=src.substring(cap[0].length);
				this.tokens.push({type:'text',text:cap[0]});
				continue;
			}
			if(src){
				throw new Error('Infinite loop on byte: '+src.charCodeAt(0));
			}
		}
		return this.tokens;
	};
	var inline={
		escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,
		autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,
		url:noop,
		tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
		link:/^.?\[(inside)\]\(href(?: (w|h)=(\d+)(%)?)?(?: (w|h)=(\d+)(%)?)?\)/,
		reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,
		nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
		strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
		em:/^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
		code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
		br:/^ {2,}\n(?!\s*$)/,
		del:noop,
		text:/^[\s\S]+?(?=[\\<!\[_*`\(\$)]| {2,}\n|$)/,
		color:/^\((#[0-9A-Fa-f]{3})\)\[(.*?)\]/
	};
	inline._inside=/(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
	inline._href=/\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
	inline.link=replace(inline.link)('inside',inline._inside)('href',inline._href)();
	inline.reflink=replace(inline.reflink)('inside',inline._inside)();
	inline.normal=merge({},inline);
	inline.pedantic=merge({},inline.normal,{
		strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
		em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});
	inline.gfm=merge({},inline.normal,{
		escape:replace(inline.escape)('])','~|])')(),
		url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
		del:/^~~(?=\S)([\s\S]*?\S)~~/,text:replace(inline.text)(']|','~]|')('|','|https?://|')()
	});
	inline.breaks=merge({},inline.gfm,{
		br:replace(inline.br)('{2,}','*')(),
		text:replace(inline.gfm.text)('{2,}','*')()
	});
	function InlineLexer(links,options){
		this.options=options||marked.defaults;
		this.links=links;this.rules=inline.normal;
		if(!this.links){
			throw new Error('Tokens array requires a `links` property.');
		}
		if(this.options.gfm){
			if(this.options.breaks){
				this.rules=inline.breaks;
			}else{
				this.rules=inline.gfm;
			}
		}else if(this.options.pedantic){
			this.rules=inline.pedantic;
		}
	}
	InlineLexer.rules=inline;
	InlineLexer.output=function(src,links,opt){
		var inline=new InlineLexer(links,opt);
		return inline.output(src);
	};
	InlineLexer.prototype.output=function(src){
		var out='',link,text,href,cap;
		while(src){
			if(cap=this.rules.escape.exec(src)){
				src=src.substring(cap[0].length);
				out+=cap[1];continue;
			}
			if(cap=this.rules.autolink.exec(src)){
				src=src.substring(cap[0].length);
				if(cap[2]==='@'){
					text=cap[1][6]===':'?this.mangle(cap[1].substring(7)):this.mangle(cap[1]);
					href=this.mangle('mailto:')+text;
				}else{
					text=escape(cap[1]);
					href=text;
				}
				out+='<a href="'+href+'" target="_blank">'+text+'</a>';
				continue;
			}
			if(cap=this.rules.url.exec(src)){
				src=src.substring(cap[0].length);
				text=escape(cap[1]);
				href=text;out+='<a href="'+href+'" target="_blank">'+text+'</a>';
				continue;
			}
			if(cap=this.rules.tag.exec(src)){
				src=src.substring(cap[0].length);
				out+=this.options.sanitize?escape(cap[0]):cap[0];
				continue;
			}
			if((cap=this.rules.link.exec(src))&&(cap[0][0]=='!'||cap[0][0]=='$'||cap[0][0]=='[')){
				src=src.substring(cap[0].length);
				out+=this.outputLink(cap,{href:cap[2],title:cap[3]});
				continue;
			}
			if((cap=this.rules.reflink.exec(src))||(cap=this.rules.nolink.exec(src))){
				src=src.substring(cap[0].length);
				link=(cap[2]||cap[1]).replace(/\s+/g,' ');
				link=this.links[link.toLowerCase()];
				if(!link||!link.href){
					out+=cap[0][0];
					src=cap[0].substring(1)+src;
					continue;
				}
				out+=this.outputLink(cap,link);
				continue;
			}
			if(cap=this.rules.strong.exec(src)){
				src=src.substring(cap[0].length);
				out+='<strong>'+this.output(cap[2]||cap[1])+'</strong>';
				continue;
			}
			if(cap=this.rules.em.exec(src)){
				src=src.substring(cap[0].length);
				out+='<em>'+this.output(cap[2]||cap[1])+'</em>';
				continue;
			}
			if(cap=this.rules.code.exec(src)){
				src=src.substring(cap[0].length);
				out+='<code>'+escape(cap[2],true)+'</code>';
				continue;
			}
			if(cap=this.rules.br.exec(src)){
				src=src.substring(cap[0].length);
				out+='<br/>';
				continue;
			}
			if(cap=this.rules.del.exec(src)){
				src=src.substring(cap[0].length);
				out+='<del>'+this.output(cap[1])+'</del>';
				continue;
			}
			if(cap=this.rules.color.exec(src)){
				src=src.substring(cap[0].length);
				out+='<span style="color:'+cap[1]+'">'+cap[2]+'</span>';
				continue;
			}
			if(cap=this.rules.text.exec(src)){
				src=src.substring(cap[0].length);
				out+=escape(cap[0]);
				continue;
			}
			if(src){
				throw new Error('Infinite loop on byte: '+src.charCodeAt(0));
			}
		}
		return out;
	};
	InlineLexer.prototype.outputLink=function(cap,link){
		if(cap[0][0]=='['){
			return'<a href="'+escape(link.href)+'"'+(link.title?' title="'+escape(link.title)+'"':'')+' target="_blank">'+this.output(cap[1])+'</a>';
		}else if(cap[0][0]=="!"){
			return'<img src="'+escape(link.href)+'" alt="'+escape(cap[1])+'" style="'+(cap[4]?(cap[4]=='w'?'width':'height')+':'+cap[5]+(cap[6]?'%;':'px;')+(cap[7]?(cap[7]=='w'?'width':'height')+':'+cap[8]+(cap[9]?'%;':'px;'):cap[6]==''):'max-width=100%;')+'"'+(link.title?' title="'+escape(link.title)+'"':'')+'>';
		}else{
			return'<span style="color:'+escape(link.href)+';">'+escape(cap[1])+'</span>';
		}
	};InlineLexer.prototype.mangle=function(text){
		var out='',l=text.length,i=0,ch;
		for(;i<l;i++){
			ch=text.charCodeAt(i);
			if(Math.random()>0.5){
				ch='x'+ch.toString(16);
			}
			out+='&#'+ch+';';
		}
		return out;
	};
	function Parser(options){
		this.tokens=[];
		this.token=null;
		this.options=options||marked.defaults;
	}
	Parser.parse=function(src,options){
		var parser=new Parser(options);
		return parser.parse(src);
	};
	Parser.prototype.parse=function(src){
		this.inline=new InlineLexer(src.links,this.options);
		this.tokens=src.reverse();
		var out='';
		while(this.next()){
			out+=this.tok();
		}
		return out;
	};
	Parser.prototype.next=function(){
		return this.token=this.tokens.pop();
	};
	Parser.prototype.peek=function(){
		return this.tokens[this.tokens.length-1]||0;
	};
	Parser.prototype.parseText=function(){
		var body=this.token.text;
		while(this.peek().type==='text'){
			body+='\n'+this.next().text;
		}
		return this.inline.output(body);
	};
	Parser.prototype.tok=function(){
		switch(this.token.type){
			case 'space':
				return '';
			case 'hr':
				return '<hr/>\n';
			case 'heading':
				return '<h'+this.token.depth+'>'+this.inline.output(this.token.text)+'</h'+this.token.depth+'>\n';
			case 'code':
				if(this.options.highlight){
					var code=this.options.highlight(this.token.text,this.token.lang);
					if(code!=null&&code!==this.token.text){
						this.token.escaped=true;this.token.text=code;
					}
				}
				if(!this.token.escaped){
					this.token.text=escape(this.token.text,true);
				}
				//alert(this.token.text.replace(/&lt;/,'<'))
				return '<pre style="overflow:auto;"><code'+(this.token.lang?' class="'+this.options.langPrefix+this.token.lang+'"':'')+'>'+'<ol><li>'+this.token.text.replace(/&amp;/g,'&').replace(/\n/g,'</li><li>')+'</li></ol></code></pre>\n';
			case 'table':
				var body='',heading,i,row,cell,j;
				body+='<thead>\n<tr>\n';
				for(i=0;i<this.token.header.length;i++){
					heading=this.inline.output(this.token.header[i]);
					body+=this.token.align[i]?'<th align="'+this.token.align[i]+'">'+heading+'</th>\n':'<th>'+heading+'</th>\n';
				}
				body+='</tr>\n</thead>\n';
				body+='<tbody>\n';
				for(i=0;i<this.token.cells.length;i++){
					row=this.token.cells[i];body+='<tr>\n';
					for(j=0;j<row.length;j++){
						cell=this.inline.output(row[j]);
						body+=this.token.align[j]?'<td align="'+this.token.align[j]+'">'+cell+'</td>\n':'<td>'+cell+'</td>\n';
					}
					body+='</tr>\n';
				}
				body+='</tbody>\n';
				return '<table>\n'+body+'</table>\n';
			case 'blockquote_start':
				var body='';
				while(this.next().type!=='blockquote_end'){
					body+=this.tok();
				}
				return '<blockquote>\n'+body+'</blockquote>\n';
			case 'list_start':
				var type=this.token.ordered?'ol':'ul',body='';
				while(this.next().type!=='list_end'){
					body+=this.tok();
				}
				return '<'+type+'>\n'+body+'</'+type+'>\n';
			case 'list_item_start':
				var body='';
				while(this.next().type!=='list_item_end'){
					body+=this.token.type==='text'?this.parseText():this.tok();
				}
				return '<li>'+body+'</li>\n';
			case 'loose_item_start':
				var body='';
				while(this.next().type!=='list_item_end'){
					body+=this.tok();
				}
				return '<li>'+body+'</li>\n';
			case 'html':
				return !this.token.pre&&!this.options.pedantic?this.inline.output(this.token.text):this.token.text;
			case 'paragraph':
				return '<p>'+this.inline.output(this.token.text)+'</p>\n';
			case 'text':
				return'<p>'+this.parseText()+'</p>\n';
		}
	};
	function escape(html,encode){
		return html.replace(!encode?/&(?!#?\w+;)/g:/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
	}
	function replace(regex,opt){
		regex=regex.source;opt=opt||'';
		return function self(name,val){
			if(!name)return new RegExp(regex,opt);
			val=val.source||val;
			val=val.replace(/(^|[^\[])\^/g,'$1');
			regex=regex.replace(name,val);
			return self;
		};
	}
	function noop(){}
	noop.exec=noop;
	function merge(obj){
		var i=1,target,key;
		for(;i<arguments.length;i++){
			target=arguments[i];
			for(key in target){
				if(Object.prototype.hasOwnProperty.call(target,key)){
					obj[key]=target[key];
				}
			}
		}
		return obj;
	}
	function marked(src,opt){
		try{
			if(opt)opt=merge({},marked.defaults,opt);
			return Parser.parse(Lexer.lex(src,opt),opt);
		}catch(e){
			e.message+='\nPlease report this to https://github.com/chjj/marked.';
			if((opt||marked.defaults).silent){
				return'An error occured:\n'+e.message;
			}
			throw e;
		}
	}
	marked.options=marked.setOptions=function(opt){
		merge(marked.defaults,opt);return marked;
	};
	marked.defaults={
		gfm:true,
		tables:true,
		breaks:false,
		pedantic:false,
		sanitize:false,
		smartLists:false,
		silent:false,
		highlight:null,
		langPrefix:'lang-'
	};
	marked.Parser=Parser;
	marked.parser=Parser.parse;
	marked.Lexer=Lexer;
	marked.lexer=Lexer.lex;
	marked.InlineLexer=InlineLexer;
	marked.inlineLexer=InlineLexer.output;
	marked.parse=marked;
	if(typeof exports==='object'){
		module.exports=marked;
	}else if(typeof define==='function'&&define.amd){
		define(function(){
			return marked;
		});
	}else{
		this.marked=marked;
	}
}).call(function(){
	return this||(typeof window!=='undefined'?window:global);
}());