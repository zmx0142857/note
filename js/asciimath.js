/*
asciimath.js
============

This file is modified from ASCIIMathML.js by zmx0142857 <892298182@qq.com>

put this file in the same folder with your html file and append
following line to the <body> of the html file:

  <script src="asciimath.js"></script>

to overwrite default configurations, add following lines *BEFORE*
including this file:

  <script>
  var asciimath = {
    // key1: value1,
    // key2: value2,
    // ...
  };
  </script>

Default Configurations & API

  katexpath: 'katex.min.js',// use katex as fallback if no MathML.
  katex: undefined,     // true=always, false=never, undefined=auto
  onload: autorender,   // this function is called when asciimath is ready

  fixepsi: true,        // false to return to legacy epsi/varepsi mapping
  fixphi: true,         // false to return to legacy phi/varphi mapping

  delim1: '`',          // asciimath delimiter character 1
  displaystyle:true,    // put limits above and below large operators
  viewsource: false,    // show asciimath source code on mouse hover
  fontsize: undefined,  // change to e.g. '1.2em' for larger fontsize
  fontfamily: undefined,// inherit
  color: undefined,     // inherit

  symbols: Array,       // symbols recognized by asciimath parser
  texstr: String,       // last return value of am2tex
  am2tex: function,     // am2tex(str) -> texstr
  render: function,     // render(node)

*/

/*
ASCIIMathML.js
==============
This file contains JavaScript functions to convert ASCII math notation
and (some) LaTeX to Presentation MathML. The conversion is done while the 
HTML page loads, and should work with Firefox and other browsers that can
render MathML.

Just add the next line to your HTML page with this file in the same folder:

<script type="text/javascript" src="ASCIIMathML.js"></script>

Version 2.2 Mar 3, 2014.
Latest version at https://github.com/mathjax/asciimathml
If you use it on a webpage, please send the URL to jipsen@chapman.edu

Copyright (c) 2014 Peter Jipsen and other ASCIIMathML.js contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

// API
var asciimath;
if (typeof asciimath == 'undefined')
  asciimath = {};

// independent namespace
(function(){

var AM = asciimath; // shorthand for 'asciimath'
var AMnames = [];   // input entry for symbols

// token types
var CONST = 0,
  UNARY = 1,
  BINARY = 2,
  INFIX = 3,
  LEFTBRACKET = 4,
  RIGHTBRACKET = 5,
  SPACE = 6,
  UNDEROVER = 7,
  DEFINITION = 8,
  LEFTRIGHT = 9,
  TEXT = 10,
  BIG = 11,
  LONG = 12,
  STRETCHY = 13,
  MATRIX = 14,
  UNARYUNDEROVER = 15;

function initSymbols() {

// character lists for Mozilla/Netscape fonts
//AM.cal = ["\uD835\uDC9C","\u212C","\uD835\uDC9E","\uD835\uDC9F","\u2130","\u2131","\uD835\uDCA2","\u210B","\u2110","\uD835\uDCA5","\uD835\uDCA6","\u2112","\u2133","\uD835\uDCA9","\uD835\uDCAA","\uD835\uDCAB","\uD835\uDCAC","\u211B","\uD835\uDCAE","\uD835\uDCAF","\uD835\uDCB0","\uD835\uDCB1","\uD835\uDCB2","\uD835\uDCB3","\uD835\uDCB4","\uD835\uDCB5","\uD835\uDCB6","\uD835\uDCB7","\uD835\uDCB8","\uD835\uDCB9","\u212F","\uD835\uDCBB","\u210A","\uD835\uDCBD","\uD835\uDCBE","\uD835\uDCBF","\uD835\uDCC0","\uD835\uDCC1","\uD835\uDCC2","\uD835\uDCC3","\u2134","\uD835\uDCC5","\uD835\uDCC6","\uD835\uDCC7","\uD835\uDCC8","\uD835\uDCC9","\uD835\uDCCA","\uD835\uDCCB","\uD835\uDCCC","\uD835\uDCCD","\uD835\uDCCE","\uD835\uDCCF"],

//AM.frk = ["\uD835\uDD04","\uD835\uDD05","\u212D","\uD835\uDD07","\uD835\uDD08","\uD835\uDD09","\uD835\uDD0A","\u210C","\u2111","\uD835\uDD0D","\uD835\uDD0E","\uD835\uDD0F","\uD835\uDD10","\uD835\uDD11","\uD835\uDD12","\uD835\uDD13","\uD835\uDD14","\u211C","\uD835\uDD16","\uD835\uDD17","\uD835\uDD18","\uD835\uDD19","\uD835\uDD1A","\uD835\uDD1B","\uD835\uDD1C","\u2128","\uD835\uDD1E","\uD835\uDD1F","\uD835\uDD20","\uD835\uDD21","\uD835\uDD22","\uD835\uDD23","\uD835\uDD24","\uD835\uDD25","\uD835\uDD26","\uD835\uDD27","\uD835\uDD28","\uD835\uDD29","\uD835\uDD2A","\uD835\uDD2B","\uD835\uDD2C","\uD835\uDD2D","\uD835\uDD2E","\uD835\uDD2F","\uD835\uDD30","\uD835\uDD31","\uD835\uDD32","\uD835\uDD33","\uD835\uDD34","\uD835\uDD35","\uD835\uDD36","\uD835\uDD37"],

//AM.bbb = ["\uD835\uDD38","\uD835\uDD39","\u2102","\uD835\uDD3B","\uD835\uDD3C","\uD835\uDD3D","\uD835\uDD3E","\u210D","\uD835\uDD40","\uD835\uDD41","\uD835\uDD42","\uD835\uDD43","\uD835\uDD44","\u2115","\uD835\uDD46","\u2119","\u211A","\u211D","\uD835\uDD4A","\uD835\uDD4B","\uD835\uDD4C","\uD835\uDD4D","\uD835\uDD4E","\uD835\uDD4F","\uD835\uDD50","\u2124","\uD835\uDD52","\uD835\uDD53","\uD835\uDD54","\uD835\uDD55","\uD835\uDD56","\uD835\uDD57","\uD835\uDD58","\uD835\uDD59","\uD835\uDD5A","\uD835\uDD5B","\uD835\uDD5C","\uD835\uDD5D","\uD835\uDD5E","\uD835\uDD5F","\uD835\uDD60","\uD835\uDD61","\uD835\uDD62","\uD835\uDD63","\uD835\uDD64","\uD835\uDD65","\uD835\uDD66","\uD835\uDD67","\uD835\uDD68","\uD835\uDD69","\uD835\uDD6A","\uD835\uDD6B"];

if (!AM.symbols) AM.symbols = [];

AM.symbols = AM.symbols.concat([
// greek letters
{input:"alpha",  tag:"mi", output:"\u03B1", tex:null, ttype:CONST},
{input:"beta",   tag:"mi", output:"\u03B2", tex:null, ttype:CONST},
{input:"chi",    tag:"mi", output:"\u03C7", tex:null, ttype:CONST},
{input:"delta",  tag:"mi", output:"\u03B4", tex:null, ttype:CONST},
{input:"Delta",  tag:"mtext", output:"\u0394", tex:null, ttype:CONST},
{input:"epsi",   tag:"mi", output:AM.fixepsi?"\u03B5":"\u03F5", tex:AM.fixepsi?"varepsilon":"epsilon", ttype:CONST},
{input:"epsilon",   tag:"mi", output:AM.fixepsi?"\u03B5":"\u03F5", tex:AM.fixepsi?"varepsilon":"epsilon", ttype:CONST},
{input:"varepsilon", tag:"mi", output:AM.fixepsi?"\u03F5":"\u03B5", tex:AM.fixepsi?"epsilon":"varepsilon", ttype:CONST},
{input:"eta",    tag:"mi", output:"\u03B7", tex:null, ttype:CONST},
{input:"gamma",  tag:"mi", output:"\u03B3", tex:null, ttype:CONST},
{input:"Gamma",  tag:"mo", output:"\u0393", tex:null, ttype:CONST},
{input:"iota",   tag:"mi", output:"\u03B9", tex:null, ttype:CONST},
{input:"kappa",  tag:"mi", output:"\u03BA", tex:null, ttype:CONST},
{input:"lambda", tag:"mi", output:"\u03BB", tex:null, ttype:CONST},
{input:"Lambda", tag:"mo", output:"\u039B", tex:null, ttype:CONST},
{input:"lamda", tag:"mi", output:"\u03BB", tex:null, ttype:DEFINITION},
{input:"Lamda", tag:"mo", output:"\u039B", tex:null, ttype:DEFINITION},
{input:"mu",     tag:"mi", output:"\u03BC", tex:null, ttype:CONST},
{input:"nu",     tag:"mi", output:"\u03BD", tex:null, ttype:CONST},
{input:"omega",  tag:"mi", output:"\u03C9", tex:null, ttype:CONST},
{input:"Omega",  tag:"mo", output:"\u03A9", tex:null, ttype:CONST},
{input:"phi",    tag:"mi", output:AM.fixphi?"\u03D5":"\u03C6", tex:null, ttype:CONST},
{input:"varphi", tag:"mi", output:AM.fixphi?"\u03C6":"\u03D5", tex:null, ttype:CONST},
{input:"Phi",    tag:"mo", output:"\u03A6", tex:null, ttype:CONST},
{input:"pi",     tag:"mi", output:"\u03C0", tex:null, ttype:CONST},
{input:"Pi",     tag:"mo", output:"\u03A0", tex:null, ttype:CONST},
{input:"psi",    tag:"mi", output:"\u03C8", tex:null, ttype:CONST},
{input:"Psi",    tag:"mi", output:"\u03A8", tex:null, ttype:CONST},
{input:"rho",    tag:"mi", output:"\u03C1", tex:null, ttype:CONST},
{input:"sigma",  tag:"mi", output:"\u03C3", tex:null, ttype:CONST},
{input:"Sigma",  tag:"mo", output:"\u03A3", tex:null, ttype:CONST},
{input:"tau",    tag:"mi", output:"\u03C4", tex:null, ttype:CONST},
{input:"theta",  tag:"mi", output:"\u03B8", tex:null, ttype:CONST},
{input:"vartheta", tag:"mi", output:"\u03D1", tex:null, ttype:CONST},
{input:"Theta",  tag:"mo", output:"\u0398", tex:null, ttype:CONST},
{input:"upsilon", tag:"mi", output:"\u03C5", tex:null, ttype:CONST},
{input:"xi",     tag:"mi", output:"\u03BE", tex:null, ttype:CONST},
{input:"Xi",     tag:"mo", output:"\u039E", tex:null, ttype:CONST},
{input:"zeta",   tag:"mi", output:"\u03B6", tex:null, ttype:CONST},

/* script symbols
{input:"scA", tag:"mo", output:"\u1D49C", tex:null, ttype:CONST},
{input:"scB", tag:"mo", output:"\u1D49D", tex:null, ttype:CONST},
{input:"scC", tag:"mo", output:"\u1D49E", tex:null, ttype:CONST},
{input:"scD", tag:"mo", output:"\u1D49F", tex:null, ttype:CONST},
{input:"scE", tag:"mo", output:"\u1D4A0", tex:null, ttype:CONST},
{input:"scF", tag:"mo", output:"\u1D4A1", tex:null, ttype:CONST},
{input:"scG", tag:"mo", output:"\u1D4A2", tex:null, ttype:CONST},
{input:"scH", tag:"mo", output:"\u1D4A3", tex:null, ttype:CONST},
{input:"scI", tag:"mo", output:"\u1D4A4", tex:null, ttype:CONST},
{input:"scJ", tag:"mo", output:"\u1D4A5", tex:null, ttype:CONST},
{input:"scK", tag:"mo", output:"\u1D4A6", tex:null, ttype:CONST},
{input:"scL", tag:"mo", output:"\u1D4A7", tex:null, ttype:CONST},
{input:"scM", tag:"mo", output:"\u1D4A8", tex:null, ttype:CONST},
{input:"scN", tag:"mo", output:"\u1D4A9", tex:null, ttype:CONST},
{input:"scO", tag:"mo", output:"\u1D4AA", tex:null, ttype:CONST},
{input:"scP", tag:"mo", output:"&#x1D4AB;", tex:null, ttype:CONST},
{input:"scQ", tag:"mo", output:"\u1D4AC", tex:null, ttype:CONST},
{input:"scR", tag:"mo", output:"\u1D4AD", tex:null, ttype:CONST},
{input:"scS", tag:"mo", output:"\u1D4AE", tex:null, ttype:CONST},
{input:"scT", tag:"mo", output:"\u1D4AF", tex:null, ttype:CONST},
{input:"scU", tag:"mo", output:"\u1D4B0", tex:null, ttype:CONST},
{input:"scV", tag:"mo", output:"\u1D4B1", tex:null, ttype:CONST},
{input:"scW", tag:"mo", output:"\u1D4B2", tex:null, ttype:CONST},
{input:"scX", tag:"mo", output:"\u1D4B3", tex:null, ttype:CONST},
{input:"scY", tag:"mo", output:"\u1D4B4", tex:null, ttype:CONST},
{input:"scZ", tag:"mo", output:"\u1D4B5", tex:null, ttype:CONST},

{input:"sca", tag:"mi", output:"\u1D4B6", tex:null, ttype:CONST},
{input:"scb", tag:"mi", output:"\u1D4B7", tex:null, ttype:CONST},
{input:"scc", tag:"mi", output:"\u1D4B8", tex:null, ttype:CONST},
{input:"scd", tag:"mi", output:"\u1D4B9", tex:null, ttype:CONST},
{input:"sce", tag:"mi", output:"\u1D4BA", tex:null, ttype:CONST},
{input:"scf", tag:"mi", output:"\u1D4BB", tex:null, ttype:CONST},
{input:"scg", tag:"mi", output:"\u1D4BC", tex:null, ttype:CONST},
{input:"sch", tag:"mi", output:"\u1D4BD", tex:null, ttype:CONST},
{input:"sci", tag:"mi", output:"\u1D4BE", tex:null, ttype:CONST},
{input:"scj", tag:"mi", output:"\u1D4BF", tex:null, ttype:CONST},
{input:"sck", tag:"mi", output:"\u1D4C0", tex:null, ttype:CONST},
{input:"scl", tag:"mi", output:"\u1D4C1", tex:null, ttype:CONST},
{input:"scm", tag:"mi", output:"\u1D4C2", tex:null, ttype:CONST},
{input:"scn", tag:"mi", output:"\u1D4C3", tex:null, ttype:CONST},
{input:"sco", tag:"mi", output:"\u1D4C4", tex:null, ttype:CONST},
{input:"scp", tag:"mi", output:"\u1D4C5", tex:null, ttype:CONST},
{input:"scq", tag:"mi", output:"\u1D4C6", tex:null, ttype:CONST},
{input:"scr", tag:"mi", output:"\u1D4C7", tex:null, ttype:CONST},
{input:"scs", tag:"mi", output:"\u1D4C8", tex:null, ttype:CONST},
{input:"sct", tag:"mi", output:"\u1D4C9", tex:null, ttype:CONST},
{input:"scu", tag:"mi", output:"\u1D4CA", tex:null, ttype:CONST},
{input:"scv", tag:"mi", output:"\u1D4CB", tex:null, ttype:CONST},
{input:"scw", tag:"mi", output:"\u1D4CC", tex:null, ttype:CONST},
{input:"scx", tag:"mi", output:"\u1D4CD", tex:null, ttype:CONST},
{input:"scy", tag:"mi", output:"\u1D4CE", tex:null, ttype:CONST},
{input:"scz", tag:"mi", output:"\u1D4CF", tex:null, ttype:CONST},
*/

// binary operators
//{input:"-",  tag:"mo", output:"\u0096", tex:null, ttype:CONST},
{input:"*",  tag:"mo", output:"\u22C5", tex:"cdot", ttype:CONST},
{input:"**", tag:"mo", output:"\u2217", tex:"ast", ttype:CONST},
{input:"***", tag:"mo", output:"\u22C6", tex:"star", ttype:CONST},
{input:"//", tag:"mo", output:"/",      tex:'/', ttype:CONST, val:true},
{input:"\\\\", tag:"mo", output:"\\",   tex:"backslash", ttype:CONST},
{input:"setminus", tag:"mo", output:"\\", tex:null, ttype:CONST},
{input:"xx", tag:"mo", output:"\u00D7", tex:"times", ttype:CONST},
{input:"|><", tag:"mo", output:"\u22C9", tex:"ltimes", ttype:CONST},
{input:"><|", tag:"mo", output:"\u22CA", tex:"rtimes", ttype:CONST},
{input:"|><|", tag:"mo", output:"\u22C8", tex:"bowtie", ttype:CONST},
{input:"-:", tag:"mo", output:"\u00F7", tex:"div", ttype:CONST},
{input:"divide",   tag:"mo", output:"-:", tex:null, ttype:DEFINITION},
{input:"@",  tag:"mo", output:"\u2218", tex:"circ", ttype:CONST},
{input:"o+", tag:"mo", output:"\u2295", tex:"oplus", ttype:CONST},
{input:"ox", tag:"mo", output:"\u2297", tex:"otimes", ttype:CONST},
{input:"o.", tag:"mo", output:"\u2299", tex:"odot", ttype:CONST},
{input:"sum", tag:"mo", output:"\u2211", tex:null, ttype:UNDEROVER},
{input:"prod", tag:"mo", output:"\u220F", tex:null, ttype:UNDEROVER},
{input:"^^",  tag:"mo", output:"\u2227", tex:"wedge", ttype:CONST},
{input:"^^^", tag:"mo", output:"\u22C0", tex:"bigwedge", ttype:UNDEROVER},
{input:"vv",  tag:"mo", output:"\u2228", tex:"vee", ttype:CONST},
{input:"vvv", tag:"mo", output:"\u22C1", tex:"bigvee", ttype:UNDEROVER},
{input:"nn",  tag:"mo", output:"\u2229", tex:"cap", ttype:CONST},
{input:"nnn", tag:"mo", output:"\u22C2", tex:"bigcap", ttype:UNDEROVER},
{input:"uu",  tag:"mo", output:"\u222A", tex:"cup", ttype:CONST},
{input:"uuu", tag:"mo", output:"\u22C3", tex:"bigcup", ttype:UNDEROVER},

// relation symbols
{input:"!=",  tag:"mo", output:"\u2260", tex:"ne", ttype:CONST},
{input:":=",  tag:"mo", output:":=",     tex:null, ttype:CONST},
{input:"lt",  tag:"mo", output:"<",      tex:null, ttype:CONST},
{input:"<=",  tag:"mo", output:"\u2264", tex:"le", ttype:CONST},
{input:"lt=", tag:"mo", output:"\u2264", tex:"leq", ttype:CONST},
{input:"gt",  tag:"mo", output:">",      tex:null, ttype:CONST},
{input:">=",  tag:"mo", output:"\u2265", tex:"ge", ttype:CONST},
{input:"gt=", tag:"mo", output:"\u2265", tex:"geq", ttype:CONST},
{input:"-<",  tag:"mo", output:"\u227A", tex:"prec", ttype:CONST},
{input:"-lt", tag:"mo", output:"\u227A", tex:null, ttype:CONST},
{input:">-",  tag:"mo", output:"\u227B", tex:"succ", ttype:CONST},
{input:"-<=", tag:"mo", output:"\u2AAF", tex:"preceq", ttype:CONST},
{input:">-=", tag:"mo", output:"\u2AB0", tex:"succeq", ttype:CONST},
{input:"in",  tag:"mo", output:"\u2208", tex:null, ttype:CONST},
{input:"!in", tag:"mo", output:"\u2209", tex:"notin", ttype:CONST},
{input:"sub", tag:"mo", output:"\u2282", tex:"subset", ttype:CONST},
{input:"sup", tag:"mo", output:"\u2283", tex:"supset", ttype:CONST},
{input:"sube", tag:"mo", output:"\u2286", tex:"subseteq", ttype:CONST},
{input:"supe", tag:"mo", output:"\u2287", tex:"supseteq", ttype:CONST},
{input:"-=",  tag:"mo", output:"\u2261", tex:"equiv", ttype:CONST},
{input:"~=",  tag:"mo", output:"\u2245", tex:"cong", ttype:CONST},
{input:"~",  tag:"mo", output:"~", tex:"sim", ttype:CONST},
{input:"cong",tag:"mo",output:"~=",tex:null,ttype:DEFINITION},
{input:"~~",  tag:"mo", output:"\u2248", tex:"approx", ttype:CONST},
{input:"prop", tag:"mo", output:"\u221D", tex:"propto", ttype:CONST},

// logical symbols
{input:"and", tag:"mtext", output:"and", tex:null, ttype:SPACE},
{input:"or",  tag:"mtext", output:"or",  tex:null, ttype:SPACE},
{input:"not", tag:"mo", output:"\u00AC", tex:"neg", ttype:CONST},
{input:"=>",  tag:"mo", output:"\u21D2", tex:"implies", ttype:CONST},
{input:"implies",tag:"mo",output:"=>",tex:null,ttype:DEFINITION},
{input:"if",  tag:"mo", output:"if",     tex:null, ttype:SPACE},
{input:"<=>", tag:"mo", output:"\u21D4", tex:"iff", ttype:CONST},
{input:"iff",tag:"mo",output:"<=>",tex:null,ttype:DEFINITION},
{input:"AA",  tag:"mo", output:"\u2200", tex:"forall", ttype:CONST},
{input:"EE",  tag:"mo", output:"\u2203", tex:"exists", ttype:CONST},
{input:"_|_", tag:"mo", output:"\u22A5", tex:"bot", ttype:CONST},
{input:"TT",  tag:"mo", output:"\u22A4", tex:"top", ttype:CONST},
{input:"|--",  tag:"mo", output:"\u22A2", tex:"vdash", ttype:CONST},
{input:"|==",  tag:"mo", output:"\u22A8", tex:"models", ttype:CONST},

// grouping brackets
{input:"(", tag:"mo", output:"(", tex:null, ttype:LEFTBRACKET},
{input:")", tag:"mo", output:")", tex:null, ttype:RIGHTBRACKET},
{input:"[", tag:"mo", output:"[", tex:null, ttype:LEFTBRACKET},
{input:"]", tag:"mo", output:"]", tex:null, ttype:RIGHTBRACKET},
{input:"{", tag:"mo", output:"{", tex:"lbrace", ttype:LEFTBRACKET},
{input:"}", tag:"mo", output:"}", tex:"rbrace", ttype:RIGHTBRACKET},
{input:"|", tag:"mo", output:"|", tex:null, ttype:LEFTRIGHT},
//{input:"||", tag:"mo", output:"||", tex:null, ttype:LEFTRIGHT},
{input:"(:", tag:"mo", output:"\u2329", tex:"langle", ttype:LEFTBRACKET},
{input:":)", tag:"mo", output:"\u232A", tex:"rangle", ttype:RIGHTBRACKET},
{input:"<<", tag:"mo", output:"\u2329", tex:"langle", ttype:LEFTBRACKET},
{input:">>", tag:"mo", output:"\u232A", tex:"rangle", ttype:RIGHTBRACKET},
{input:"{:", tag:"mo", output:"{:", tex:null, ttype:LEFTBRACKET, invisible:true},
{input:":}", tag:"mo", output:":}", tex:null, ttype:RIGHTBRACKET, invisible:true},

// miscellaneous symbols
{input:"int",tag:"mo",output:"\u222B",tex:null,ttype:CONST},
{input:"dx",tag:"mi",output:"{:\"d\" x:}",tex:null,ttype:DEFINITION},
{input:"dy",tag:"mi",output:"{:\"d\" y:}",tex:null,ttype:DEFINITION},
{input:"dz",tag:"mi",output:"{:\"d\" z:}",tex:null,ttype:DEFINITION},
{input:"dt",tag:"mi",output:"{:\"d\" t:}",tex:null,ttype:DEFINITION},
{input:"oint",tag:"mo",output:"\u222E",tex:null,ttype:CONST},
{input:"del",tag:"mo",output:"\u2202",tex:"partial",ttype:CONST},
{input:"grad",tag:"mo",output:"\u2207",tex:"nabla",ttype:CONST},
{input:"+-",tag:"mo",output:"\u00B1",tex:"pm",ttype:CONST},
{input:"O/",tag:"mo",output:"\u2205",tex:"emptyset",ttype:CONST},
{input:"oo",tag:"mo",output:"\u221E",tex:"infty",ttype:CONST},
{input:"aleph",tag:"mo",output:"\u2135",tex:null,ttype:CONST},
{input:"...",tag:"mo",output:"...",tex:"ldots",ttype:CONST},
{input:":.",tag:"mo",output:"\u2234",tex:"therefore",ttype:CONST},
{input:":'",tag:"mo",output:"\u2235",tex:"because",ttype:CONST},
{input:"/_",tag:"mo",output:"\u2220",tex:"angle",ttype:CONST},
{input:"/_\\",tag:"mo",output:"\u25B3",tex:"triangle",ttype:CONST},
{input:"\\ ",tag:"mo",output:"\u00A0",tex:null,ttype:CONST,val:true},
{input:"quad",tag:"mo",output:"\u00A0\u00A0",tex:null,ttype:CONST},
{input:"qquad",tag:"mo",output:"\u00A0\u00A0\u00A0\u00A0",tex:null,ttype:CONST},
{input:"cdots",tag:"mo",output:"\u22EF",tex:null,ttype:CONST},
{input:"vdots",tag:"mo",output:"\u22EE",tex:null,ttype:CONST},
{input:"ddots",tag:"mo",output:"\u22F1",tex:null,ttype:CONST},
{input:"diamond",tag:"mo",output:"\u22C4",tex:null,ttype:CONST},
{input:"Lap",tag:"mo",output:"\u2112",tex:"mathscr{L}",ttype:CONST},
{input:"square",tag:"mo",output:"\u25A1",tex:"square",ttype:CONST},
{input:"|__",tag:"mo",output:"\u230A",tex:"lfloor",ttype:CONST},
{input:"__|",tag:"mo",output:"\u230B",tex:"rfloor",ttype:CONST},
{input:"|~",tag:"mo",output:"\u2308",tex:"lceil",ttype:CONST},
{input:"lceiling",tag:"mo",output:"|~",tex:null,ttype:DEFINITION},
{input:"~|",tag:"mo",output:"\u2309",tex:"rceil",ttype:CONST},
{input:"rceiling",tag:"mo",output:"~|",tex:null,ttype:DEFINITION},
{input:"CC",tag:"mo",output:"\u2102",tex:"mathbb{C}",ttype:CONST,notexcopy:true},
{input:"NN",tag:"mo",output:"\u2115",tex:"mathbb{N}",ttype:CONST,notexcopy:true},
{input:"QQ",tag:"mo",output:"\u211A",tex:"mathbb{Q}",ttype:CONST,notexcopy:true},
{input:"RR",tag:"mo",output:"\u211D",tex:"mathbb{R}",ttype:CONST,notexcopy:true},
{input:"ZZ",tag:"mo",output:"\u2124",tex:"mathbb{Z}",ttype:CONST,notexcopy:true},
{input:"f",tag:"mi",output:"f",tex:null,ttype:UNARY,func:true,val:true},
{input:"g",tag:"mi",output:"g",tex:null,ttype:UNARY,func:true,val:true},
{input:"'",   tag:"mo", output:"\u2032",  tex:"^\\prime", ttype:CONST, val:true},
{input:"''",tag:"mo",output:"\u2033", tex:null, ttype:CONST, val:true},
{input:"'''",tag:"mo",output:"\u2034", tex:null, ttype:CONST, val:true},

// standard functions
{input:"lim",  tag:"mo", output:"lim", tex:null, ttype:UNDEROVER},
{input:"sin",  tag:"mo", output:"sin", tex:null, ttype:UNARY, func:true},
{input:"cos",  tag:"mo", output:"cos", tex:null, ttype:UNARY, func:true},
{input:"tan",  tag:"mo", output:"tan", tex:null, ttype:UNARY, func:true},
{input:"sinh", tag:"mo", output:"sinh", tex:null, ttype:UNARY, func:true},
{input:"cosh", tag:"mo", output:"cosh", tex:null, ttype:UNARY, func:true},
{input:"tanh", tag:"mo", output:"tanh", tex:null, ttype:UNARY, func:true},
{input:"cot",  tag:"mo", output:"cot", tex:null, ttype:UNARY, func:true},
{input:"sec",  tag:"mo", output:"sec", tex:null, ttype:UNARY, func:true},
{input:"csc",  tag:"mo", output:"csc", tex:null, ttype:UNARY, func:true},
{input:"arcsin",  tag:"mo", output:"arcsin", tex:null, ttype:UNARY, func:true},
{input:"arccos",  tag:"mo", output:"arccos", tex:null, ttype:UNARY, func:true},
{input:"arctan",  tag:"mo", output:"arctan", tex:null, ttype:UNARY, func:true},
{input:"coth",  tag:"mo", output:"coth", tex:null, ttype:UNARY, func:true},
{input:"sech",  tag:"mo", output:"sech", tex:null, ttype:UNARY, func:true},
{input:"csch",  tag:"mo", output:"csch", tex:null, ttype:UNARY, func:true},
{input:"exp",  tag:"mo", output:"exp", tex:null, ttype:UNARY, func:true},
{input:"log",  tag:"mo", output:"log", tex:null, ttype:UNARY, func:true},
{input:"ln",   tag:"mo", output:"ln",  tex:null, ttype:UNARY, func:true},
{input:"det",  tag:"mo", output:"det", tex:null, ttype:UNARY, func:true},
{input:"dim",  tag:"mo", output:"dim", tex:null, ttype:CONST},
{input:"gcd",  tag:"mo", output:"gcd", tex:null, ttype:UNARY, func:true},
{input:"lcm",tag:"mo",output:"lcm",tex:"text{lcm}",ttype:UNARY,func:true,notexcopy:true},
{input:"min",  tag:"mo", output:"min", tex:null, ttype:UNDEROVER},
{input:"max",  tag:"mo", output:"max", tex:null, ttype:UNDEROVER},
{input:"Sup",  tag:"mo", output:"sup", tex:"text{sup}", ttype:UNDEROVER},
{input:"inf",  tag:"mo", output:"inf", tex:null, ttype:UNDEROVER},
{input:"mod",tag:"mo",output:"mod",tex:"text{mod}",ttype:CONST,notexcopy:true},
{input:"sgn",  tag:"mo", output:"sgn", tex:"text{sgn}", ttype:UNARY, func:true, notexcopy:true},
{input:"lub",tag:"mo",output:"lub",tex:null,ttype:CONST},
{input:"glb",tag:"mo",output:"glb",tex:null,ttype:CONST},
{input:"abs",tag:"mo",output:"abs",tex:null,ttype:UNARY,notexcopy:true,rewriteLR:["|","|"]},
{input:"norm",tag:"mo",output:"norm",tex:null,ttype:UNARY,notexcopy:true,rewriteLR:["\\|","\\|"]},
{input:"floor",tag:"mo",output:"floor",tex:null,ttype:UNARY,notexcopy:true,rewriteLR:["\\lfloor","\\rfloor"]},
{input:"ceil",tag:"mo",output:"ceil",tex:null,ttype:UNARY,notexcopy:true,rewriteLR:["\\lceil","\\rceil"]},

// arrows
{input:"uarr", tag:"mo", output:"\u2191", tex:"uparrow", ttype:CONST},
{input:"darr", tag:"mo", output:"\u2193", tex:"downarrow", ttype:CONST},
{input:"rarr", tag:"mo", output:"\u2192", tex:"rightarrow", ttype:CONST},
{input:"->",   tag:"mo", output:"\u2192", tex:"to", ttype:CONST},
{input:">->",   tag:"mo", output:"\u21A3", tex:"rightarrowtail", ttype:CONST},
{input:"->>",   tag:"mo", output:"\u21A0", tex:"twoheadrightarrow", ttype:CONST},
{input:">->>",   tag:"mo", output:"\u2916", tex:"twoheadrightarrowtail", ttype:CONST},
{input:"|->",  tag:"mo", output:"\u21A6", tex:"mapsto", ttype:CONST},
{input:"larr", tag:"mo", output:"\u2190", tex:"leftarrow", ttype:CONST},
{input:"harr", tag:"mo", output:"\u2194", tex:"leftrightarrow", ttype:CONST},
{input:"rArr", tag:"mo", output:"\u21D2", tex:"Rightarrow", ttype:CONST},
{input:"lArr", tag:"mo", output:"\u21D0", tex:"Leftarrow", ttype:CONST},
{input:"hArr", tag:"mo", output:"\u21D4", tex:"Leftrightarrow", ttype:CONST},
{input:"curvArrLt",tag:"mo",output:"\u21B6",tex:"curvearrowleft",ttype:CONST},
{input:"curvArrRt",tag:"mo",output:"\u21B7",tex:"curvearrowright",ttype:CONST},
{input:"circArrLt",tag:"mo",output:"\u21BA",tex:"circlearrowleft",ttype:CONST},
{input:"circArrRt",tag:"mo",output:"\u21BB",tex:"circlearrowright",ttype:CONST},
{input:"sqrt",tag:"msqrt",output:"sqrt",tex:null,ttype:UNARY},
{input:"root",tag:"mroot",output:"root",tex:null,ttype:BINARY},
{input:"frac",tag:"mfrac",output:"/",tex:null,ttype:BINARY},
{input:"/",tag:"mfrac",output:"/",tex:null,ttype:INFIX},
{input:"stackrel",tag:"mover",output:"stackrel",tex:null,ttype:BINARY},
{input:"_",tag:"msub",output:"_",tex:null,ttype:INFIX},
{input:"^",tag:"msup",output:"^",tex:null,ttype:INFIX},

// commands with argument
{input:"stackrel", tag:"mover", output:"stackrel", tex:null, ttype:BINARY},
{input:"overset", tag:"mover", output:"stackrel", tex:null, ttype:BINARY},
{input:"underset", tag:"munder", output:"stackrel", tex:null, ttype:BINARY},
{input:"hat", tag:"mover", output:"\u005E", tex:null, ttype:UNARY, acc:true},
{input:"arc", tag:"mover", output:"\u23DC", tex:"stackrel{\\frown}", ttype:UNARY, acc:true},
{input:"bar", tag:"mover", output:"\u00AF", tex:"overline", ttype:UNARY, acc:true},
{input:"vec", tag:"mover", output:"\u2192", tex:null, ttype:UNARY, acc:true},
{input:"tilde",tag:"mover",output:"~",tex:null,ttype:UNARY,acc:true},
{input:"dot", tag:"mover", output:".",tex:null, ttype:UNARY, acc:true},
{input:"ddot", tag:"mover", output:"..",tex:null, ttype:UNARY, acc:true},
{input:"ul", tag:"munder", output:"\u0332", tex:"underline", ttype:UNARY, acc:true},
{input:"underbrace", tag:"munder", output:"\u23DF", tex:"underbrace", ttype:UNARYUNDEROVER, acc:true},
{input:"overbrace", tag:"mover", output:"\u23DE", tex:"overbrace", ttype:UNARYUNDEROVER, acc:true},
{input:"color", tag:"mstyle", ttype:BINARY},
{input:"cancel", tag:"menclose", output:"cancel", tex:null, ttype:UNARY},
{input:"phantom", tag:"mphantom", tex:"phantom", ttype:UNARY},
{input:"text",tag:"mtext",output:"text",tex:null,ttype:TEXT},
{input:"mbox",tag:"mtext",output:"mbox",tex:null,ttype:TEXT},
{input:"\"",tag:"mtext",output:"mbox",tex:null,ttype:TEXT},

{input:"bb",tag:"mstyle",atname:"mathvariant",atval:"bold",output:"bb",tex:"mathbf",ttype:UNARY,notexcopy:true},
{input:"mathbf",tag:"mstyle",atname:"mathvariant",atval:"bold",output:"mathbf",tex:null,ttype:UNARY},
{input:"sf",tag:"mstyle",atname:"mathvariant",atval:"sans-serif",output:"sf",tex:"mathsf",ttype:UNARY,notexcopy:true},
{input:"mathsf",tag:"mstyle",atname:"mathvariant",atval:"sans-serif",output:"mathsf",tex:null,ttype:UNARY},
{input:"bbb",tag:"mstyle",atname:"mathvariant",atval:"double-struck",output:"bbb",tex:"mathbb",ttype:UNARY,notexcopy:true},
{input:"mathbb",tag:"mstyle",atname:"mathvariant",atval:"double-struck",output:"mathbb",tex:null,ttype:UNARY},
{input:"cc",tag:"mstyle",atname:"mathvariant",atval:"script",output:"cc",tex:"mathcal",ttype:UNARY,notexcopy:true},
{input:"mathcal",tag:"mstyle",atname:"mathvariant",atval:"script",output:"mathcal",tex:null,ttype:UNARY},
{input:"tt",tag:"mstyle",atname:"mathvariant",atval:"monospace",output:"tt",tex:"mathtt",ttype:UNARY,notexcopy:true},
{input:"mathtt",tag:"mstyle",atname:"mathvariant",atval:"monospace",output:"mathtt",tex:null,ttype:UNARY},
{input:"fr",tag:"mstyle",atname:"mathvariant",atval:"fraktur",output:"fr",tex:"mathfrak",ttype:UNARY,notexcopy:true},
{input:"mathfrak",tag:"mstyle",atname:"mathvariant",atval:"fraktur",output:"mathfrak",tex:null,ttype:UNARY},
{input:"bm", tag:"mstyle", atname:"mathvariant", atval:"bold-italic", output:"bm", tex:null, ttype:UNARY},
{input:"rm", tag:"mstyle", atname:"mathvariant", atval:"serif", output:"rm", tex:"mathrm", ttype:UNARY},

// zmx add
{input:"iint",  tag:"mo", output:"\u222C", tex:null, ttype:CONST, val:true},
{input:"iiint",  tag:"mo", output:"\u222D", tex:null, ttype:CONST, val:true},
{input:"oiint", tag:"mo", output:"\u222F", tex:null, ttype:CONST, val:true},
{input:"oiiint", tag:"mo", output:"\u2230", tex:null, ttype:CONST, val:true},
{input:"laplace",  tag:"mtext", output:"\u0394", tex:"Delta", ttype:CONST},
{input:"==",  tag:"mo", output:"\u2550\u2550\u2550\u2550", tex:null, ttype:CONST, val:true},
{input:"====",  tag:"mo", output:"\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550", tex:null, ttype:CONST, val:true},
{input:"////", tag:"mo", output:"\u2225", tex:null, ttype:CONST, val:true},
{input:"!//", tag:"mo", output:"\u2226", tex:null, ttype:CONST, val:true},
{input:"S=",  tag:"mo", output:"\u224C", tex:null, ttype:CONST, val:true},
{input:"S~", tag:"mo", output:"\u223D", tex:null, ttype:CONST, val:true},
{input:"!-=",  tag:"mo", output:"\u2262", tex:null, ttype:CONST, val:true},
{input:"!|", tag:"mo", output:"\u2224", tex:null, ttype:CONST, val:true},
{input:"!sube", tag:"mo", output:"\u2288", tex:null, ttype:CONST, val:true},
{input:"!supe", tag:"mo", output:"\u2289", tex:null, ttype:CONST, val:true},
{input:"subne", tag:"mo", output:"\u228A", tex:null, ttype:CONST, val:true},
{input:"supne", tag:"mo", output:"\u228B", tex:null, ttype:CONST, val:true},
{input:"normal", tag:"mo", output:"\u22B4", tex:null, ttype:CONST, val:true},

]); // AM.symbols

  var len = AM.symbols.length; // static length
  for (var i = 0; i < len; i++) {
    if (AM.symbols[i].tex && !AM.symbols[i].notexcopy) {
      AM.symbols.push({
        input: AM.symbols[i].tex, 
        tag: AM.symbols[i].tag,
        output: AM.symbols[i].output,
        ttype: AM.symbols[i].ttype,
        acc: AM.symbols[i].acc
      });
    }
  }
  AM.symbols.sort(function (s1,s2) {
    return s1.input > s2.input ? 1 : -1;
  });
  for (var i = 0; i < AM.symbols.length; i++)
    AMnames.push(AM.symbols[i].input);

} // initSymbols()

function newcommand(oldstr, newstr) {
  AM.symbols.push({
    input: oldstr,
    tag: 'mo',
    output: newstr,
    tex: null,
    ttype: DEFINITION
  });
}

// ----------------------------------------------------------------------

var body = document.body;
var MATHML = 'http://www.w3.org/1998/Math/MathML';
var XHTML = 'http://www.w3.org/1999/xhtml';
var isIE = (navigator.appName.slice(0,9) == 'Microsoft');

if (!document.getElementById) {
  alert("This webpage requires a recent browser such as Mozilla Firefox");
  return;
}

if (isIE) {
  // add MathPlayer info to IE webpages
  document.write('<object id="mathplayer" classid="clsid:32F66A20-7614-11D4-BD11-00104BD3F987"></object>');
  document.write('<?import namespace="m" implementation="#mathplayer"?>');
  // redefine functions
  document.createElementNS = function(namespace, tag) {
    if (namespace == MATHML)
      return document.createElement('m:' + tag);
    return document.createElement(tag);
  }
}

// imitate jquery (迫真)
function $(str, children, namespace) {
  if (typeof(str) == 'string') {
    if (str[0] == '#')
      return document.getElementById(str.slice(1));
    if (str[0] == '.')
      return document.getElementsByClassName(str.slice(1));
    if (str[0] == '"' && str.slice(-1) == '"')
      return document.createTextNode(str.slice(1,-1));
    if (str[0] == '<' && str.slice(-1) == '>') {
      var elem;
      str = str.slice(1,-1);
      if (namespace == MATHML)
        elem = document.createElementNS(MATHML, str);
      else if (!namespace)
        elem = document.createElement(str);
      else if (namespace == XHTML)
        elem = document.createElementNS(XHTML, str);
      if (!children)
        ;
      else if (typeof(children) == 'string')
        elem.appendChild(document.createTextNode(children));
      else if (children instanceof Node)
        elem.appendChild(children);
      else if (children instanceof Array)
        for (c of children)
          elem.appendChild(c);
      return elem;
    }
    if (str.length > 0)
      return document.getElementsByTagName(str);
  } else if (typeof(str) == 'undefined') {
    return document.createDocumentFragment();
  }
}

function $math(str, children) {
  elem = document.createElementNS(MATHML, str);
  if (children)
    elem.appendChild(children);
  return elem;
}

function $text(str) {
  return document.createTextNode(str);
}

function hasMathML() {
  var explorer = navigator.userAgent;
  var foundSafari = explorer.indexOf('Safari') >= 0;
  var isFirefox = explorer.indexOf('Firefox') >= 0;
  var isChrome = explorer.indexOf('Chrome') >= 0;
  var isIE = navigator.appName.slice(0,9) == 'Microsoft';
  var isOpera = navigator.appName.slice(0,5) == 'Opera';

  if (isChrome)
    return false;
  else if (isFirefox || findSafari)
    return navigator.appVersion.slice(0,1) >= '5';
  else if (isIE)
    try {
      new ActiveXObject('MathPlayer.Factory.1');
      return true;
    } catch (e) {}
  else if (isOpera) 
    return navigator.appVersion.slice(0,3) >= '9.5';
  else
    return false;
}

function notify(msgs) {
  var revert = body.onclick;
  body.onclick = function() {
    body.removeChild($('#AMMLwarningBox'));
    body.onclick = revert;
  }
  var div = $('<div>', null, XHTML);
  div.id = 'AMMLwarningBox';
  div.style = 'position:absolute; width:100%; top:0; left:0; z-index:200; text-align:center; font-size:1em; padding:0.5em 0 0.5em 0; color:#f00; background:#f99';

  var msg = 'To view the ASCIIMathML notation, use Mozilla Firefox >= 2.0 or latest version of Safari or Internet Explorer + MathPlayer.';
  var line = $('<div>', msg, XHTML);
  line.style.paddingBottom = '1em';
  div.appendChild(line);

  div.appendChild($('<p>', null, XHTML));
  div.appendChild($('"For instructions see the "'));
  var elem = $('<a>', 'ASCIIMathML', XHTML);
  elem.setAttribute('href', 'http://www.chapman.edu/~jipsen/asciimath.html');
  div.appendChild(elem);
  div.appendChild($('" homepage"'));
  elem = $('<div>', '(click anywhere to close)', XHTML);
  elem.id = 'AMMLcloseDiv';
  elem.style = 'font-size:0.8em; padding-top:1em; color:#014';
  div.appendChild(elem);
  body.insertBefore(div, body.firstChild);
}

// ---------------------------------------------------------------------

var isLeftBrace = /\(|\[|\{/;
var isRightBrace = /\)|\]|\}/;

// remove n characters and any following blanks
function trim(str, n) {
  while (str.charCodeAt(n) <= 32)
    ++n;
  return str.slice(n);
}

function strip(pair) {
  var node = pair[0];
  if (node.firstChild
    && (node.nodeName == 'mrow' || node.nodeName == 'M:MROW')
  ) {
    var grandchild = node.firstChild.firstChild;
    if (grandchild && isLeftBrace.test(grandchild.nodeValue))
      node.removeChild(node.firstChild);
    grandchild = node.lastChild.firstChild;
    if (grandchild && isRightBrace.test(grandchild.nodeValue))
      node.removeChild(node.lastChild);
  }
}

function stripTex(pair) {
  var node = pair[0];
  if (node[0] != '{' || node.slice(-1) != '}')
    return node;
  var leftchop = 0;
  var s;
  if (node.startsWith('\\left', 1)) {
    if (isLeftBrace.test(node.charAt(6)))
      leftchop = 7;
    else if (node.startsWith('\\lbrace', 6))
      leftchop = 13;
  } else if ((s = node.charAt(1)) && (s == "(" || s == "[")) {
    leftchop = 2;
  }
  if (leftchop > 0) {
    s = node.slice(-8);
    if (s == '\\right)}' || s == '\\right]}' || s == '\\right.}') {
      node = '{' + node.substr(leftchop);
      pair[0] = node.substr(0,node.length-8) + '}';
    } else if (s == '\\rbrace}') {
      node = '{' + node.substr(leftchop);
      pair[0] = node.substr(0,node.length-14) + '}';
    }
  }
}

function getTexSymbol(sym) {
  return sym.val ? (sym.tex || sym.output) : '\\' + (sym.tex || sym.input);
}

function getTexBracket(sym) {
  return sym.tex ? '\\' + sym.tex : sym.input;
}

// assumes arr is sorted
// return position >= lo where str appears or would be inserted
function position(arr, str, lo) { 
  var hi = arr.length-1;
  while (lo <= hi) {
    var mid = lo + ((hi-lo) >> 1);
    if (arr[mid] < str)
      lo = mid+1;
    else
      hi = mid-1;
  }
  return lo;
}

function b(s) {
  return '{' + s + '}';
}

// return true if s begins with {, end with } and they are matched
function braced(s) {
  if (s[0] != '{') return false;
  if (s.slice(-1) != '}') return false;
  var depth = 0;
  for (var i = 0; i < s.length; ++i) {
    if (s[i] == '{') ++depth;
    else if (s[i] == '}') --depth;
    if (depth == 0)
      return i == s.length-1;
  }
  return false;
}

// ----------------------------------------------------------------------

/*Parsing ASCII math expressions with the following grammar
v ::= [A-Za-z] | greek letters | numbers | other constant symbols
u ::= sqrt | text | bb | other unary symbols for font commands
b ::= frac | root | stackrel         binary symbols
l ::= ( | [ | { | (: | {:            left brackets
r ::= ) | ] | } | :) | :}            right brackets
S ::= v | lEr | uS | bSS             Simple expression
I ::= S_S | S^S | S_S^S | S          Intermediate expression
E ::= IE | I/I                       Expression
Each terminal symbol is translated into a corresponding mathml node.*/

var AMnestingDepth, AMprevSym, AMcurSym, AMesc1;

// -> token or bracket or empty
// return maximal initial substring of str that appears in names
// or return null if there is none
function getSymbol(str) {
  var k = 0, pos;
  for (var i = 1; i <= str.length; i++) {
    k = position(AMnames, str.slice(0,i), k);
    if (str.startsWith(AMnames[k])) {
      pos = k;
      i = AMnames[k].length;
    }
    if (k == AMnames.length
      || str.slice(0, AMnames[k].length) < AMnames[k])
      break;
  }
  AMprevSym = AMcurSym;
  if (typeof pos != 'undefined') {
    AMcurSym = AM.symbols[pos].ttype;
    return AM.symbols[pos]; 
  }

  AMcurSym = CONST;
  var st, tagst;
  if (/\d/.test(str[0])) {
    var i = 0;
    while (/\d/.test(str[++i]));
    if (str[i] == '.')
      while (/\d/.test(str[++i]));
    st = str.slice(0, i);
    tagst = 'mn';
  } else {
    st = str.charAt(0);
    if (/[a-zA-Z]/.test(st))
      tagst = 'mi';
    else if (st.charCodeAt(0) > 0x4e00)
      tagst = 'mtext';
    else
      tagst = 'mo';
  }

  var ret = {input:st, tag:tagst, output:st, ttype:CONST, val:true};
  if (st == '-' && AMprevSym == INFIX) {
    AMcurSym = INFIX;  // trick '/' into recognizing '-' on second parse
    ret['ttype'] = UNARY;
    ret['func'] = true;
  }
  return ret;
}

// str -> [node, tailstr]
function parseS(str) {
  var node, res, i, st;
  var sym = getSymbol(str);
  var len = sym.input.length;
  if (sym == null || sym.ttype == RIGHTBRACKET && AMnestingDepth > 0)
    return [null, str];
  if (sym.ttype == DEFINITION) {
    str = sym.output + trim(str, len); 
    sym = getSymbol(str);
    len = sym.input.length;
  }
  var frag = AM.katex ? '' : $();
  switch (sym.ttype) {
  case UNDEROVER:
  case CONST:
    str = trim(str, len);
    if (!AM.katex)
      return [$math(sym.tag, $text(sym.output)), str];
    else {
      var texsym = getTexSymbol(sym);
      return [ (texsym[0] == '\\' || sym.tag == 'mo' ?
        texsym : b(texsym)), str];
    }
  case LEFTBRACKET:
    str = trim(str, len); 
    AMnestingDepth++;
    res = parseExpr(str, true);
    AMnestingDepth--;
    if (!AM.katex) {
      if (sym.invisible) 
        node = $math('mrow', res[0]);
      else {
        node = $math('mo', $text(sym.output));
        node = $math('mrow', node);
        node.appendChild(res[0]);
      }
    } else {
      if (res[0].startsWith('\\right')) {
        res[0] = res[0][7] == '.' ? res[0].slice(7) : res[0].slice(6);
        node = sym.invisible ? b(res[0]) : b(getTexBracket(sym) + res[0]);
      } else {
        node = sym.invisible ? '{\\left.' + res[0] + '}' :
          '{\\left' + getTexBracket(sym) + res[0] + '}';
      }
    }
    return [node, res[1]];
  case TEXT:
    if (sym.input != '"')
      str = trim(str, len);
    if (str[0] == '{') i = str.indexOf('}');
    else if (str[0] == '(') i = str.indexOf(')');
    else if (str[0] == '[') i = str.indexOf(']');
    else if (sym.input == '"') i = str.indexOf('"', 1);
    else i = 0;
    if (i == -1)
      i = str.length;
    st = str.slice(1, i);
    if (!AM.katex) {
      if (st[0] == ' ') {
        node = $math('mspace');
        node.setAttribute('width', '1ex');
        frag.appendChild(node);
      }
      frag.appendChild($math(sym.tag, $text(st)));
      if (st.slice(-1) == ' ') {
        node = $math('mspace');
        node.setAttribute('width', '1ex');
        frag.appendChild(node);
      }
      return [$math('mrow', frag), trim(str, i+1)];
    } else {
      frag = (st[0] == ' ' ? '\\ ' : '')
        + '\\text{' + st + '}'
        + (st.slice(-1) == ' ' ? '\\ ' : '');
      return [frag, trim(str, i+1)];
    }
  case UNARYUNDEROVER:
  case UNARY:
    str = trim(str, len); 
    res = parseS(str);
    if (res[0] == null)
      return AM.katex ? [b(getTexSymbol(sym)), str] :
          [$math(sym.tag, $text(sym.output)), str];
    if (sym.func) {
      st = str.charAt(0);
      if (/\^|_|\/|\||,/.test(st) || (
        len == 1 && /\w/.test(sym.input) && st != '(')
      ) {
        return AM.katex ? [b(getTexSymbol(sym)), str] :
          [$math(sym.tag, $text(sym.output)),str];
      } else {
        if (!AM.katex) {
          node = $math('mrow', $math(sym.tag, $text(sym.output)));
          node.appendChild(res[0]);
        } else {
          node = ' ' + getTexSymbol(sym) + b(res[0]);
        }
        return [node, res[1]];
      }
    }
    strip(res);
    if (AM.katex) {
      if (sym.input == 'sqrt')
        return ['\\sqrt{' + res[0] + '}', res[1]];
      else if (sym.input == 'cancel')
        return ['\\cancel{' + res[0] + '}', res[1]];
      else if (sym.rewriteLR)
        return ['{\\left' + sym.rewriteLR[0] + res[0]
          + '\\right' + sym.rewriteLR[1] + '}', res[1]];
      else if (sym.acc)
        return [getTexSymbol(sym) + b(res[0]), res[1]];
      else
        return ['{' + getTexSymbol(sym) + '{' + res[0] + '}}', res[1]];
    }

    // sqrt
    if (sym.input == 'sqrt') {
      return [$math(sym.tag, res[0]), res[1]];
    }
    // abs, floor, ceil
    else if (sym.rewriteLR) {
        node = $math('mrow', $math('mo', $text(sym.rewriteLR[0])));
        node.appendChild(res[0]);
        node.appendChild($math('mo', $text(sym.rewriteLR[1])));
        return [node, res[1]];
    }
    // cancel
    else if (sym.input == 'cancel') {
      node = $math(sym.tag, res[0]);
      node.setAttribute('notation', 'updiagonalstrike');
      return [node, res[1]];
    }
    // accent
    else if (sym.acc) {
      node = $math(sym.tag, res[0]);
      node.appendChild($math('mo', $text(sym.output)));
      return [node, res[1]];
    }
    // font change command
    else {
      if (!isIE && sym.codes) {
        for (i = 0; i < res[0].childNodes.length; i++) {
          if (res[0].childNodes[i].nodeName == 'mi'
              || res[0].nodeName == 'mi') {
            st = (res[0].nodeName == 'mi' ?
              res[0].firstChild.nodeValue :
              res[0].childNodes[i].firstChild.nodeValue
            );
            var newst = [];
            for (var j = 0; j < st.length; j++) {
              var code = st.charCodeAt(j);
              if (code > 64 && code < 91) 
                newst += sym.codes[code-65];
              else if (code > 96 && code < 123) 
                newst += sym.codes[code-71];
              else
                newst += st.charAt(j);
            }
            if (res[0].nodeName == 'mi')
              res[0] = $math("mo").appendChild($text(newst));
            else res[0].replaceChild($math('mo')
              .appendChild($text(newst)), res[0].childNodes[i]);
          }
        }
      }
      node = $math(sym.tag, res[0]);
      node.setAttribute(sym.atname, sym.atval);
      return [node, res[1]];
    }
  case BINARY:
    str = trim(str, len); 
    res = parseS(str);
    if (res[0] == null)
      return AM.katex ? [b(getTexSymbol(sym)), str] :
          [$math("mo", $text(sym.input)), str];
    strip(res);
    var res2 = parseS(res[1]);
    if (res2[0] == null)
      return AM.katex ? [b(getTexSymbol(sym)), str] :
          [$math('mo', $text(sym.input)),str];
    strip(res2);
    if (AM.katex) {
      if (sym.input == 'color') {
        frag = '{\\color{' + res[0].replace(/[\{\}]/g,'') + '}'
          + res2[0] + '}';
      } else if (sym.input == 'root') {
        frag = '{\\sqrt[' + res[0] + ']{' + res2[0] + '}}';
      } else if (sym.output == 'stackrel') {
        frag = '{' + getTexSymbol(sym) + '{' + res[0] + '}{'
          + res2[0] + '}}';
      } else if (sym.input == "frac") {
        frag = '{\\frac{' + res[0] + '}{' + res2[0] + '}}';
      }
      return [frag,res2[1]];
    }

    if (sym.input=="color") {
      if (str.charAt(0) == '{') i = str.indexOf('}');
      else if (str.charAt(0) == '(') i = str.indexOf(')');
      else if (str.charAt(0) == '[') i = str.indexOf(']');
      st = str.slice(1, i);
      node = $math(sym.tag, res2[0]);
      node.setAttribute('mathcolor', st);
      return [node, res2[1]];
    }
    if (sym.input == 'root' || sym.output == 'stackrel') 
      frag.appendChild(res2[0]);
    frag.appendChild(res[0]);
    if (sym.input == 'frac')
      frag.appendChild(res2[0]);
    return [$math(sym.tag, frag), res2[1]];
  case INFIX:
    str = trim(str, len); 
    return AM.katex ? [sym.output, str] :
        [$math('mo', $text(sym.output)), str];
  case SPACE:
    str = trim(str, len); 
    if (AM.katex)
      return['{\\quad\\text{'+sym.input+'}\\quad}', str];
    node = $math('mspace');
    node.setAttribute('width', '1ex');
    frag.appendChild(node);
    frag.appendChild($math(sym.tag,$text(sym.output)));
    node = $math('mspace');
    node.setAttribute('width', '1ex');
    frag.appendChild(node);
    return [$math('mrow', frag), str];
  case LEFTRIGHT:
    str = trim(str, len); 
    AMnestingDepth++;
    res = parseExpr(str, false);
    AMnestingDepth--;
    if (AM.katex)
      return (res[0].slice(-1) == '|') ?
        ['{\\left|' + res[0] + '}', res[1]] : ['{|}', str];
    st = '';
    if (res[0].lastChild)
      st = res[0].lastChild.firstChild.nodeValue;
    if (st == '|') { // its an absolute value subterm
      node = $math('mo', $text(sym.output));
      node = $math('mrow', node);
      node.appendChild(res[0]);
      return [node, res[1]];
    } else {
      // the '|' is a \mid so use \u2223 (divides) for spacing
      node = $math('mo', $text('\u2223'));
      node = $math('mrow', node);
      return [node,str];
    }
  default:
    //console.warn("default");
    str = trim(str, len);
    return AM.katex ? [b(getTexSymbol(sym)), str] :
        [$math(sym.tag, $text(sym.output)),str];
  }
}

function parseI(str) {
  str = trim(str, 0);
  var sym1 = getSymbol(str);
  var res = parseS(str);
  var node = res[0];
  str = res[1];
  var sym = getSymbol(str);
  var sym2;
  if (sym.ttype == INFIX && sym.input != '/') {
    str = trim(str, sym.input.length);
    res = parseS(str);
    if (res[0])
      strip(res);
    else // show box in place of missing argument
      res[0] = AM.katex ? '{}' : $math("mo", $text("\u25A1"));
    str = res[1];
    var underover = (sym1.ttype == UNDEROVER || sym1.ttype == UNARYUNDEROVER);
    if (sym.input == '_') {
      sym2 = getSymbol(str);
      if (sym2.input == '^') {
        str = trim(str, sym2.input.length);
        var res2 = parseS(str);
        strip(res2);
        str = res2[1];
        if (!AM.katex) {
          node = $math((underover?'munderover':'msubsup'), node);
          node.appendChild(res[0]);
          node.appendChild(res2[0]);
          node = $math('mrow', node); // so sum does not stretch
        } else {
          node = '{' + node + '_{' + res[0] + '}^{' + res2[0] + '}}'
        }
      } else {
        if (!AM.katex) {
          node = $math((underover?'munder':'msub'), node);
          node.appendChild(res[0]);
        } else {
          node += '_{' + res[0] + '}';
        }
      }
    } else {
      if (!AM.katex) {
        node = (sym.input == '^' && underover ?
          $math('mover', node) : $math(sym.tag,node));
        node.appendChild(res[0]);
      } else {
        var lBraces = res[0].split('{').length;
        var rBraces = res[0].split('}').length;
        node += '^' + (lBraces == 2 && rBraces == 2 ? res[0] : b(res[0]));
      }
    }
    if (sym1.func) {
      sym2 = getSymbol(str);
      if (sym2.ttype != INFIX && sym2.ttype != RIGHTBRACKET) {
        res = parseI(str);
        if (!AM.katex) {
          node = $math('mrow', node);
          node.appendChild(res[0]);
        } else {
          node = b(node + res[0]);
        }
        str = res[1];
      }
    }
  }
  return [node, str];
}

/* new matrix grammar
  {:
    x ,= a + b + c + d;
    ,= abcd;
    ,= eeeee;
  :}
*/
function parseMatrix(sym, frag) {
  var ismatrix = false;
  for (var i = 0; i < frag.childNodes.length; ++i) {
    if (frag.childNodes[i].firstChild
      && frag.childNodes[i].firstChild.nodeValue == ';') {
      ismatrix = true;
      break;
    }
  }
  if (!ismatrix)
    return;
  var table = $(), row = $(), elem = $();
  while (frag.firstChild) {
    var val = frag.firstChild.firstChild.nodeValue;
    if (val == ';') {
      frag.removeChild(frag.firstChild);
      row.appendChild($math('mtd', elem));
      elem = $();
      table.appendChild($math('mtr', row));
      row = $();
    } else if (val == ',') {
      frag.removeChild(frag.firstChild);
      row.appendChild($math('mtd', elem));
      elem = $();
    } else {
      elem.appendChild(frag.firstChild);
    }
  }
  if (elem.firstChild)
    row.appendChild($math('mtd', elem));
  if (row.firstChild)
    table.appendChild($math('mtr', row));
  node = $math('mtable', table);
  if (sym.invisible) {
    node.setAttribute('columnalign', 'left');
    node.setAttribute('displaystyle', 'true');
  }
  frag.appendChild(node);
}

function parseMatrixTex(sym, frag) {
  var ismatrix = false;
  var len = frag.length;
  var depth = 0;
  for (i = 0; i < len; ++i) {
    if (isLeftBrace.test(frag[i]))
      ++depth;
    else if (isRightBrace.test(frag[i]))
      --depth;
    else if (frag[i] == ';' && depth == 0) {
      ismatrix = true;
      break;
    }
  }
  if (!ismatrix)
    return frag;
  var matrix = '';
  var begin = 0;
  var row = [];
  depth = 0;
  for (i = 0; i < len; ++i) {
    if (isLeftBrace.test(frag[i]))
      ++depth;
    else if (isRightBrace.test(frag[i]))
      --depth;
    else if (frag[i] == ';' && depth == 0) {
      row.push(frag.slice(begin, i));
      begin = i+1;
      matrix += row.join('&') + '\\\\';
      row = [];
    } else if (frag[i] == ',' && depth == 0) {
      row.push(frag.slice(begin, i));
      begin = i+1;
    }
  }
  if (begin < i)
    row.push(frag.slice(begin,i));
  if (row[0])
    matrix += row.join('&') + '\\\\';
  if (sym.invisible)
    return '\\begin{aligned}' + matrix + '\\end{aligned}';
  else
    return '\\begin{matrix}' + matrix + '\\end{matrix}';
}

function parseExpr(str, rightbracket) {
  var closed = false;
  var sym, copy;
  var frag = AM.katex ? '' : $();
  do {
    str = trim(str, 0);
    var res = parseI(str);
    copy = [res[0]];
    str = res[1];
    sym = getSymbol(str);
    // fractions
    if (sym.input == '/' && sym.ttype == INFIX) {
      str = trim(str, sym.input.length);
      res = parseI(str);
      if (res[0])
        strip(res);
      else // show box in place of missing argument
        res[0] = AM.katex ? '{}' : $math("mo", $text("\u25A1"));
      str = res[1];
      strip(copy);
      var node = copy[0];
      if (!AM.katex) {
        node = $math(sym.tag, node);
        node.appendChild(res[0]);
        frag.appendChild(node);
      } else {
        if (!braced(node))
          node = b(node);
        if (!braced(res[0]))
          res[0] = b(res[0]);
        frag += '\\frac' + node + res[0];
      }
      sym = getSymbol(str);
    } else if (copy[0]) {
      if (AM.katex)
        frag += copy[0];
      else
        frag.appendChild(copy[0]);
    }
  } while ((sym.ttype != RIGHTBRACKET
    && (sym.ttype != LEFTRIGHT || rightbracket)
    || AMnestingDepth == 0) && sym != null && sym.output != '');

  if (sym.ttype == RIGHTBRACKET || sym.ttype == LEFTRIGHT) {
    str = trim(str, sym.input.length);
    if (!AM.katex) {
      parseMatrix(sym, frag);
      if (!sym.invisible)
        frag.appendChild($math('mo', $text(sym.output)));
    } else {
      frag = parseMatrixTex(sym, frag);
      if (!sym.invisible) {
        frag += '\\right' + getTexBracket(sym);
        closed = true;
      }
    }
  }
  if (AM.katex && AMnestingDepth > 0 && !closed)
    frag += '\\right.';
  return [frag, str];
}

// str -> <math>
function parseMath(str) {
  AMnestingDepth = 0;
  var node = $math('mstyle', parseExpr(str.trimLeft(), false)[0]);
  if (AM.color)
    node.setAttribute('mathcolor', AM.color);
  if (AM.fontfamily)
    node.setAttribute('fontfamily', AM.fontfamily);
  if (AM.displaystyle)
    node.setAttribute('displaystyle', 'true');
  node = $math("math", node);
  if (AM.viewsource)
    node.setAttribute('title', str);
  return node;
}

function am2tex(str) {
  str = parseExpr(str.trimLeft(), false)[0];
  var args = [];
  if (AM.color)
    args.push('\\' + AM.color);
  if (AM.displaystyle)
    args.push('\\displaystyle');
  else
    args.push('\\textstyle');
  AM.texstr = args.join('') + str.replace(/(\$|%)/g, '\\$1');
  return AM.texstr;
}

function parseMathTex(str) {
  AMnestingDepth = 0;
  str = am2tex(str);
  var node = $('<span>', str);
  try {
    katex.render(str, node);
  } catch (e) {
    node.className = 'katex-error';
    console.error(e);
    console.log(str);
  }
  return node;
}

function parseNode(node) {
  var str = node.nodeValue;
  if (!str) return 0;
  var escaped = false;
  str = str.replace(AMesc1, function() {
    escaped = true; return 'AMesc1';
  }); // this is a problem??

  var arr = str.split(AM.delim1);
  if (arr.length > 1 || escaped) {
    var frag = $();
    var math = false;
    for (var i = 0; i < arr.length; ++i) {
      arr[i] = arr[i].replace(/AMesc1/g, AM.delim1);
      if (math)
        frag.appendChild(parseMath(arr[i]));
      else
        frag.appendChild($text(arr[i]));
      math = !math;
    }
    if (!math)
      console.warn('formula not closed:', str);
    node.parentNode.replaceChild(frag, node);
    return arr.length-1;
  }
  return 0;
}

// substitute formulae with mathml
function render(node) {
  if (node.nodeName == 'math' || node.nodeType == 8 // comment element
      || /form|textarea/i.test(node.parentNode.nodeName)
  ) return 0;

  if (node.childNodes.length > 0)
    for (var i = 0; i < node.childNodes.length; i++)
      i += render(node.childNodes[i]);

  return parseNode(node);
}

function autorender() {
  render(body);
}

function loadCss(url) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', url);
  document.body.appendChild(link);
}

function loadScript(url, callback) {
  var script = document.createElement('script');
  script.type = 'application/javascript';
  if (typeof(callback) != 'undefined') {
    if (script.readyState) { // IE
      script.onreadystatechange = function() {
        if (script.readyState == 'loaded'
            || script.readyState == 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      }
    } else { // others
      script.onload = function() { callback(); }
    }
  }
  script.src = url;
  document.body.appendChild(script);
}

function setDefaults(target, dict) {
  for (var attr in dict) {
    if (typeof target[attr] == 'undefined')
      target[attr] = dict[attr];
  }
}

function init() {

  setDefaults(AM, {
    katexpath: 'katex.min.js',
    onload: autorender,
    fixepsi: true,
    fixphi: true,
    delim1: '`',
    displaystyle:true,
    viewsource: false,
  });

  initSymbols();

  var toescape = /(\(|\)|\[|\]|\{|\}|\$|\^|\/|\\|\||\.|\*|\+|\?)/g;
  AM.delim1.replace(toescape, '\\$1');
  AMesc1 = new RegExp('\\\\' + AM.delim1, 'g');

  if (!AM.katex && hasMathML())
    return AM.onload();

  if (AM.katex === false)
    notify();

  // use katex & tex version of functions
  AM.katex = true;
  strip = stripTex;
  parseMatrix = parseMatrixTex;
  parseMath = parseMathTex;

  // local fonts cause CORS error
  loadCss('https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css');
  loadScript(AM.katexpath, AM.onload);
}

// setup onload function
if (typeof window.addEventListener == 'function') {
  // gecko, safari, konqueror and standard
  window.addEventListener('load', init, false);
} else if (typeof document.addEventListener == 'function') {
  // opera 7
  document.addEventListener('load', init, false);
} else if (typeof window.attachEvent == 'function') {
  // win/ie
  window.attachEvent('onload', init);
} else {
  // mac/ie5 and anything else that gets this far
  // if there's an existing onload function
  if (typeof window.onload == 'function') {
    // store it
    var existing = onload;
    // add new onload handler
    window.onload = function() {
      existing(); // call existing onload function
      init();     // call init onload function
    };
  } else {
    window.onload = init;
  }
}

// expose some functions to outside
AM.render = render;
AM.am2tex = am2tex;
})();
