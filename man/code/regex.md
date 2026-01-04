# RegEx <small>(Regular Expression)</small>

- [regex tutorial game](https://www.regexone.com/)
- [regex playground](https://regexr.com/)
- [regex crossword](https://regexcrossword.com/)
- [regex puzzle](https://gregable.com/p/regexp-puzzle.html)
- [正则表达式30分钟入门教程](https://deerchao.cn/tutorials/regex/regex.htm)

## modern regex

modern regex used in js and python

### flags

```txt
g       global match
i       ignore case
m       multiline: ^ and $ matches the beginning/end of lines
s       single line, dotall: . matches anything including linebreaks
```

### meta characters

```txt
[...]   anything appeared in the square bracket.
[^...]  anything but those appeared in the square bracket.

^       beginning of string/line
$       end of string/line
\       escape
|       branching. usage: `expr1|expr2`. if expr1 matches, expr2 will be ignored

\t      tab character
\r      carrage return character
[\b]    backspace
\n      newline character
\s      any blank character (space, tab, \n, wide space...)
\d      a digit, same as [0-9]
\w      alphabet or digit or underscore, same as [a-zA-Z0-9_]
\b      begin or end of word, matches a zero-width position.  (that is to
        say, only one of the two characters beside \b matches \w)

[^]     anything
.       anything but linebreaks: \n \r \u2028 (line separator) \u2029 (paragraph separator)
\S      anything but \s
\D      anything but \d
\W      anything but \w
\B      anything but \b

{n}     the character before can be repeated n times.
{m,n}   the character before can be repeated m to n time(s)
{n,}    the character before can be repeated n or more time(s)
*       the character before can be repeated 0 or more time(s)
+       the character before can be repeated 1 or more time(s)
?       the character before can be repeated 0 or 1 time
*?      like * but not greedy
+?      like + but not greedy
```

> given string `aabab`.
> - greedy mode: match `a.*b`, got whole string
> - lazy mode: match `a.*?b`, got `aab` and `ab`.

### rarely used metas

```txt
\a          alert character.
\v          vertical tab.
\f          newpage.
\e          escape.
\0nn        Oct-number character.
\xnn        Hex-number character.
\unnnn      unicode.
\cN         ascii control character, e.g., \cC is Ctrl+C.

\A          beginning of string.
\Z          end of string/line.
\z          end of string.
\G          beginning of current search.
\p{name}    unicode class whose name is name, e.g., \p{IsGreek}
```

### capture group

```txt
\0              the whole expression.
\1              the first group, indexes are specified by '('.

(?#comment)     a comment.

(?<name>expr)   name a group. to refer to expr, use \k<name>.
(?'name'expr)   note that the index of named groups are greater
                than the unnamed.

(?:expr)        this group has no index.

(?'name'expr)   push 'name' into stack if expr matches.
(?'-name'expr)  pop last captured context from stack if expr
                matches.
(?(name)yes|no) if name exist in stack, try match yes, else
                match no.
```

### zero width assertion

```txt
(?=expr)        the position after which is expr.
(?<=expr)       the position before which is expr.
(?!expr)        the position after which is not expr.
(?<!expr)       the position before which is not expr.
(?!)            matches nothing.
```

## old regex

old regex used in grep and vim

### character classes

```txt
[[:alnum:]] [[:alpha:]] [[:cntrl:]] [[:digit:]] [[:graph:]] [[:lower:]]
[[:print:]] [[:punct:]] [[:space:]] [[:upper:]] [[:xdigit:]]
```

### metas

```txt
\<      beginning of a word
\>      end of a word
```

metas where escapes are needed

```txt
\? \+ \{ \| \( \)
```

## examples

- 汉字: `\u4e00-\u9fa5`
- phone number: `1\d{10}`
- email: `[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+`
- float number: `[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?`
- HTML tag: `<[^>]+>`
- Identifier: `[_A-Za-z]\w*`
- IP address: `((25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)`
- string that does not contain abc: `^((?!abc).)*$`

bracket match
```txt
<                       # most left bracket

[^<>]*                  # some non-bracket
(
    (
        (?'Open'<)      # push 'Open' if met '<'
        [^<>]*          # some non-bracket
    )+
    (
        (?'-Open'>)     # pop 'Open' if met '>', fails if
                        # stack is empty. Regex will give up
                        # some '>' to match.
        [^<>]*          # some non-bracket
    )+
)*
(?(Open)(?!))           # fails if there're still 'Open' left

>                       # most right bracket
```

div tags
```txt
<div[^>]*>[^<>]*
(
    (
        (?'Open'<div[^>]*>)
        [^<>]*
    )+
    (
        (?'-Open'</div>)
        [^<>]*
    )+
)*
(?(Open)(?!))
</div>
```

cron
```txt
^(?#minute)(\*|(?:[0-9]|(?:[1-5][0-9]))(?:(?:\-[0-9]|\-(?:[1-5][0-9]))?|
(?:\,(?:[0-9]|(?:[1-5][0-9])))*)) (?#hour)(\*|(?:[0-9]|1[0-9]|2[0-3])
(?:(?:\-(?:[0-9]|1[0-9]|2[0-3]))?|(?:\,(?:[0-9]|1[0-9]|2[0-3]))*)) 
(?#day_of_month)(\*|(?:[1-9]|(?:[12][0-9])|3[01])(?:(?:\-(?:[1-9]|
(?:[12][0-9])|3[01]))?|(?:\,(?:[1-9]|(?:[12][0-9])|3[01]))*)) (?#month)(\*|
(?:[1-9]|1[012]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:\-(?:[1-9]|
1[012]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?|(?:\,(?:[1-9]|1[012]|
JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))*)) (?#day_of_week)(\*|
(?:[0-6]|SUN|MON|TUE|WED|THU|FRI|SAT)(?:(?:\-(?:[0-6]|SUN|MON|TUE|WED|THU|FRI|SAT))?|
(?:\,(?:[0-6]|SUN|MON|TUE|WED|THU|FRI|SAT))*))$
```
