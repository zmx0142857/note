var texstring;
(AMTEX = function() {

var mathcolor = "";
var translateOnLoad = true;
var automathrecognize = false; // writing "amath" on page makes this true
var showasciiformulaonhover = false;
var decimalsign = ".";
var AMdelimiter1 = "`", AMescape1 = "\\\\`";
var AMusedelimiter2 = true;
var AMdelimiter2 = "qq", AMescape2="\\\\\\qq", AMdelimiter2regexp = "\\qq";

var mIdCounter = 0;
var displaystyle = true;

// token types
var CONST=0,UNARY=1,BINARY=2,INFIX=3,LEFTBRACKET=4,RIGHTBRACKET=5,SPACE=6,UNDEROVER=7,DEFINITION=8,LEFTRIGHT=9,TEXT=10;

function compareNames(s1,s2){
	if(s1.input>s2.input) return 1;
	else return-1;
}

var AMnames=[];

function refreshSymbols() {
	AM.symbols.sort(compareNames);
	var symlen = AM.symbols.length;
	for(var i=0; i<symlen; i++)
		AMnames[i]=AM.symbols[i].input;
}

function AMinitSymbols(){
	var texsymbols=[];
	var symlen = AM.symbols.length;
	for(var i=0; i<symlen; i++) {
		if(AM.symbols[i].tex
			//!tex
			&& !(typeof AM.symbols[i].notexcopy=="boolean"
				&& AM.symbols[i].notexcopy)
		){
			texsymbols.push({
				input:AM.symbols[i].tex,
				tag:AM.symbols[i].tag,
				output:AM.symbols[i].output,
				ttype:AM.symbols[i].ttype,
				acc:(AM.symbols[i].acc||false)
			});
		}
	}
	AM.symbols=AM.symbols.concat(texsymbols);
	refreshSymbols();
}

function newcommand(oldstr,newstr) {
	AM.symbols.push([{input:oldstr,tag:"mo",output:newstr,tex:null,ttype:DEFINITION}]);
}

function AMremoveCharsAndBlanks(str,n){
	var st;
	if(str.charAt(n)=="\\"&&str.charAt(n+1)!="\\"&&str.charAt(n+1)!=" ")
		st=str.slice(n+1);
	else st=str.slice(n);
	for(var i=0;i<st.length&&st.charCodeAt(i)<=32;i=i+1);
	return st.slice(i);
}

function AMposition(arr,str,n){
	if(n==0){
		var h,m; n=-1; h=arr.length;
		while(n+1<h){
			m=(n+h)>>1;
			if(arr[m]<str)n=m;
			else h=m;
		}
		return h;
	}else
		for(var i=n;i<arr.length&&arr[i]<str;i++);
	return i;
}

function AMgetSymbol(str){var k=0;var j=0;var mk;var st;var tagst;var match="";var more=true;for(var i=1;i<=str.length&&more;i++){st=str.slice(0,i);j=k;k=AMposition(AMnames,st,j);if(k<AMnames.length&&str.slice(0,AMnames[k].length)==AMnames[k]){match=AMnames[k];mk=k;i=match.length;}
more=k<AMnames.length&&str.slice(0,AMnames[k].length)>=AMnames[k];}
AMpreviousSymbol=AMcurrentSymbol;if(match!=""){AMcurrentSymbol=AM.symbols[mk].ttype;return AM.symbols[mk];}
AMcurrentSymbol=CONST;k=1;st=str.slice(0,1);var integ=true;while("0"<=st&&st<="9"&&k<=str.length){st=str.slice(k,k+1);k++;}
if(st==decimalsign){st=str.slice(k,k+1);if("0"<=st&&st<="9"){integ=false;k++;while("0"<=st&&st<="9"&&k<=str.length){st=str.slice(k,k+1);k++;}}}
if((integ&&k>1)||k>2){st=str.slice(0,k-1);tagst="mn";}else{k=2;st=str.slice(0,1);tagst=(("A">st||st>"Z")&&("a">st||st>"z")?"mo":"mi");}
//!tex
if(st=="-"&&AMpreviousSymbol==INFIX){AMcurrentSymbol=INFIX;
	return{input:st,tag:tagst,output:st,ttype:UNARY,func:true,val:true};
}
return{input:st,tag:tagst,output:st,ttype:CONST,val:true};
}

//!tex
function AMTremoveBrackets(node) {
	var st;
	if (node.charAt(0) == '{' && node.charAt(node.length-1) == '}') {
		var leftchop = 0;
		st = node.substr(1,5);
		if (st == '\\left'){
			st = node.charAt(6);
			if (st == "(" || st == "[" || st == "{"){
				leftchop = 7;
			} else {
				st = node.substr(6,7);
				if (st=='\\lbrace') {
					leftchop = 13;
				}
			}
		} else {
			st = node.charAt(1);
			if (st == "(" || st == "[") {
				leftchop = 2;
			}
		}
		if (leftchop > 0) {
			st = node.substr(node.length-8);
			if (st=="\\right)}" || st=="\\right]}" || st=='\\right.}'){
				node = '{' + node.substr(leftchop);
				node = node.substr(0,node.length-8) + '}';
			} else if (st=='\\rbrace}') {
				node='{'+node.substr(leftchop);
				node=node.substr(0,node.length-14)+'}';
			}
		}
	}
	return node;
}

var AMnestingDepth,AMpreviousSymbol,AMcurrentSymbol;

function AMTgetTeXsymbol(symb){
	if(typeof symb.val=="boolean"&&symb.val){
		return symb.output;
	}else if (symb.tex == null){
		return '\\' + symb.input;
	}else{
		return '\\' + symb.tex;
	}
}

function AMTgetTeXbracket(symb){
	if(symb.tex==null){
		return(symb.input);
	}else{
		return('\\'+symb.tex);
	}
}

function AMTparseSexpr(str){
	var symbol,node,result,i,st,newFrag='';
	str=AMremoveCharsAndBlanks(str,0);
	symbol=AMgetSymbol(str);
	if(symbol==null||symbol.ttype==RIGHTBRACKET&&AMnestingDepth>0){
		return[null,str];
	}
	if(symbol.ttype==DEFINITION){
		str=symbol.output+AMremoveCharsAndBlanks(str,symbol.input.length);
		symbol=AMgetSymbol(str);
	}
	switch(symbol.ttype){
		case UNDEROVER:
		case CONST:
			str=AMremoveCharsAndBlanks(str,symbol.input.length);
			var texsymbol=AMTgetTeXsymbol(symbol);
			if(texsymbol.charAt(0)=="\\"||symbol.tag=="mo")return[texsymbol,str];
			else return['{'+texsymbol+'}',str];
		case LEFTBRACKET:
			AMnestingDepth++;
			str=AMremoveCharsAndBlanks(str,symbol.input.length);
			result=AMTparseExpr(str,true);AMnestingDepth--;if(result[0].substr(0,6)=="\\right"){if(result[0].substr(0,7)=="\\right."){result[0]=result[0].substr(7);}else{result[0]=result[0].substr(6);}
if(typeof symbol.invisible=="boolean"&&symbol.invisible)
node='{'+result[0]+'}';else{node='{'+AMTgetTeXbracket(symbol)+result[0]+'}';}}else{if(typeof symbol.invisible=="boolean"&&symbol.invisible)
node='{\\left.'+result[0]+'}';else{node='{\\left'+AMTgetTeXbracket(symbol)+result[0]+'}';}}
return[node,result[1]];case TEXT:if(symbol!=AM.quote)str=AMremoveCharsAndBlanks(str,symbol.input.length);if(str.charAt(0)=="{")i=str.indexOf("}");else if(str.charAt(0)=="(")i=str.indexOf(")");else if(str.charAt(0)=="[")i=str.indexOf("]");else if(symbol==AM.quote)i=str.slice(1).indexOf("\"")+1;else i=0;if(i==-1)i=str.length;st=str.slice(1,i);if(st.charAt(0)==" "){newFrag='\\ ';}
newFrag+='\\text{'+st+'}';if(st.charAt(st.length-1)==" "){newFrag+='\\ ';}
str=AMremoveCharsAndBlanks(str,i+1);return[newFrag,str];case UNARY:str=AMremoveCharsAndBlanks(str,symbol.input.length);result=AMTparseSexpr(str);if(result[0]==null)return['{'+AMTgetTeXsymbol(symbol)+'}',str];if(typeof symbol.func=="boolean"&&symbol.func){st=str.charAt(0);if(st=="^"||st=="_"||st=="/"||st=="|"||st==","||(symbol.input.length==1&&symbol.input.match(/\w/)&&st!="(")){return['{'+AMTgetTeXsymbol(symbol)+'}',str];}else{node=' '+AMTgetTeXsymbol(symbol)+'{'+result[0]+'}';return[node,result[1]];}}
result[0]=AMTremoveBrackets(result[0]);if(symbol.input=="sqrt"){return['\\sqrt{'+result[0]+'}',result[1]];}else if(symbol.input=="cancel"){return['\\cancel{'+result[0]+'}',result[1]];}else if(typeof symbol.rewriteleftright!="undefined"){return['{\\left'+symbol.rewriteleftright[0]+result[0]+'\\right'+symbol.rewriteleftright[1]+'}',result[1]];}else if(typeof symbol.acc=="boolean"&&symbol.acc){return[AMTgetTeXsymbol(symbol)+'{'+result[0]+'}',result[1]];}else{return['{'+AMTgetTeXsymbol(symbol)+'{'+result[0]+'}}',result[1]];}
case BINARY:str=AMremoveCharsAndBlanks(str,symbol.input.length);result=AMTparseSexpr(str);if(result[0]==null)return['{'+AMTgetTeXsymbol(symbol)+'}',str];result[0]=AMTremoveBrackets(result[0]);var result2=AMTparseSexpr(result[1]);if(result2[0]==null)return['{'+AMTgetTeXsymbol(symbol)+'}',str];result2[0]=AMTremoveBrackets(result2[0]);if(symbol.input=="color"){newFrag='{\\color{'+result[0].replace(/[\{\}]/g,'')+'}'+result2[0]+'}';}
if(symbol.input=="root"||symbol.input=="stackrel"){if(symbol.input=="root"){newFrag='{\\sqrt['+result[0]+']{'+result2[0]+'}}';}else{newFrag='{'+AMTgetTeXsymbol(symbol)+'{'+result[0]+'}{'+result2[0]+'}}';}}
if(symbol.input=="frac"){newFrag='{\\frac{'+result[0]+'}{'+result2[0]+'}}';}
return[newFrag,result2[1]];case INFIX:str=AMremoveCharsAndBlanks(str,symbol.input.length);return[symbol.output,str];case SPACE:str=AMremoveCharsAndBlanks(str,symbol.input.length);return['{\\quad\\text{'+symbol.input+'}\\quad}',str];case LEFTRIGHT:AMnestingDepth++;str=AMremoveCharsAndBlanks(str,symbol.input.length);result=AMTparseExpr(str,false);AMnestingDepth--;var st="";st=result[0].charAt(result[0].length-1);if(st=="|"){node='{\\left|'+result[0]+'}';return[node,result[1]];}else{node='{|}';return[node,str];}
default:str=AMremoveCharsAndBlanks(str,symbol.input.length);return['{'+AMTgetTeXsymbol(symbol)+'}',str];}}

function AMTparseIexpr(str){
	var symbol,sym1,sym2,node,result;
	str=AMremoveCharsAndBlanks(str,0);
	sym1=AMgetSymbol(str);
	result=AMTparseSexpr(str);
	node=result[0];
	str=result[1];
	symbol=AMgetSymbol(str);
	if(symbol.ttype==INFIX&&symbol.input!="/"){
		str=AMremoveCharsAndBlanks(str,symbol.input.length);
		result=AMTparseSexpr(str);
		if(result[0]==null) result[0]='{}';
		else result[0]=AMTremoveBrackets(result[0]);
		str=result[1];
		if(symbol.input=="_"){
			sym2=AMgetSymbol(str);
			if(sym2.input=="^"){
				str=AMremoveCharsAndBlanks(str,sym2.input.length);
				var res2=AMTparseSexpr(str);
				res2[0]=AMTremoveBrackets(res2[0]);
				str=res2[1];
				node='{'+node;
				node+='_{'+result[0]+'}';
				node+='^{'+res2[0]+'}';
				node+='}';
			}else{
				node+='_{'+result[0]+'}';
			}
		}else{
			numLBraces=result[0].split("{").length;
			numRBraces=result[0].split("}").length;
			if(numLBraces==2&&numRBraces==2){
				node=node+'^'+result[0];
			}else{
				node=node+'^{'+result[0]+'}';
			}
		}
		if(typeof sym1.func!='undefined'&&sym1.func){
			sym2=AMgetSymbol(str);
			if(sym2.ttype!=INFIX&&sym2.ttype!=RIGHTBRACKET){
				result=AMTparseIexpr(str);
				node='{'+node+result[0]+'}';
				str=result[1];
			}
		}
	}
	return[node,str];
}

function AMTparseExpr(str,rightbracket){
	var strRem=str;
	var symbol,node,result,i,nodeList=[],newFrag='';
	var addedright=false;
	do{
		str=AMremoveCharsAndBlanks(str,0);
		result=AMTparseIexpr(str);
		node=result[0];
		str=result[1];
		symbol=AMgetSymbol(str);
		if(symbol.ttype==INFIX&&symbol.input=="/"){
			str=AMremoveCharsAndBlanks(str,symbol.input.length);
			result=AMTparseIexpr(str);
			if(result[0]==null) result[0]='{}';
			else result[0]=AMTremoveBrackets(result[0]);
			str=result[1];
			node=AMTremoveBrackets(node);
			numLBraces=node.split("{").length-1;
			numRBraces=node.split("}").length-1;
			if(numLBraces==1&&numRBraces==1&&node.indexOf('\\text')<0){
				node='\\frac'+node;
			}else{
				node='\\frac'+'{'+node+'}';
			}
			numLBraces=result[0].split("{").length-1;
			numRBraces=result[0].split("}").length-1;
			node+='{'+result[0]+'}';
			newFrag+=node;
			symbol=AMgetSymbol(str);
		}else if(node!=undefined)newFrag+=node;
	}
	while((symbol.ttype!=RIGHTBRACKET&&(symbol.ttype!=LEFTRIGHT||rightbracket)||AMnestingDepth==0)&&symbol!=null&&symbol.output!="");
	if(symbol.ttype==RIGHTBRACKET||symbol.ttype==LEFTRIGHT){
		var len=newFrag.length;
		if(len>2&&newFrag.charAt(0)=='{'&&newFrag.indexOf(',')>0){
			var right=newFrag.charAt(len-2);
			if(right==')'||right==']'){
				var left=newFrag.charAt(6);
				if((left=='('&&right==')'&&symbol.output!='}')||(left=='['&&right==']')){
					var mxout='\\begin{matrix}';
					var pos=new Array();
					pos.push(0);
					var matrix=true;
					var mxnestingd=0;
					var subpos=[];
					subpos[0]=[0];
					var lastsubposstart=0;
					var mxanynestingd=0;
					for(i=1;i<len-1;i++){
						if(newFrag.charAt(i)==left)mxnestingd++;
						if(newFrag.charAt(i)==right){
							mxnestingd--;
							if(mxnestingd==0&&newFrag.charAt(i+2)==','&&newFrag.charAt(i+3)=='{'){
								pos.push(i+2);
								lastsubposstart=i+2;
								subpos[lastsubposstart]=[i+2];
							}
						}
						if(newFrag.charAt(i)=='['||newFrag.charAt(i)=='('||newFrag.charAt(i)=='{'){
							mxanynestingd++;
						}
						if(newFrag.charAt(i)==']'||newFrag.charAt(i)==')'||newFrag.charAt(i)=='}'){
							mxanynestingd--;
						}
						if(newFrag.charAt(i)==','&&mxanynestingd==1){
							subpos[lastsubposstart].push(i);
						}
					}
					pos.push(len);
					var lastmxsubcnt=-1;
					if(mxnestingd==0&&pos.length>0){
						for(i=0;i<pos.length-1;i++){
							if(i>0)mxout+='\\\\';
							if(i==0){
								if(subpos[pos[i]].length==1){
									var subarr=[newFrag.substr(pos[i]+7,pos[i+1]-pos[i]-15)];
								}else{
									var subarr=[newFrag.substring(pos[i]+7,subpos[pos[i]][1])];
									for(var j=2;j<subpos[pos[i]].length;j++){
										subarr.push(newFrag.substring(subpos[pos[i]][j-1]+1,subpos[pos[i]][j]));
									}
									subarr.push(newFrag.substring(subpos[pos[i]][subpos[pos[i]].length-1]+1,pos[i+1]-8));
								}
							}else{
								if(subpos[pos[i]].length==1){
									var subarr=[newFrag.substr(pos[i]+8,pos[i+1]-pos[i]-16)];
								}else{
									var subarr=[newFrag.substring(pos[i]+8,subpos[pos[i]][1])];
									for(var j=2;j<subpos[pos[i]].length;j++){
										subarr.push(newFrag.substring(subpos[pos[i]][j-1]+1,subpos[pos[i]][j]));
									}
									subarr.push(newFrag.substring(subpos[pos[i]][subpos[pos[i]].length-1]+1,pos[i+1]-8));
								}
							}
							if(lastmxsubcnt>0&&subarr.length!=lastmxsubcnt){
								matrix=false;
							}else if(lastmxsubcnt==-1){
								lastmxsubcnt=subarr.length;
							}
							mxout+=subarr.join('&');
						}
					}
					mxout+='\\end{matrix}';
					newFrag=mxout;
				}
			}
		}
		str=AMremoveCharsAndBlanks(str,symbol.input.length);
		if(typeof symbol.invisible!="boolean"||!symbol.invisible){
			node='\\right'+AMTgetTeXbracket(symbol);
			newFrag+=node;
			addedright=true;
		}else{
			newFrag+='\\right.';
			addedright=true;
		}
	}
	if(AMnestingDepth>0&&!addedright){
		newFrag+='\\right.';
	}
	return[newFrag,str];
}

function AMTparseAMtoTeX(str) {
	AMnestingDepth=0;
	str=str.replace(/(&nbsp;|\u00a0|&#160;)/g,"");
	str=str.replace(/&gt;/g,">");
	str=str.replace(/&lt;/g,"<");
	if(str.match(/\S/)==null){
		return "";
	}
	return AMTparseExpr(str.replace(/^\s+/g,""),false)[0];
}

function AMparseMath(str) {
	str=str.replace(/(&nbsp;|\u00a0|&#160;)/g,"");
	str=str.replace(/&gt;/g,">");
	str=str.replace(/&lt;/g,"<");
	str=str.replace(/×/g,"\\times");
	str=str.replace(/−/g,"-");
	str=str.replace(/&Omega/g,"\\Omega");
	str=str.replace(/\/\//g,"text(/)");
	str=str.replace(/’/g,"text(')");
	str=str.replace(/”/g,'text(")');
	str=str.replace(/·/g,"\\cdot");
	if (str.match(/\S/)==null) {
		return document.createTextNode(" ");
	}
	texstring=AMTparseAMtoTeX(str);
	if (typeof mathbg!="undefined" && mathbg=='dark'){
		texstring="\\reverse "+texstring;
	}
	if(mathcolor!=""){
		texstring="\\"+mathcolor+texstring;
	}
	if(displaystyle){
		texstring="\\displaystyle"+texstring;
	}else{
		texstring="\\textstyle"+texstring;
	}
	texstring=texstring.replace('$','\\$');
	texstring=texstring.replace(/%/g,'\\%');
	texstring=texstring.replace(/∠/g,'\\angle');
	texstring=texstring.replace(/Φ/g,"\\Phi");
	texstring=texstring.replace(/θ/g,"\\theta");
	texstring=texstring.replace(/Δ/g,"\\Delta");
	texstring=texstring.replace(/α/g,"\\alpha");
	texstring=texstring.replace(/β/g,"\\beta");
	texstring=texstring.replace(/ω/g,"\\omega");
	texstring=texstring.replace(/μ/g,"\\mu");
	texstring=texstring.replace(/Ω/g,"\\Omega");
	texstring=texstring.replace(/δ/g,"\\delta");
	texstring=texstring.replace(/γ/g,"\\gamma");
	texstring=texstring.replace(/σ/g,"\\sigma");
	texstring=texstring.replace(/π/g,"\\pi");
	texstring=texstring.replace(/≥/g,"\\ge");
	texstring=texstring.replace(/≤/g,"\\le");
	texstring=texstring.replace(/≠/g,"\\ne");
	texstring=texstring.replace(/≡/g,"\\equiv");
	texstring=texstring.replace(/≈/g,"\\approx");
	texstring=texstring.replace(/→/g,"\\rightarrow");
	texstring=texstring.replace(/÷/g,"\\div");
	texstring=texstring.replace(/±/g,"\\pm");
	texstring=texstring.replace(/°/g,"^{\\circ}");
	texstring=texstring.replace(/∞/g,"\\infty");
	texstring=texstring.replace(/ma\\genta/g,"magenta");
	texstring=texstring.replace(/{f}{b}\\otimes/g,"\\fbox");
	var node=document.createElement("span");
	node.id="mathId"+mIdCounter;
	node.innerHTML=texstring;
	try{
		if (str.indexOf('\\begin{cases}')>-1) {
			katex.render(str,node);
		} else {
			katex.render(texstring,node);
		}
	} catch(err) {
		node.className="katexErr";
		if (typeof MathJax!=='undefined') {
			node.innerHTML="`"+str+"`";
			MathJax.Hub.Queue(["Typeset",MathJax.Hub,"mathId"+mIdCounter]);
		} else {
			//console.error(err);
			//console.log(texstring);
		}
	}
	mIdCounter++;
	return node;
}

function AMstrarr2docFrag(arr) {
	var newFrag=document.createDocumentFragment();
	var expr=false;
	for(var i=0;i<arr.length;i++){
		if(expr){
			newFrag.appendChild(AMparseMath(arr[i]));
		}else{
			newFrag.appendChild(
				document.createElement("span").appendChild(
					document.createTextNode(arr[i])
				)
			);
		}
		expr=!expr;
	}
	return newFrag;
}

function AMprocessNodeR(n, linebreaks,latex) {
  var mtch, str, arr, frg, i;
  if (n.childNodes.length == 0) {
   if ((n.nodeType!=8 || linebreaks) &&
    n.parentNode.nodeName!="form" && n.parentNode.nodeName!="FORM" &&
    n.parentNode.nodeName!="textarea" && n.parentNode.nodeName!="TEXTAREA" /*&&
    n.parentNode.nodeName!="pre" && n.parentNode.nodeName!="PRE"*/) {
    str = n.nodeValue;
    if (!(str == null)) {
      str = str.replace(/\r\n\r\n/g,"\n\n");
      str = str.replace(/\x20+/g," ");
      str = str.replace(/\s*\r\n/g," ");
      if(latex) {
// DELIMITERS:
        mtch = (str.indexOf("\$")==-1 ? false : true);
        str = str.replace(/([^\\])\$/g,"$1 \$");
        str = str.replace(/^\$/," \$");	// in case \$ at start of string
        arr = str.split(" \$");
        for (i=0; i<arr.length; i++)
	  arr[i]=arr[i].replace(/\\\$/g,"\$");
      } else {
      mtch = false;
      str = str.replace(new RegExp(AMescape1, "g"),
              function(){mtch = true; return "AMescape1"});
      str = str.replace(/\\?end{?a?math}?/i,
              function(){automathrecognize = false; mtch = true; return ""});
      str = str.replace(/amath\b|\\begin{a?math}/i,
              function(){automathrecognize = true; mtch = true; return ""});
      arr = str.split(AMdelimiter1);
      if (automathrecognize)
        for (i=0; i<arr.length; i++)
          if (i%2==0) arr[i] = AMautomathrec(arr[i]);
      str = arr.join(AMdelimiter1);
      arr = str.split(AMdelimiter1);
      for (i=0; i<arr.length; i++) // this is a problem ************
        arr[i]=arr[i].replace(/AMescape1/g,AMdelimiter1);
      }
      if (arr.length>1 || mtch) {
          frg = AMstrarr2docFrag(arr,n.nodeType==8,latex);
          var len = frg.childNodes.length;
          n.parentNode.replaceChild(frg,n);
          return len-1;
      }
    }
   } else return 0;
  } else if (n.nodeName!="math") {
    for (i=0; i<n.childNodes.length; i++)
      i += AMprocessNodeR(n.childNodes[i], linebreaks,latex);
  }
  return 0;
}

/*
function AMprocessNodeR(n){
	var mtch,str,arr,frg,i;
	if(n.childNodes.length==0){
		if((n.nodeType!=8)
			&& n.nodeName.toLowerCase()!="script"
			&& n.parentNode.nodeName.toLowerCase()!="script"
			&& n.parentNode.nodeName.toLowerCase()!="em"
			&& n.parentNode.nodeName.toLowerCase()!="i"
			&& n.parentNode.nodeName.toLowerCase()!="button"
			&& n.parentNode.nodeName.toLowerCase()!="form"
			&& n.parentNode.className.indexOf("noKatex")==-1
			&& n.parentNode.className.indexOf("adinText")==-1
			&& (n.nodeValue!=null
				&& n.nodeValue.replace(/(\r\n\t|\n|\r\t)/gm,"")
				.replace(/\s+/g,"").length>0
			) && n.id!="footer"
		) {
			str=n.nodeValue;
			if(!(str==null)&&str.length>0){
				str=str.replace(/\r\n\r\n/g,"\n\n");
				str=str.replace(/\x20+/g," ");
				str=str.replace(/\s*\r\n/g," ");
				mtch=false;
				if(AMusedelimiter2){
					str=str.replace(
						new RegExp(AMescape2,"g"),
						function(st){mtch=true;return"AMescape2"}
					);
				}
				str=str.replace(
					new RegExp(AMescape1,"g"),
					function(st){mtch=true;return"AMescape1"}
				);
				if(AMusedelimiter2)
					str=str.replace(
						new RegExp(AMdelimiter2regexp,"g"),
						AMdelimiter1
					);
				arr=str.split(AMdelimiter1);
				for(i=0;i<arr.length;i++){
					if(AMusedelimiter2){
						arr[i]=arr[i].replace(/AMescape2/g,AMdelimiter2)
							.replace(/AMescape1/g,AMdelimiter1);
					}else{
						arr[i]=arr[i].replace(/AMescape1/g,AMdelimiter1);
					}
				}
				if(arr.length>1||mtch){
					frg=AMstrarr2docFrag(arr,n.nodeType==8);
					var len=frg.childNodes.length;
					n.parentNode.replaceChild(frg,n);
					return len-1;
				}
			}
		}else{
			return 0;
		}
	}else if(n.nodeName!="math"&&n.nodeName.toLowerCase()!="svg"){
		if (n.nodeName.toLowerCase() != "script"
			&& !(n.parentNode.classList
				&& (n.classList.contains("displayNone")
					|| n.classList.contains("ariaHidden")
					|| n.classList.contains("katex")
					|| n.parentNode.classList.contains("sprite")
				)
			)
		) {
			var eleTop=n.getBoundingClientRect().top;
			for(i=0;i<n.childNodes.length;i++){
				if ((n.childNodes[i].nodeType==3 // text node
						&& n.childNodes[i].nodeValue!=null
						&& n.childNodes[i].nodeValue.replace(/(\r\n\t|\n|\r\t)/gm,"").replace(/\s+/g,"").length==0
					) || (n.childNodes[i].classList
						&& (n.childNodes[i].classList.contains("sprite")
							|| n.childNodes[i].classList.contains("showHideButt")
							|| n.childNodes[i].classList.contains("noKatex")
							|| n.childNodes[i].classList.contains("displayNone")
							|| n.childNodes[i].classList.contains("katex")
							|| n.childNodes[i].classList.contains("ariaHidden")
						)
					)|| n.childNodes[i].nodeName.toLowerCase()=="i"
					|| n.childNodes[i].nodeName.toLowerCase()=="em"
					|| n.childNodes[i].nodeName.toLowerCase()=="strong"
					|| n.childNodes[i].nodeName.toLowerCase()=="b"
					|| n.childNodes[i].nodeName.toLowerCase()=="button"
					|| n.childNodes[i].nodeName.toLowerCase()=="svg"
					|| n.childNodes[i].nodeName.toLowerCase()=="pre"
					|| n.childNodes[i].nodeName.toLowerCase()=="code"
					|| n.childNodes[i].nodeName.toLowerCase()=="textarea"
					|| n.childNodes[i].nodeName.toLowerCase()=="script"
					|| (n.childNodes[i].nodeName.toLowerCase()=="span"
						&& n.childNodes[i].id.indexOf("mathId")>-1)
					|| n.childNodes[i].nodeType==8 // comment node
					|| eleTop>window.innerHeight+1000
				) {} else {
					i+=AMprocessNodeR(n.childNodes[i]);
				}
			}
		}
	}
	return 0;
}
*/

function AMprocessNode(n, linebreaks, spanclassAM) {
  var frag,st;
  if (spanclassAM!=null) {
    frag = document.getElementsByTagName("span")
    for (var i=0;i<frag.length;i++)
      if (frag[i].className == "AM") 
        AMprocessNodeR(frag[i],linebreaks,false);
  } else {
    try {
      st = n.innerHTML; // look for AMdelimiter on page
    } catch(err) {}
//alert(st)
    if (st==null || /amath\b|\\begin{a?math}/i.test(st) ||
      st.indexOf(AMdelimiter1+" ")!=-1 || st.slice(-1)==AMdelimiter1 ||
      st.indexOf(AMdelimiter1+"<")!=-1 || st.indexOf(AMdelimiter1+"\n")!=-1) {
      AMprocessNodeR(n,linebreaks,false);
    }
  }
}

var AMtranslated=false;

function translate(spanclassAM) {
	if (!AMtranslated) { // run this only once
		AMtranslated = true;
		AMprocessNode(document.body, false, spanclassAM);
	}
}

/*
function generic(){
  if(!AMinitSymbols()) return;
  if (translateOnLoad) {
      translate();
  }
};

//setup onload function
if(typeof window.addEventListener != 'undefined'){
  //.. gecko, safari, konqueror and standard
  window.addEventListener('load', generic, false);
}
else if(typeof document.addEventListener != 'undefined'){
  //.. opera 7
  document.addEventListener('load', generic, false);
}
else if(typeof window.attachEvent != 'undefined'){
  //.. win/ie
  window.attachEvent('onload', generic);
}else{
  //.. mac/ie5 and anything else that gets this far
  //if there's an existing onload function
  if(typeof window.onload == 'function'){
    //store it
    var existing = onload;
    //add new onload handler
    window.onload = function(){
      //call existing onload function
      existing();
      //call generic onload function
      generic();
    };
  }else{
    window.onload = generic;
  }
}
*/

AMinitSymbols();
translate();

// expose some functions to outside
AM.AMprocessNode = AMprocessNode;
AM.AMparseMath = AMparseMath;
AM.AMTparseAMtoTeX = AMTparseAMtoTeX;

})();
