MathJax.Hub.Register.StartupHook("AsciiMath Jax Config", function () {
	var AM = MathJax.InputJax.AsciiMath.AM;
	/*
	AM.symbols = AM.symbols.concat([
{input:"==",  tag:"mo", output:"\u2550\u2550\u2550\u2550", tex:null, ttype:AM.TOKEN.CONST},
{input:"====",  tag:"mo", output:"\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550", tex:null, ttype:AM.TOKEN.CONST},
{input:"////", tag:"mo", output:"\u2225", tex:null, ttype:AM.TOKEN.CONST},
{input:"!//", tag:"mo", output:"\u2226", tex:null, ttype:AM.TOKEN.CONST},
{input:"S=",  tag:"mo", output:"\u224C", tex:null, ttype:AM.TOKEN.CONST},
{input:"!-=",  tag:"mo", output:"\u2262", tex:null, ttype:AM.TOKEN.CONST},
{input:"!|", tag:"mo", output:"\u2224", tex:null, ttype:AM.TOKEN.CONST},
{input:"iint",  tag:"mo", output:"\u222C", tex:null, ttype:AM.TOKEN.CONST},
{input:"iiint",  tag:"mo", output:"\u222D", tex:null, ttype:AM.TOKEN.CONST},
{input:"oiint", tag:"mo", output:"\u222F", tex:null, ttype:AM.TOKEN.CONST},
{input:"oiiint", tag:"mo", output:"\u2230", tex:null, ttype:AM.TOKEN.CONST},
{input:"laplace",  tag:"mo", output:"\u0394", tex:null, ttype:AM.TOKEN.CONST},
{input:"Sup",  tag:"mo", output:"sup", tex:null, ttype:AM.TOKEN.UNDEROVER},
{input:"inf",  tag:"mo", output:"inf", tex:null, ttype:AM.TOKEN.UNDEROVER},
{input:"bm", tag:"mstyle", atname:"mathvariant", atval:"bold-italic", output:"bm", tex:null, ttype:AM.TOKEN.UNARY},
{input:"rm", tag:"mstyle", atname:"mathvariant", atval:"serif", output:"rm", tex:null, ttype:AM.TOKEN.UNARY},
	]
);
*/
AM.symbols.push( { input:"bm", tag:"mstyle", atname:"mathvariant", atval:"bold-italic", output:"bm", tex:null, ttype:AM.TOKEN.UNARY });
AM.symbols.push({input:"==",  tag:"mo", output:"\u2550\u2550\u2550\u2550", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"====",  tag:"mo", output:"\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"////", tag:"mo", output:"\u2225", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"!//", tag:"mo", output:"\u2226", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"S=",  tag:"mo", output:"\u224C", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"!-=",  tag:"mo", output:"\u2262", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"!|", tag:"mo", output:"\u2224", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"iint",  tag:"mo", output:"\u222C", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"iiint",  tag:"mo", output:"\u222D", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"oiint", tag:"mo", output:"\u222F", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"oiiint", tag:"mo", output:"\u2230", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"laplace",  tag:"mo", output:"\u0394", tex:null, ttype:AM.TOKEN.CONST});
AM.symbols.push({input:"Sup",  tag:"mo", output:"sup", tex:null, ttype:AM.TOKEN.UNDEROVER});
AM.symbols.push({input:"inf",  tag:"mo", output:"inf", tex:null, ttype:AM.TOKEN.UNDEROVER});
AM.symbols.push({input:"bm", tag:"mstyle", atname:"mathvariant", atval:"bold-italic", output:"bm", tex:null, ttype:AM.TOKEN.UNARY});
AM.symbols.push({input:"rm", tag:"mstyle", atname:"mathvariant", atval:"serif", output:"rm", tex:null, ttype:AM.TOKEN.UNARY});
});
