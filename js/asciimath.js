/*
asciimath.js
============

This file is modified from ASCIIMathML.js by zmx0142857 <892298182@qq.com>

Put this file in the same folder with your html file and paste
following lines before the end of the <body> tag.

<!-- the configuration is optional and can be omitted -->
<script>
const asciimath = {
  env: undefined,       // default to browser
  katexpath: 'katex.min.js',// use katex as fallback if no MathML.
  katex: undefined,     // true=always, false=never, undefined=auto

  fixepsi: true,        // false to return to legacy epsi/varepsi mapping
  fixphi: true,         // false to return to legacy phi/varphi mapping

  delim1: '`',          // asciimath delimiter character 1
  displaystyle: true,   // put limits above and below large operators
  viewsource: false,    // show asciimath source code on mouse hover
  fontsize: undefined,  // change to e.g. '1.2em' for larger fontsize
  fontfamily: undefined,// inherit
  color: undefined,     // inherit
  define: [],           // preprocess substitutions

  symbols: [],          // symbols recognized by asciimath parser
  texstr: '',           // last return value of am2tex

  onload: function,     // this function is called when asciimath is ready

  // API
  am2tex: function,     // am2tex(str) -> texstr
  render: function,     // render(node)
}
</script>
<script src="asciimath.js"></script>
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

;(function(){

// token types
const CONST = 0,
  UNARY = 1,
  BINARY = 2,
  INFIX = 3,
  LEFTBRACKET = 4,
  RIGHTBRACKET = 5,
  SPACE = 6,
  UNDEROVER = 7,
  //DEFINITION = 8,
  LEFTRIGHT = 9,
  TEXT = 10,
  BIG = 11,
  LONG = 12,
  STRETCHY = 13,
  MATRIX = 14,
  UNARYUNDEROVER = 15

const AM = window.asciimath = {
  // configures
  katexpath: 'katex.min.js',
  onload: () => render(document.body),
  fixepsi: true,
  fixphi: true,
  delim1: '`',
  displaystyle: true,
  viewsource: false,
  ...(window.asciimath || {}),

  // defines
  define: [
    [/dx/g, '{:"d"x:}'],
    [/dy/g, '{:"d"y:}'],
    [/dz/g, '{:"d"z:}'],
    [/dt/g, '{:"d"t:}'],
    [/√/g, 'sqrt'],
    // partial short hand
    // part f x => (del f)/(del x)
    // part^3 f (x y^2) => (del^3 f)/(del x del y^2)
    // partial f x => del f x
    // TODO: part 只是正则替换, 词法上没有保证; 使用时需要手动用空格分隔参数
    [/part(\^\S*)?\s+(\S+)\s+(\([^)]*\)|\S+)/g, (match, $1, $2, $3) => {
      if (!$1) $1 = ''
      if ($3[0] === '(') $3 = $3.slice(1,-1).split(/\s+/).join(' del ')
      return `(del${$1} ${$2})/(del ${$3})`
    }],
    ...(window.asciimath && window.asciimath.define || [])
  ],

  // privates
  names: {}, // input entry for symbols
  str: undefined, // the asciimath string being processed
  begin: undefined, // the beginning of AMstr
}

// character lists for Mozilla/Netscape fonts
//cal: ['\uD835\uDC9C','\u212C','\uD835\uDC9E','\uD835\uDC9F','\u2130','\u2131','\uD835\uDCA2','\u210B','\u2110','\uD835\uDCA5','\uD835\uDCA6','\u2112','\u2133','\uD835\uDCA9','\uD835\uDCAA','\uD835\uDCAB','\uD835\uDCAC','\u211B','\uD835\uDCAE','\uD835\uDCAF','\uD835\uDCB0','\uD835\uDCB1','\uD835\uDCB2','\uD835\uDCB3','\uD835\uDCB4','\uD835\uDCB5',
//'\uD835\uDCB6','\uD835\uDCB7','\uD835\uDCB8','\uD835\uDCB9','\u212F','\uD835\uDCBB','\u210A','\uD835\uDCBD','\uD835\uDCBE','\uD835\uDCBF','\uD835\uDCC0','\uD835\uDCC1','\uD835\uDCC2','\uD835\uDCC3','\u2134','\uD835\uDCC5','\uD835\uDCC6','\uD835\uDCC7','\uD835\uDCC8','\uD835\uDCC9','\uD835\uDCCA','\uD835\uDCCB','\uD835\uDCCC','\uD835\uDCCD','\uD835\uDCCE','\uD835\uDCCF']

//frk: ['\uD835\uDD04','\uD835\uDD05','\u212D','\uD835\uDD07','\uD835\uDD08','\uD835\uDD09','\uD835\uDD0A','\u210C','\u2111','\uD835\uDD0D','\uD835\uDD0E','\uD835\uDD0F','\uD835\uDD10','\uD835\uDD11','\uD835\uDD12','\uD835\uDD13','\uD835\uDD14','\u211C','\uD835\uDD16','\uD835\uDD17','\uD835\uDD18','\uD835\uDD19','\uD835\uDD1A','\uD835\uDD1B','\uD835\uDD1C','\u2128',
//'\uD835\uDD1E','\uD835\uDD1F','\uD835\uDD20','\uD835\uDD21','\uD835\uDD22','\uD835\uDD23','\uD835\uDD24','\uD835\uDD25','\uD835\uDD26','\uD835\uDD27','\uD835\uDD28','\uD835\uDD29','\uD835\uDD2A','\uD835\uDD2B','\uD835\uDD2C','\uD835\uDD2D','\uD835\uDD2E','\uD835\uDD2F','\uD835\uDD30','\uD835\uDD31','\uD835\uDD32','\uD835\uDD33','\uD835\uDD34','\uD835\uDD35','\uD835\uDD36','\uD835\uDD37']

//bbb: ['\uD835\uDD38','\uD835\uDD39','\u2102','\uD835\uDD3B','\uD835\uDD3C','\uD835\uDD3D','\uD835\uDD3E','\u210D','\uD835\uDD40','\uD835\uDD41','\uD835\uDD42','\uD835\uDD43','\uD835\uDD44','\u2115','\uD835\uDD46','\u2119','\u211A','\u211D','\uD835\uDD4A','\uD835\uDD4B','\uD835\uDD4C','\uD835\uDD4D','\uD835\uDD4E','\uD835\uDD4F','\uD835\uDD50','\u2124',
//'\uD835\uDD52','\uD835\uDD53','\uD835\uDD54','\uD835\uDD55','\uD835\uDD56','\uD835\uDD57','\uD835\uDD58','\uD835\uDD59','\uD835\uDD5A','\uD835\uDD5B','\uD835\uDD5C','\uD835\uDD5D','\uD835\uDD5E','\uD835\uDD5F','\uD835\uDD60','\uD835\uDD61','\uD835\uDD62','\uD835\uDD63','\uD835\uDD64','\uD835\uDD65','\uD835\uDD66','\uD835\uDD67','\uD835\uDD68','\uD835\uDD69','\uD835\uDD6A','\uD835\uDD6B']

//scr: ['\u1D49C','\u1D49D','\u1D49E','\u1D49F','\u1D4A0','\u1D4A1','\u1D4A2','\u1D4A3','\u1D4A4','\u1D4A5','\u1D4A6','\u1D4A7','\u1D4A8','\u1D4A9','\u1D4AA','\u1D4AB;','\u1D4AC','\u1D4AD','\u1D4AE','\u1D4AF','\u1D4B0','\u1D4B1','\u1D4B2','\u1D4B3','\u1D4B4','\u1D4B5',
//'\u1D4B6','\u1D4B7','\u1D4B8','\u1D4B9','\u1D4BA','\u1D4BB','\u1D4BC','\u1D4BD','\u1D4BE','\u1D4BF','\u1D4C0','\u1D4C1','\u1D4C2','\u1D4C3','\u1D4C4','\u1D4C5','\u1D4C6','\u1D4C7','\u1D4C8','\u1D4C9','\u1D4CA','\u1D4CB','\u1D4CC','\u1D4CD','\u1D4CE','\u1D4CF']

const symbols = [
// greek letters
{input:'alpha',tag:'mi',output:'\u03B1',ttype:CONST},
{input:'beta',tag:'mi',output:'\u03B2',ttype:CONST},
{input:'gamma',tag:'mi',output:'\u03B3',ttype:CONST},
{input:'Gamma',tag:'mo',output:'\u0393',ttype:CONST},
{input:'delta',tag:'mi',output:'\u03B4',ttype:CONST},
{input:'Delta',tag:'mtext',output:'\u0394',ttype:CONST},
{input:'epsi',tag:'mi',output:AM.fixepsi?'\u03B5':'\u03F5',tex:AM.fixepsi?'varepsilon':'epsilon',ttype:CONST,notexcopy:true},
{input:'epsilon',tag:'mi',output:AM.fixepsi?'\u03B5':'\u03F5',tex:AM.fixepsi?'varepsilon':'epsilon',ttype:CONST,notexcopy:true},
{input:'varepsilon',tag:'mi',output:AM.fixepsi?'\u03F5':'\u03B5',tex:AM.fixepsi?'epsilon':'varepsilon',ttype:CONST,notexcopy:true},
{input:'zeta',tag:'mi',output:'\u03B6',ttype:CONST},
{input:'eta',tag:'mi',output:'\u03B7',ttype:CONST},
{input:'theta',tag:'mi',output:'\u03B8',ttype:CONST},
{input:'Theta',tag:'mo',output:'\u0398',ttype:CONST},
{input:'vartheta',tag:'mi',output:'\u03D1',ttype:CONST},
{input:'iota',tag:'mi',output:'\u03B9',ttype:CONST},
{input:'kappa',tag:'mi',output:'\u03BA',ttype:CONST},
{input:'lambda',tag:'mi',output:'\u03BB',ttype:CONST},
{input:'Lambda',tag:'mo',output:'\u039B',ttype:CONST},
{input:'mu',tag:'mi',output:'\u03BC',ttype:CONST},
{input:'nu',tag:'mi',output:'\u03BD',ttype:CONST},
{input:'xi',tag:'mi',output:'\u03BE',ttype:CONST},
{input:'Xi',tag:'mo',output:'\u039E',ttype:CONST},
{input:'pi',tag:'mi',output:'\u03C0',ttype:CONST},
{input:'Pi',tag:'mo',output:'\u03A0',ttype:CONST},
{input:'rho',tag:'mi',output:'\u03C1',ttype:CONST},
{input:'sigma',tag:'mi',output:'\u03C3',ttype:CONST},
{input:'Sigma',tag:'mo',output:'\u03A3',ttype:CONST},
{input:'tau',tag:'mi',output:'\u03C4',ttype:CONST},
{input:'upsilon',tag:'mi',output:'\u03C5',ttype:CONST},
{input:'phi',tag:'mi',output:AM.fixphi?'\u03D5':'\u03C6',tex:AM.fixphi?'phi':'varphi',ttype:CONST,notexcopy:true},
{input:'varphi',tag:'mi',output:AM.fixphi?'\u03C6':'\u03D5',tex:AM.fixphi?'varphi':'phi',ttype:CONST,notexcopy:true},
{input:'Phi',tag:'mo',output:'\u03A6',ttype:CONST},
{input:'chi',tag:'mi',output:'\u03C7',ttype:CONST},
{input:'psi',tag:'mi',output:'\u03C8',ttype:CONST},
{input:'Psi',tag:'mi',output:'\u03A8',ttype:CONST},
{input:'omega',tag:'mi',output:'\u03C9',ttype:CONST},
{input:'Omega',tag:'mo',output:'\u03A9',ttype:CONST},

// binary operators
//{input:'-',tag:'mo',output:'\u0096',ttype:CONST},
{input:'*',tag:'mo',output:'\u22C5',tex:'cdot',ttype:CONST},
{input:'**',tag:'mo',output:'\u2217',tex:'ast',ttype:CONST},
{input:'***',tag:'mo',output:'\u22C6',tex:'star',ttype:CONST},
{input:'//',tag:'mo',output:'/',tex:'{/}',ttype:CONST,nobackslash:true},
{input:'\\\\',tag:'mo',output:'\\',tex:'backslash',ttype:CONST},
{input:'setminus',tag:'mo',output:'\\',ttype:CONST},
{input:'xx',tag:'mo',output:'\u00D7',tex:'times',ttype:CONST},
{input:'|><',tag:'mo',output:'\u22C9',tex:'ltimes',ttype:CONST},
{input:'><|',tag:'mo',output:'\u22CA',tex:'rtimes',ttype:CONST},
{input:'|><|',tag:'mo',output:'\u22C8',tex:'bowtie',ttype:CONST},
{input:'-:',tag:'mo',output:'\u00F7',tex:'div',ttype:CONST},
{input:'@',tag:'mo',output:'\u2218',tex:'circ',ttype:CONST},
{input:'o+',tag:'mo',output:'\u2295',tex:'oplus',ttype:CONST},
{input:'ox',tag:'mo',output:'\u2297',tex:'otimes',ttype:CONST},
{input:'o.',tag:'mo',output:'\u2299',tex:'odot',ttype:CONST},
{input:'sum',tag:'mo',output:'\u2211',ttype:UNDEROVER},
{input:'prod',tag:'mo',output:'\u220F',ttype:UNDEROVER},
{input:'^^',tag:'mo',output:'\u2227',tex:'wedge',ttype:CONST},
{input:'^^^',tag:'mo',output:'\u22C0',tex:'bigwedge',ttype:UNDEROVER},
{input:'vv',tag:'mo',output:'\u2228',tex:'vee',ttype:CONST},
{input:'vvv',tag:'mo',output:'\u22C1',tex:'bigvee',ttype:UNDEROVER},
{input:'nn',tag:'mo',output:'\u2229',tex:'cap',ttype:CONST},
{input:'nnn',tag:'mo',output:'\u22C2',tex:'bigcap',ttype:UNDEROVER},
{input:'uu',tag:'mo',output:'\u222A',tex:'cup',ttype:CONST},
{input:'uuu',tag:'mo',output:'\u22C3',tex:'bigcup',ttype:UNDEROVER},

// relation symbols
{input:'!=',tag:'mo',output:'\u2260',tex:'ne',ttype:CONST},
{input:':=',tag:'mo',output:':=',ttype:CONST,nobackslash:true},
{input:'lt',tag:'mo',output:'<',ttype:CONST},
{input:'<=',tag:'mo',output:'\u2264',tex:'le',ttype:CONST},
{input:'lt=',tag:'mo',output:'\u2264',tex:'leq',ttype:CONST},
{input:'gt',tag:'mo',output:'>',ttype:CONST},
{input:'>=',tag:'mo',output:'\u2265',tex:'ge',ttype:CONST},
{input:'gt=',tag:'mo',output:'\u2265',tex:'geq',ttype:CONST},
{input:'-<',tag:'mo',output:'\u227A',tex:'prec',ttype:CONST},
{input:'-lt',tag:'mo',output:'\u227A',ttype:CONST},
{input:'>-',tag:'mo',output:'\u227B',tex:'succ',ttype:CONST},
{input:'-<=',tag:'mo',output:'\u2AAF',tex:'preceq',ttype:CONST},
{input:'>-=',tag:'mo',output:'\u2AB0',tex:'succeq',ttype:CONST},
{input:'in',tag:'mo',output:'\u2208',ttype:CONST},
{input:'!in',tag:'mo',output:'\u2209',tex:'notin',ttype:CONST},
{input:'sub',tag:'mo',output:'\u2282',tex:'subset',ttype:CONST},
{input:'sup',tag:'mo',output:'\u2283',tex:'supset',ttype:CONST},
{input:'sube',tag:'mo',output:'\u2286',tex:'subseteq',ttype:CONST},
{input:'supe',tag:'mo',output:'\u2287',tex:'supseteq',ttype:CONST},
{input:'-=',tag:'mo',output:'\u2261',tex:'equiv',ttype:CONST},
{input:'~=',tag:'mo',output:'\u2245',tex:'cong',ttype:CONST},
{input:'~',tag:'mo',output:'~',tex:'sim',ttype:CONST},
{input:'~~',tag:'mo',output:'\u2248',tex:'approx',ttype:CONST},
{input:'prop',tag:'mo',output:'\u221D',tex:'propto',ttype:CONST},
{input:'complement',tag:'mo',output:'complement',ttype:CONST},

// logical symbols
{input:'if',tag:'mtext',output:'if',ttype:SPACE},
{input:'otherwise',tag:'mtext',output:'otherwise',ttype:SPACE},
{input:'and',tag:'mtext',output:'and',ttype:SPACE},
{input:'or',tag:'mtext',output:'or',ttype:SPACE},
{input:'not',tag:'mo',output:'\u00AC',tex:'neg',ttype:CONST},
{input:'=>',tag:'mo',output:'\u21D2',tex:'implies',ttype:CONST},
{input:'<=>',tag:'mo',output:'\u21D4',tex:'iff',ttype:CONST},
{input:'AA',tag:'mo',output:'\u2200',tex:'forall',ttype:CONST},
{input:'EE',tag:'mo',output:'\u2203',tex:'exists',ttype:CONST},
{input:'_|_',tag:'mo',output:'\u22A5',tex:'bot',ttype:CONST},
{input:'TT',tag:'mo',output:'\u22A4',tex:'top',ttype:CONST},
{input:'|--',tag:'mo',output:'\u22A2',tex:'vdash',ttype:CONST},
{input:'|==',tag:'mo',output:'\u22A8',tex:'models',ttype:CONST},

// grouping brackets
{input:'(',tag:'mo',output:'(',ttype:LEFTBRACKET},
{input:')',tag:'mo',output:')',ttype:RIGHTBRACKET},
{input:'[',tag:'mo',output:'[',ttype:LEFTBRACKET},
{input:']',tag:'mo',output:']',ttype:RIGHTBRACKET},
{input:'{',tag:'mo',output:'{',tex:'lbrace',ttype:LEFTBRACKET},
{input:'}',tag:'mo',output:'}',tex:'rbrace',ttype:RIGHTBRACKET},
{input:'|',tag:'mo',output:'|',ttype:LEFTRIGHT},
//{input:'||',tag:'mo',output:'||',ttype:LEFTRIGHT},
{input:'(:',tag:'mo',output:'\u2329',tex:'langle',ttype:LEFTBRACKET},
{input:':)',tag:'mo',output:'\u232A',tex:'rangle',ttype:RIGHTBRACKET},
{input:'<<',tag:'mo',output:'\u2329',ttype:LEFTBRACKET},
{input:'>>',tag:'mo',output:'\u232A',ttype:RIGHTBRACKET},
{input:'{:',tag:'mo',output:'{:',ttype:LEFTBRACKET,invisible:true},
{input:':}',tag:'mo',output:':}',ttype:RIGHTBRACKET,invisible:true},

// miscellaneous symbols
{input:'int',tag:'mo',output:'\u222B',ttype:CONST},
{input:'oint',tag:'mo',output:'\u222E',ttype:CONST},
{input:'del',tag:'mo',output:'\u2202',tex:'partial',ttype:CONST},
{input:'grad',tag:'mo',output:'\u2207',tex:'nabla',ttype:CONST},
{input:'+-',tag:'mo',output:'\u00B1',tex:'pm',ttype:CONST},
{input:'O/',tag:'mo',output:'\u2205',tex:'varnothing',ttype:CONST},
{input:'oo',tag:'mo',output:'\u221E',tex:'infty',ttype:CONST},
{input:'aleph',tag:'mo',output:'\u2135',ttype:CONST},
{input:'...',tag:'mo',output:'...',tex:'ldots',ttype:CONST},
{input:':.',tag:'mo',output:'\u2234',tex:'therefore',ttype:CONST},
{input:":'",tag:'mo',output:'\u2235',tex:'because',ttype:CONST},
{input:'/_',tag:'mo',output:'\u2220',tex:'angle',ttype:CONST},
{input:'/_\\',tag:'mo',output:'\u25B3',tex:'triangle',ttype:CONST},
{input:'\\ ',tag:'mtext',output:'\u00A0',tex:' ',ttype:CONST},
{input:'quad',tag:'mo',output:'\u00A0\u00A0',tex:'quad',ttype:CONST},
{input:'qquad',tag:'mo',output:'\u00A0\u00A0\u00A0\u00A0',tex:'qquad',ttype:CONST},
{input:'cdots',tag:'mo',output:'\u22EF',ttype:CONST},
{input:'vdots',tag:'mo',output:'\u22EE',ttype:CONST},
{input:'ddots',tag:'mo',output:'\u22F1',ttype:CONST},
{input:'diamond',tag:'mo',output:'\u22C4',ttype:CONST},
{input:'Lap',tag:'mo',output:'\u2112',tex:'mathscr{L}',ttype:CONST,notexcopy:true},
{input:'square',tag:'mo',output:'\u25A1',ttype:CONST},
{input:'|__',tag:'mo',output:'\u230A',tex:'lfloor',ttype:CONST},
{input:'__|',tag:'mo',output:'\u230B',tex:'rfloor',ttype:CONST},
{input:'|~',tag:'mo',output:'\u2308',tex:'lceil',ttype:CONST},
{input:'~|',tag:'mo',output:'\u2309',tex:'rceil',ttype:CONST},
{input:'CC',tag:'mo',output:'\u2102',tex:'mathbb{C}',ttype:CONST,notexcopy:true},
{input:'NN',tag:'mo',output:'\u2115',tex:'mathbb{N}',ttype:CONST,notexcopy:true},
{input:'QQ',tag:'mo',output:'\u211A',tex:'mathbb{Q}',ttype:CONST,notexcopy:true},
{input:'RR',tag:'mo',output:'\u211D',tex:'mathbb{R}',ttype:CONST,notexcopy:true},
{input:'ZZ',tag:'mo',output:'\u2124',tex:'mathbb{Z}',ttype:CONST,notexcopy:true},
{input:"'",tag:'mo',output:'\u2032',tex:'^\\prime',ttype:CONST,nobackslash:true},
{input:"''",tag:'mo',output:'\u2033',ttype:CONST,tex:'^{\\prime\\prime}',nobackslash:true},
{input:"'''",tag:'mo',output:'\u2034',ttype:CONST,tex:'^{\\prime\\prime\\prime}',nobackslash:true},

// functions
{input:'!!',tag:'mo',output:'!!',ttype:UNARY,rfunc:true,nobackslash:true},
{input:'!',tag:'mo',output:'!',ttype:UNARY,rfunc:true,nobackslash:true},
{input:'f',tag:'mi',output:'f',ttype:UNARY,func:true,nobackslash:true},
{input:'g',tag:'mi',output:'g',ttype:UNARY,func:true,nobackslash:true},
{input:'lim',tag:'mo',output:'lim',ttype:UNDEROVER},
{input:'sin',tag:'mo',output:'sin',ttype:UNARY,func:true},
{input:'cos',tag:'mo',output:'cos',ttype:UNARY,func:true},
{input:'tan',tag:'mo',output:'tan',ttype:UNARY,func:true},
{input:'sinh',tag:'mo',output:'sinh',ttype:UNARY,func:true},
{input:'cosh',tag:'mo',output:'cosh',ttype:UNARY,func:true},
{input:'tanh',tag:'mo',output:'tanh',ttype:UNARY,func:true},
{input:'cot',tag:'mo',output:'cot',ttype:UNARY,func:true},
{input:'sec',tag:'mo',output:'sec',ttype:UNARY,func:true},
{input:'csc',tag:'mo',output:'csc',ttype:UNARY,func:true},
{input:'arcsin',tag:'mo',output:'arcsin',ttype:UNARY,func:true},
{input:'arccos',tag:'mo',output:'arccos',ttype:UNARY,func:true},
{input:'arctan',tag:'mo',output:'arctan',ttype:UNARY,func:true},
{input:'coth',tag:'mo',output:'coth',ttype:UNARY,func:true},
{input:'sech',tag:'mo',output:'sech',ttype:UNARY,func:true},
{input:'csch',tag:'mo',output:'csch',ttype:UNARY,func:true},
{input:'exp',tag:'mo',output:'exp',ttype:UNARY,func:true},
{input:'log',tag:'mo',output:'log',ttype:UNARY,func:true},
{input:'ln',tag:'mo',output:'ln',ttype:UNARY,func:true},
{input:'det',tag:'mo',output:'det',ttype:UNARY,func:true},
{input:'dim',tag:'mo',output:'dim',ttype:CONST},
{input:'gcd',tag:'mo',output:'gcd',ttype:UNARY,func:true},
{input:'lcm',tag:'mo',output:'lcm',tex:'text{lcm}',ttype:UNARY,func:true,notexcopy:true},
{input:'min',tag:'mo',output:'min',ttype:UNDEROVER},
{input:'max',tag:'mo',output:'max',ttype:UNDEROVER},
{input:'Sup',tag:'mo',output:'sup',tex:'text{sup}',ttype:UNDEROVER},
{input:'inf',tag:'mo',output:'inf',ttype:UNDEROVER},
{input:'mod',tag:'mo',output:'mod',tex:'text{mod}',ttype:CONST,notexcopy:true},
{input:'sgn',tag:'mo',output:'sgn',tex:'text{sgn}',ttype:UNARY,func:true,notexcopy:true},
{input:'lub',tag:'mo',output:'lub',ttype:CONST},
{input:'glb',tag:'mo',output:'glb',ttype:CONST},
{input:'abs',tag:'mo',output:'abs',ttype:UNARY,rewriteLR:['|','|']},
{input:'norm',tag:'mo',output:'norm',ttype:UNARY,rewriteLR:['\\|','\\|']},
{input:'floor',tag:'mo',output:'floor',ttype:UNARY,rewriteLR:['\\lfloor','\\rfloor']},
{input:'ceil',tag:'mo',output:'ceil',ttype:UNARY,rewriteLR:['\\lceil','\\rceil']},

// arrows
{input:'uarr',tag:'mo',output:'\u2191',tex:'uparrow',ttype:CONST},
{input:'darr',tag:'mo',output:'\u2193',tex:'downarrow',ttype:CONST},
{input:'rarr',tag:'mo',output:'\u2192',tex:'rightarrow',ttype:CONST},
{input:'->',tag:'mo',output:'\u2192',tex:'to',ttype:CONST},
{input:'>->',tag:'mo',output:'\u21A3',tex:'rightarrowtail',ttype:CONST},
{input:'->>',tag:'mo',output:'\u21A0',tex:'twoheadrightarrow',ttype:CONST},
{input:'>->>',tag:'mo',output:'\u2916',tex:'twoheadrightarrowtail',ttype:CONST},
{input:'|->',tag:'mo',output:'\u21A6',tex:'mapsto',ttype:CONST},
{input:'larr',tag:'mo',output:'\u2190',tex:'leftarrow',ttype:CONST},
{input:'harr',tag:'mo',output:'\u2194',tex:'leftrightarrow',ttype:CONST},
{input:'rArr',tag:'mo',output:'\u21D2',tex:'Rightarrow',ttype:CONST},
{input:'lArr',tag:'mo',output:'\u21D0',tex:'Leftarrow',ttype:CONST},
{input:'hArr',tag:'mo',output:'\u21D4',tex:'Leftrightarrow',ttype:CONST},
{input:'curvArrLt',tag:'mo',output:'\u21B6',tex:'curvearrowleft',ttype:CONST},
{input:'curvArrRt',tag:'mo',output:'\u21B7',tex:'curvearrowright',ttype:CONST},
{input:'circArrLt',tag:'mo',output:'\u21BA',tex:'circlearrowleft',ttype:CONST},
{input:'circArrRt',tag:'mo',output:'\u21BB',tex:'circlearrowright',ttype:CONST},
{input:'sqrt',tag:'msqrt',output:'sqrt',ttype:UNARY},
{input:'root',tag:'mroot',output:'root',ttype:BINARY},
{input:'frac',tag:'mfrac',output:'/',ttype:BINARY},
{input:'/',tag:'mfrac',output:'/',ttype:INFIX},
{input:'_',tag:'msub',output:'_',ttype:INFIX},
{input:'^',tag:'msup',output:'^',ttype:INFIX},

// commands with argument
{input:'stackrel',tag:'mover',output:'stackrel',ttype:BINARY},
{input:'overset',tag:'mover',output:'stackrel',ttype:BINARY},
{input:'underset',tag:'munder',output:'stackrel',ttype:BINARY},
{input:'hat',tag:'mover',output:'\u005E',ttype:UNARY,acc:true},
{input:'arc',tag:'mover',output:'\u23DC',tex:'stackrel{\\frown}',ttype:UNARY,acc:true},
{input:'bar',tag:'mover',output:'\u00AF',tex:'overline',ttype:UNARY,acc:true},
{input:'vec',tag:'mover',output:'\u2192',ttype:UNARY,acc:true},
{input:'tilde',tag:'mover',output:'~',ttype:UNARY,acc:true},
{input:'dot',tag:'mover',output:'.',ttype:UNARY,acc:true},
{input:'ddot',tag:'mover',output:'..',ttype:UNARY,acc:true},
{input:'ul',tag:'munder',output:'\u0332',tex:'underline',ttype:UNARY,acc:true},
{input:'underbrace',tag:'munder',output:'\u23DF',ttype:UNARYUNDEROVER,acc:true},
{input:'overbrace',tag:'mover',output:'\u23DE',ttype:UNARYUNDEROVER,acc:true},
{input:'color',tag:'mstyle',ttype:BINARY},
{input:'phantom',tag:'mphantom',ttype:UNARY},
{input:'text',tag:'mtext',output:'text',ttype:TEXT},
{input:'mbox',tag:'mtext',output:'mbox',ttype:TEXT},
{input:'"',tag:'mtext',output:'mbox',ttype:TEXT},
{input:'op',tag:'mo',output:'operatorname',tex:'operatorname',ttype:UNARY},

// font commands
{input:'cancel',tag:'menclose',output:'cancel',ttype:UNARY,atname:'notation',atval:'updiagonalstrike'},
{input:'bb',tag:'mstyle',atname:'mathvariant',atval:'bold',output:'bb',tex:'mathbf',ttype:UNARY,notexcopy:true},
{input:'mathbf',tag:'mstyle',atname:'mathvariant',atval:'bold',output:'mathbf',ttype:UNARY},
{input:'sf',tag:'mstyle',atname:'mathvariant',atval:'sans-serif',output:'sf',tex:'mathsf',ttype:UNARY,notexcopy:true},
{input:'mathsf',tag:'mstyle',atname:'mathvariant',atval:'sans-serif',output:'mathsf',ttype:UNARY},
{input:'bbb',tag:'mstyle',atname:'mathvariant',atval:'double-struck',output:'bbb',tex:'mathbb',ttype:UNARY,notexcopy:true},
{input:'mathbb',tag:'mstyle',atname:'mathvariant',atval:'double-struck',output:'mathbb',ttype:UNARY},
{input:'cc',tag:'mstyle',atname:'mathvariant',atval:'script',output:'cc',tex:'mathcal',ttype:UNARY,notexcopy:true},
{input:'mathcal',tag:'mstyle',atname:'mathvariant',atval:'script',output:'mathcal',ttype:UNARY},
{input:'tt',tag:'mstyle',atname:'mathvariant',atval:'monospace',output:'tt',tex:'mathtt',ttype:UNARY,notexcopy:true},
{input:'mathtt',tag:'mstyle',atname:'mathvariant',atval:'monospace',output:'mathtt',ttype:UNARY},
{input:'fr',tag:'mstyle',atname:'mathvariant',atval:'fraktur',output:'fr',tex:'mathfrak',ttype:UNARY,notexcopy:true},
{input:'mathfrak',tag:'mstyle',atname:'mathvariant',atval:'fraktur',output:'mathfrak',ttype:UNARY},
{input:'bm',tag:'mstyle',atname:'mathvariant',atval:'bold-italic',output:'bm',tex:'boldsymbol',ttype:UNARY},
{input:'rm',tag:'mstyle',atname:'mathvariant',atval:'serif',output:'rm',tex:'mathrm',ttype:UNARY},

// zmx add
{input:'iint',tag:'mo',output:'\u222C',ttype:CONST},
{input:'iiint',tag:'mo',output:'\u222D',ttype:CONST},
{input:'oiint',tag:'mo',output:'\u222F',ttype:CONST,nobackslash:true},
{input:'oiiint',tag:'mo',output:'\u2230',ttype:CONST,nobackslash:true},
{input:'laplace',tag:'mtext',output:'\u0394',tex:'Delta',ttype:CONST,notexcopy:true},
{input:'==',tag:'mo',output:'\u2550\u2550',tex:'xlongequal',ttype:UNDEROVER},
{input:'||',tag:'mo',output:'\u2225',tex:'Vert',ttype:CONST},
{input:'!||',tag:'mo',output:'\u2226',ttype:CONST,nobackslash:true},
{input:'S=',tag:'mo',output:'\u224C',ttype:CONST,nobackslash:true},
{input:'S~',tag:'mo',output:'\u223D',ttype:CONST,nobackslash:true},
{input:'!-=',tag:'mo',output:'\u2262',tex:'not\\equiv',ttype:CONST},
{input:'!|',tag:'mo',output:'\u2224',ttype:CONST,nobackslash:true},
{input:'!sube',tag:'mo',output:'\u2288',ttype:CONST,nobackslash:true},
{input:'!supe',tag:'mo',output:'\u2289',ttype:CONST,nobackslash:true},
{input:'subne',tag:'mo',output:'\u228A',ttype:CONST,nobackslash:true},
{input:'supne',tag:'mo',output:'\u228B',ttype:CONST,nobackslash:true},
{input:'lhd',tag:'mo',output:'\u22B2',tex:'lhd',ttype:CONST},
{input:'rhd',tag:'mo',output:'\u22B3',tex:'rhd',ttype:CONST},
{input:'normal',tag:'mo',output:'\u22B4',tex:'unlhd',ttype:CONST},
{input:'rnormal',tag:'mo',output:'\u22B5',tex:'unrhd',ttype:CONST},
...(window.asciimath.symbols || [])
] // symbols

function initSymbols() {
  // tex copy
  symbols.forEach(sym => {
    if (sym.tex && !sym.notexcopy) {
      symbols.push({
        ...sym,
        input: sym.tex,
        tex: undefined,
        notexcopy: undefined
      })
    }
  })

  // build trie
  symbols.forEach(sym => {
    let node = AM.names
    sym.input.split('').forEach(ch => {
      node = node[ch] = node[ch] || Object.create(null)
    })
    node['\0'] = sym // preserved key
  })
}

const isLeftBrace = /\(|\[|\{/
const isRightBrace = /\)|\]|\}/

function b(s) {
  if (s[0] === ' ') s = s.slice(1)
  return braced(s) ? s : '{' + s + '}'
}

// return true if s begins with {, end with } and they are matched
function braced(s) {
  if (s[0] !== '{' || s.slice(-1) !== '}') return false
  let depth = 0
  for (let i = 0; i < s.length; ++i) {
    if (s[i] === '{') ++depth
    else if (s[i] === '}') --depth
    if (depth === 0)
      return i === s.length-1
  }
  return false
}

// backend of am; outputs mathml
let yields = {
  init () {
    return $()
  },
  strip (node) {
    if (node.firstChild
      && (node.nodeName === 'mrow' || node.nodeName === 'M:MROW')
    ) {
      let grandchild = node.firstChild.firstChild
      if (grandchild && isLeftBrace.test(grandchild.nodeValue))
        node.removeChild(node.firstChild)
      grandchild = node.lastChild.firstChild
      if (grandchild && isRightBrace.test(grandchild.nodeValue))
        node.removeChild(node.lastChild)
    }
    return node
  },
  consts (sym) {
    return $math(sym.tag, sym.output)
  },
  leftBracket (sym, res) {
    return sym.invisible ? $math('mrow', res)
      : $math('mrow', [$math('mo', sym.output), res])
  },
  text (sym, st) {
    const buf = []
    if (st[0] === ' ') buf.push($mspace())
    buf.push($math(sym.tag, st))
    if (st.slice(-1) === ' ') buf.push($mspace())
    return $math('mrow', buf)
  },
  directOutput (sym) {
    return $math(sym.tag, sym.output)
  },
  moOutput (sym) {
    return $math('mo', sym.input)
  },
  func (sym, res) {
    return $math('mrow', [
      $math(sym.tag, sym.output),
      res
    ])
  },
  unary (sym, res, rewind) {
    if (sym.input === 'op') // op
      return $math('mo', parse.arg(rewind))
    if (sym.input === 'sqrt') // sqrt
      return $math(sym.tag, res)
    if (sym.rewriteLR) // abs, floor, ceil
      return $math('mrow', [
        $math('mo', sym.rewriteLR[0]),
        res,
        $math('mo', sym.rewriteLR[1])
      ])
    if (sym.acc) // accent
      return $math(sym.tag, [
        res,
        $math('mo', sym.output)
      ])
    // font change command
    const node = $math(sym.tag, res)
    node.setAttribute(sym.atname, sym.atval)
    return node
  },
  binary (sym, res, res2, rewind) {
    if (sym.input === 'color') {
      node = $math(sym.tag, res2)
      node.setAttribute('mathcolor', parse.arg(rewind))
      return node
    }
    if (sym.input === 'root' || sym.output === 'stackrel')
      return $math(sym.tag, [res2, res])
    if (sym.input === 'frac')
      return $math(sym.tag, [res, res2])
  },
  infixOutput (sym) {
    return $math('mo', sym.output)
  },
  space (sym) {
    return $math('mrow', [
      $mspace(),
      $math(sym.tag, sym.output),
      $mspace(),
    ])
  },
  leftRight (sym, res, rewind) {
    const st = res.lastChild ? res.lastChild.firstChild.nodeValue : ''
    if (st === '|') { // absolute value subterm
      return $math('mrow', [
        $math('mo', sym.output),
        res
      ])
    } else {
      // the '|' is a \mid so maybe use \u2223 (divides) for spacing??
      AM.begin = rewind
      return $math('mo', '|')
    }
  },
  rfunc (sym, res) {
    return $math('mrow', [
      res,
      $math('mo', sym.output)
    ])
  },
  infix (sym0, sym1, sym2, node, res, res2, subFirst, underover) {
    // wrap in <mrow> so sum does not stretch
    return $math('mrow',
      $math(underover ? 'munderover' : 'msubsup',
        subFirst ? [node, res, res2] : [node, res2, res]
      )
    )
  },
  infixHalf (sym0, sym1, node, res, subFirst, underover) {
    if (subFirst) {
      return $math(underover ? 'munder' : 'msub', [node, res])
    } else {
      return $math(underover ? 'mover' : 'msup', [node, res])
    }
  },
  infixFunc (node, res) {
    return $math('mrow', [node, res])
  },
  placeholder () {
    return $math('mo', '\u25A1')
  },
  infixNode (sym0, node) {
    return node
  },
  push (sym, frag, node, res) {
    if (res) {
      frag.appendChild(
        $math(sym.tag, [node, res])
      )
    } else {
      frag.appendChild(node)
    }
  },
  /* new matrix grammar
    {:
      x ,= a + b + c + d
      ,= abcd
      ,= eeeee
    :}
  */
  matrix (sym, frag) {
    let ismatrix = false
    for (let i = 0; i < frag.childNodes.length; ++i) {
      if (frag.childNodes[i].firstChild
        && frag.childNodes[i].firstChild.nodeValue === ';') {
        ismatrix = true
        break
      }
    }
    if (!ismatrix)
      return
    let table = $(), row = $(), elem = $()
    while (frag.firstChild) {
      let val = frag.firstChild.firstChild.nodeValue
      if (val === ';') {
        frag.removeChild(frag.firstChild)
        row.appendChild($math('mtd', elem))
        elem = $()
        table.appendChild($math('mtr', row))
        row = $()
      } else if (val === ',') {
        frag.removeChild(frag.firstChild)
        row.appendChild($math('mtd', elem))
        elem = $()
      } else {
        elem.appendChild(frag.firstChild)
      }
    }
    if (elem.firstChild)
      row.appendChild($math('mtd', elem))
    if (row.firstChild)
      table.appendChild($math('mtr', row))
    node = $math('mtable', table)
    if (sym.invisible) {
      node.setAttribute('columnalign', 'left')
      node.setAttribute('displaystyle', 'true')
    }
    frag.appendChild(node)
  },
  closeMatrix (sym, frag) {
    frag.appendChild($math('mo', sym.output))
  },
  join (frag, closed) {
    return frag
  },
}

// another backend of am; outputs tex
const yieldsTex = {
  init () {
    return []
  },
  strip (node) {
    if (node[0] !== '{' || node.slice(-1) !== '}') return node
    let leftchop = 0, s
    if (node.startsWith('\\left', 1)) {
      if (isLeftBrace.test(node.charAt(6)))
        leftchop = 7
      else if (node.startsWith('\\lbrace', 6))
        leftchop = 13
    } else {
      s = node.charAt(1)
      if (s === "(" || s === "[")
        leftchop = 2
    }
    if (leftchop > 0) {
      s = node.slice(-8)
      if (s === '\\right)}' || s === '\\right]}' || s === '\\right.}') {
        node = b(node.slice(leftchop, -8))
      } else if (s === '\\rbrace}') {
        node = b(node.slice(leftchop, -14))
      }
    }
    return node
  },
  consts (sym) {
    const node = parse.texSymbol(sym)
    // prefix consts with space, prefix control sequences with backslash
    return node[0] === '\\' || sym.tag === 'mo' ? node : ' ' + node
  },
  leftBracket (sym, res) {
    if (res.startsWith('\\right')) {
      res = res[6] === '.' ? res.slice(7) : res.slice(6)
      return sym.invisible ? b(res) : b(parse.texCtrl(sym) + res)
    } else {
      return sym.invisible ? '{\\left.' + res + '}' :
        '{\\left' + parse.texCtrl(sym) + res + '}'
    }
  },
  text (sym, st) {
    st = st.replace(/{/g, '\\{').replace(/}/g, '\\}')
    return (st[0] === ' ' ? '\\ ' : '')
      + '\\text{' + st + '}'
      + (st.slice(-1) === ' ' ? '\\ ' : '')
  },
  directOutput (sym) {
    return b(parse.texSymbol(sym)) 
  },
  moOutput (sym) {
    return b(parse.texSymbol(sym))
  },
  func (sym, res) {
    return ' ' + parse.texSymbol(sym) + b(res)
  },
  unary (sym, res) {
    if (sym.input === 'sqrt')
      return '\\sqrt' + b(res)
    if (sym.input === 'cancel')
      return '\\cancel' + b(res)
    if (sym.rewriteLR)
      return '\\left' + sym.rewriteLR[0] + res + '\\right' + sym.rewriteLR[1]
    if (sym.atname) // font change command
      return '{' + parse.texSymbol(sym) + b(res) + '}'
    return parse.texSymbol(sym) + b(res)
  },
  binary (sym, res, res2, rewind) {
    if (sym.input === 'color')
      return `{\\color{${parse.arg(rewind)}}${res2}}`
    if (sym.input === 'root')
      return `\\sqrt[${res}]{${res2}}`
    if (sym.output === 'stackrel')
      return parse.texSymbol(sym) + `{${res}}{${res2}}`
    if (sym.input === 'frac')
      return `\\frac{${res}}{${res2}}`
  },
  infixOutput (sym) {
    return sym.output
  },
  space (sym) {
    return '\\quad\\text{' + sym.input + '}\\quad'
  },
  leftRight (sym, res, rewind) {
    if (res.slice(-1) === '|') {
      return '{\\left|' + res + '}'
    } else {
      AM.begin = rewind
      return '\\mid'
    }
  },
  rfunc (sym, res) {
    return b(res + sym.output)
  },
  infix (sym0, sym1, sym2, node, res, res2, subFirst, underover) {
    //let lBraces = res.split('{').length
    //let rBraces = res.split('}').length
    //node += '^' + (lBraces === 2 && rBraces === 2 ? res : b(res))
    if (sym0.input === '==') {
      return subFirst ? `\\xlongequal[${res}]{${res2}}`
        : `\\xlongequal[${res2}]{${res}}`
    } else {
      return node + sym1.input + b(res) + sym2.input + b(res2)
    }
  },
  infixHalf (sym0, sym1, node, res, subFirst, underover) {
    if (sym0.input === '==') {
      return node + (subFirst ? `[${res}]{}` : b(res))
    } else {
      return node + sym1.input + b(res)
    }
  },
  infixFunc (node, res) {
    return b(node + res)
  },
  placeholder () {
    return '{\\square}'
  },
  infixNode (sym0, node) {
    return sym0.input === '==' ? node + '{}' : node
  },
  push (sym, frag, node, res) {
    if (res) {
      if (!braced(node))
        node = b(node)
      if (!braced(res))
        res = b(res)
      frag.push('\\frac' + node + res)
    } else {
      frag.push(node)
    }
  },
  matrix (sym, frag) {
    let ismatrix = false
    const str = frag.join('')
    let len = str.length
    let depth = 0
    for (i = 0; i < len; ++i) {
      if (isLeftBrace.test(str[i]))
        ++depth
      else if (isRightBrace.test(str[i]))
        --depth
      else if (str[i] === ';' && depth === 0) {
        ismatrix = true
        break
      }
    }
    if (!ismatrix) {
      frag[0] = str
      frag.length = 1
      return
    }
    let matrix = ''
    let begin = 0
    let row = []
    depth = 0
    for (i = 0; i < len; ++i) {
      if (isLeftBrace.test(str[i]))
        ++depth
      else if (isRightBrace.test(str[i]))
        --depth
      else if (str[i] === ';' && depth === 0) {
        row.push(str.slice(begin, i))
        begin = i+1
        matrix += row.join('&') + '\\\\'
        row = []
      } else if (str[i] === ',' && depth === 0) {
        row.push(str.slice(begin, i))
        begin = i+1
      }
    }
    if (begin < i)
      row.push(str.slice(begin,i))
    if (row.length > 0)
      matrix += row.join('&') + '\\\\'
    if (sym.invisible && AM.env === 'browser') {
      frag[0] = '\\begin{matrix*}[l]' + matrix + '\\end{matrix*}'
    } else {
      frag[0] = '\\begin{matrix}' + matrix + '\\end{matrix}'
    }
    frag.length = 1
  },
  closeMatrix (sym, frag) {
    frag.push('\\right' + parse.texCtrl(sym))
  },
  join (frag, closed) {
    if (AM.nestingDepth > 0 && !closed)
      frag.push('\\right.')
    return frag.join('')
  },
}

/* frontend of am;
Parsing ASCII math expressions with the following grammar
v ::= [A-Za-z] | greek letters | numbers | other constant symbols
u ::= sqrt | text | bb | other unary symbols for font commands
b ::= frac | root | stackrel         binary symbols
l ::= ( | [ | { | (: | {:            left brackets
r ::= ) | ] | } | :) | :}            right brackets
S ::= v | lEr | uS | bSS             Simple expression
I ::= S_S | S^S | S_S^S | S          Intermediate expression
E ::= IE | I/I                       Expression
Each terminal symbol is translated into a corresponding mathml node.*/

const parse = {
  init (str) {
    for (d of AM.define) str = str.replace(d[0], d[1])
    AM.nestingDepth = 0
    AM.str = str.trimLeft()
    AM.begin = 0
  },
  skip (n) {
    if (n) AM.begin += n
    while (AM.str.charCodeAt(AM.begin) <= 32)
      ++AM.begin
  },
  arg (begin) {
    let end
    if (AM.str[begin] === '{')
      end = AM.str.indexOf('}', begin+1)
    else if (AM.str[begin] === '(')
      end = AM.str.indexOf(')', begin+1)
    else if (AM.str[begin] === '[')
      end = AM.str.indexOf(']', begin+1)
    if (end === -1) end = AM.str.length
    return AM.str.slice(begin+1, end)
  },
  textArg (begin) {
    let end
    if (AM.str[begin] === '{')
      end = AM.str.indexOf('}', begin+1)
    else if (AM.str[begin] === '(')
      end = AM.str.indexOf(')', begin+1)
    else if (AM.str[begin] === '[')
      end = AM.str.indexOf(']', begin+1)
    else if (AM.str[begin] === '"')
      end = AM.str.indexOf('"', begin+1)
    if (end === -1) end = AM.str.length
    return AM.str.slice(begin+1, end)
  },
  texCtrl (sym) {
    return sym.tex ? '\\' + sym.tex : sym.input
  },
  texSymbol (sym) {
    return sym.nobackslash ? (sym.tex || sym.output) : '\\' + (sym.tex || sym.input)
  },
  // -> token or bracket or empty
  // return maximal initial substring of str that appears in names
  // or return null if there is none
  symbol () {
    let sym
    let node = AM.names, i = AM.begin, end = AM.str.length
    while (i < end) {
      node = node[AM.str[i++]]
      if (!node) break
      if (node['\0']) sym = node['\0']
    }
    AM.prevSym = AM.curSym
    if (sym) {
      AM.curSym = sym.ttype
      return sym
    }

    AM.curSym = CONST
    let input, tag
    const match = AM.str.slice(AM.begin).match(/^\d+(\.\d+)?/)
    if (match) { // numbers
      input = match[0]
      tag = 'mn'
    } else { // letters, chinese characters & symbols
      const cp = AM.str.codePointAt(AM.begin)
      input = isNaN(cp) ? '' : String.fromCodePoint(cp)
      tag = /[a-zA-Z]/.test(input) ? 'mi' : cp > 0x4e00 ? 'mtext' : 'mo'
    }

    sym = { input, output: input, tag, ttype: CONST, nobackslash: true }
    if (input === '-' && AM.prevSym === INFIX) {
      AM.curSym = INFIX  // trick '/' into recognizing '-' on second parse
      sym.ttype = UNARY
      sym.func = true
    }
    return sym
  },
  simple () {
    let res, st, rewind, sym = parse.symbol()
    if (!sym || sym.ttype === RIGHTBRACKET && AM.nestingDepth > 0)
      return null
    let len = sym.input.length
    switch (sym.ttype) {
    case UNDEROVER:
    case CONST:
      parse.skip(len)
      return yields.consts(sym)
    case LEFTBRACKET:
      parse.skip(len)
      ++AM.nestingDepth
      res = parse.expr(true)
      --AM.nestingDepth
      return yields.leftBracket(sym, res)
    case TEXT:
      if (sym.input != '"') parse.skip(len)
      st = parse.textArg(AM.begin)
      AM.begin += st.length + 2
      parse.skip()
      return yields.text(sym, st)
    case UNARYUNDEROVER:
    case UNARY:
      parse.skip(len)
      rewind = AM.begin
      res = parse.simple()
      if (!res) {
        AM.begin = rewind
        return yields.directOutput(sym)
      }
      if (sym.func) {
        st = AM.str.charAt(rewind)
        if (/\^|_|\/|\||,/.test(st) || (
          len === 1 && /\w/.test(sym.input) && st != '(')
        ) {
          AM.begin = rewind
          return yields.directOutput(sym)
        } else {
          return yields.func(sym, res)
        }
      }
      res = yields.strip(res)
      return yields.unary(sym, res, rewind)
    case BINARY:
      parse.skip(len)
      rewind = AM.begin
      res = parse.simple()
      if (!res) return yields.moOutput(sym)
      res = yields.strip(res)
      let res2 = parse.simple()
      if (!res2) return yields.moOutput(sym)
      res2 = yields.strip(res2)
      return yields.binary(sym, res, res2, rewind)
    case INFIX:
      parse.skip(len)
      return yields.infixOutput(sym)
    case SPACE:
      parse.skip(len)
      return yields.space(sym)
    case LEFTRIGHT:
      parse.skip(len)
      rewind = AM.begin
      AM.nestingDepth++
      res = parse.expr(false)
      AM.nestingDepth--
      return yields.leftRight(sym, res, rewind)
    default:
      //console.warn("default")
      parse.skip(len)
      return yields.directOutput(sym)
    }
  },
  // for example pi_1^233!/233
  infix () {
    parse.skip()
    let sym0 = parse.symbol() // for example pi
    let node = parse.simple() // for example π
    let sym1 = parse.symbol() // for example _
    const underover = (sym0.ttype === UNDEROVER || sym0.ttype === UNARYUNDEROVER)

    // 类似于 sin, log 相对分式优先
    // 阶乘, 或任意后缀函数也相对分式优先
    if (sym1.rfunc) {
      parse.skip(sym1.input.length)
      return yields.rfunc(sym1, node)
    }
    if (sym1.ttype !== INFIX || sym1.input === '/') {
      return yields.infixNode(sym0, node)
    }
    parse.skip(sym1.input.length)

    // now sym1 is either _ or ^
    let res = parse.simple() // for example 1
    if (res)
      res = yields.strip(res)
    else // show box in place of missing argument
      res = yields.placeholder()

    let sym2 = parse.symbol() // for example ^
    const subFirst = sym1.input === '_'
    if (sym2.input === (subFirst ? '^' : '_')) {
      parse.skip(sym2.input.length)
      let res2 = parse.simple() // for example 233
      res2 = yields.strip(res2)
      node = yields.infix(sym0, sym1, sym2, node, res, res2, subFirst, underover)
    } else {
      node = yields.infixHalf(sym0, sym1, node, res, subFirst, underover)
    }

    let sym3 = parse.symbol() // for example !
    if (sym3.rfunc) {
      parse.skip(sym3.input.length)
      node = yields.rfunc(sym3, node)
    }
    if (sym0.func) {
      if (sym3.ttype !== INFIX && sym3.ttype !== RIGHTBRACKET) {
        res = parse.infix() // recur
        node = yields.infixFunc(node, res)
      }
    }
    return node
  },
  expr (rightbracket) {
    let closed = false
    let sym
    let frag = yields.init()
    do {
      parse.skip()
      let res = parse.infix()
      let node = res
      sym = parse.symbol()
      // fractions
      if (sym.input === '/' && sym.ttype === INFIX) {
        parse.skip(sym.input.length)
        res = parse.infix()
        if (res)
          res = yields.strip(res)
        else
          res = yields.placeholder()
        node = yields.strip(node)
        yields.push(sym, frag, node, res)
        sym = parse.symbol()
      } else if (node) {
        yields.push(sym, frag, node)
      }
      // TODO: what is this rubbish?
    } while ((sym.ttype !== RIGHTBRACKET
      && (sym.ttype !== LEFTRIGHT || rightbracket)
      || AM.nestingDepth === 0) && sym != null && sym.output != '');

    if (sym.ttype === RIGHTBRACKET || sym.ttype === LEFTRIGHT) {
      parse.skip(sym.input.length)
      yields.matrix(sym, frag)
      if (!sym.invisible) {
        yields.closeMatrix(sym, frag)
        closed = true
      }
    }
    return yields.join(frag, closed)
  },
}

function handleError (amstr, e) {
  console.error(amstr + '\n', e)
  return $('<span>', {
    className: 'katex-error',
    innerText: 'AM parse error'
  })
}

// str -> <math>
function parseMath(amstr) {
  parse.init(amstr)
  let node
  try {
    node = $math('mstyle', parse.expr(false))
  } catch (e) {
    return handleError(amstr, e)
  }
  if (AM.color)
    node.setAttribute('mathcolor', AM.color)
  if (AM.fontfamily)
    node.setAttribute('fontfamily', AM.fontfamily)
  if (AM.displaystyle)
    node.setAttribute('displaystyle', 'true')
  node = $math('math', node)
  if (AM.viewsource)
    node.setAttribute('title', amstr)
  return node
}

function am2tex(amstr, displaystyle = AM.displaystyle) {
  parse.init(amstr)
  const args = []
  if (AM.color) args.push('\\' + AM.color)
  args.push(displaystyle ? '\\displaystyle ' : '\\textstyle ')
  return AM.texstr = args.join('')
    + parse.expr(false).replace(/(\$|%)/g, '\\$1')
}

function parseMathTex(amstr) {
  let node, texstr
  try {
    texstr = am2tex(amstr)
    node = $('<span>', texstr)
  } catch (e) {
    return handleError(amstr, e)
  }
  try {
    katex.render(texstr, node)
    const anno = node.querySelectorAll('annotation')[0]
    anno.textContent = '$' + anno.textContent + '$'; // add tex delimiter for user selection
  } catch (e) {
    node.className = 'katex-error'
    node.innerText = 'KaTeX parse error'
    console.error(amstr, e)
  }
  return node
}

function renderNode(node) {
  let str = node.nodeValue
  if (!str) return 0

  let escaped = false
  str = str.replace(AM.esc1, () => {
    escaped = true
    return 'AMesc1'
  }) // this is a problem??

  const arr = str.split(AM.delim1)
  if (!escaped && arr.length <= 1) return 0

  if (arr.length % 2 === 0) console.warn('formula not closed:', str)

  const frag = $()
  for (let i = 0; i < arr.length; ++i) {
    const s = arr[i].replace(/AMesc1/g, AM.delim1)
    frag.appendChild(
      i % 2 ? parseMath(s) : document.createTextNode(s)
    )
  }
  node.parentNode.replaceChild(frag, node)
  return arr.length-1
}

// substitute formulae with mathml
function render(node) {
  if (node.nodeName === 'math' || node.nodeType === 8 // comment element
      || /form|textarea/i.test(node.parentNode.nodeName)
  ) return 0

  if (node.childNodes.length > 0)
    for (let i = 0; i < node.childNodes.length; i++)
      i += render(node.childNodes[i])

  return renderNode(node)
}

function appendChildren (el, children) {
  if (Array.isArray(children)) children.forEach(c => el.appendChild(c))
  else el.appendChild(children)
}

// 虚拟 dom (bushi
function $(tag, options = {}, children = []) {
  const len = tag && tag.length
  const el = !tag
    ? document.createDocumentFragment()
    : tag[0] === '#'
    ? document.getElementById(tag.slice(1))
    : tag[0] === '.'
    ? document.getElementsByClassName(tag.slice(1))
    : tag[0] === '<' && tag[len-1] === '>'
    ? (options.namespace
      ? document.createElementNS(namespace, tag)
      : document.createElement(tag.slice(1,len-1))
    ) : document.getElementsByTagName(tag);

  if (typeof options === 'string') {
    el.innerText = options
  } else {
    Object.keys(options).forEach(key => {
      const value = options[key]
      if (key === 'className') {
        if (Array.isArray(value)) value.forEach(v => el.classList.add(v))
        else el.classList.add(value)
      } else if (key === 'attrs') {
        Object.keys(value).forEach(attr => el.setAttribute(attr, value[attr]))
      } else if (key === 'on') {
        Object.keys(value).forEach(ev => {
          const arr = ev.split('.')
          el.addEventListener(arr[0], value[ev].bind(options), arr[1] === 'true')
        })
      } else if (key === 'style') {
        Object.assign(el.style, value)
      } else if (typeof value === 'function') {
        el[key] = value.bind(options)
      } else if (key !== 'namespace') {
        el[key] = value
      }
    })
    options.el = el
  }

  appendChildren(el, children)
  return el
}

function $math(tag, children = []) {
  const MATHML = 'http://www.w3.org/1998/Math/MathML'
  const el = document.createElementNS(MATHML, tag)
  if (typeof children === 'string')
    children = document.createTextNode(children)
  appendChildren(el, children)
  return el
}

function $mspace() {
  const el = $math('mspace')
  el.setAttribute('width', '1ex')
  return el
}

function loadCss(href) {
  document.body.appendChild($('<link>', {
    attrs: { href, rel: 'stylesheet', crossorigin: '' }
  }))
}

function loadScript(src, onload = null) {
  document.body.appendChild($('<script>', { src, onload }))
}

function hasMathML() {
  const { userAgent } = navigator
  return !/chrome/i.test(userAgent) && /safari|firefox/i.test(userAgent)
}

function notify () {
  const close = $('<button>', {
    innerText: '×',
    style: {
      position: 'absolute',
      right: '10px',
      top: '10px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
    },
    onclick () {
      div.style.display = 'none'
    }
  })
  const div = $('<div>', {
    id: 'AMnotify',
    style: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      textAlign: 'center',
      padding: '0.5em 2em',
      background: '#f99',
      fontFamily: 'sans-serif',
      color: '#633',
    },
    innerHTML: 'To view the ASCIIMathML notation, use lastest version of Mozilla Firefox or Safari.'
      + 'To support other browsers, please include <a href="https://katex.org">katex.min.js</a>.',
  }, close)
  document.body.append(div);
}

function init () {
  initSymbols()

  AM.delim1.replace(/(\(|\)|\[|\]|\{|\}|\$|\^|\/|\\|\||\.|\*|\+|\?)/g, '\\$1')
  AM.esc1 = new RegExp('\\\\' + AM.delim1, 'g')

  if (!AM.katex && hasMathML())
    return AM.onload()

  if (AM.katex === false)
    return notify()

  // use katex & tex version of functions
  AM.katex = true
  parseMath = parseMathTex
  yields = yieldsTex

  if (AM.env === 'browser') {
    // local fonts cause CORS error
    loadCss('https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/katex.min.css')
    loadScript(AM.katexpath, AM.onload)
  }
}

if (typeof document === 'undefined') {
  AM.env = 'nodejs'
  AM.katex = true
  AM.displaystyle = true
  // html entity
  AM.define.push([/&#(x?[0-9a-fA-F]+);/g, (match, $1) =>
    String.fromCodePoint($1[0] === 'x' ? '0' + $1 : $1)
  ])
  init()
} else if (typeof chrome !== 'undefined' && chrome.extension) {
  AM.env = 'extension'
  AM.katex = true
  AM.displaystyle = true
  init()
} else {
  AM.env = 'browser'
  window.addEventListener('load', init, false)
}

// API
AM.render = render
AM.am2tex = am2tex
})();

if (typeof module !== 'undefined')
  module.exports = asciimath
