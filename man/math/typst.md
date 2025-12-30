# typst

https://typst.app/docs/tutorial/writing-in-typst

## quick start

### paragraph

`tmp.typ`
```text
= Introduction
In this report, we will explore the
various factors that influence _fluid
dynamics_ in glaciers and how they
contribute to the formation and
behavior of these natural structures.
```

to compile it:

    $ typst c tmp.typ

### list

- ordered list item begins with `+`
- unordered list item begins with `-`

```text
+ The climate
  - Temperature
  - Precipitation
+ The topography
+ The geology
```

### figure

- function call begins with a `#`
- `"..."` is a string
- `[...]` is markup block
- `<...>` is anchor, use `@` to cite it

```text
Glaciers as the one shown in @glaciers will cease to extist if we don't take action soon!

#figure(
  image("glacier.png", width: 70%),
  caption: [
    _Glaciers_ form an important part
    of the earth's climate system.
  ]
) <glaciers>
```

### maths

- line math is quoted with dollars: `$...$`
- block math is quoted with dollars, with space padding: `$ ... $`

```text
The equation $Q = rho A v + C$
defines the glacial flow rate.

The flow rate of a glacier is given
by the following equation:

$ Q = rho A v + "time offset" $

Total displaced soil by glacial flow:

$ 7.32 beta +
  sum_(i=0)^nabla
    (Q_i (a_i - epsilon)) / 2 $

$ v := vec(x_1, x_2, x_3) $

$ a arrow.squiggly b $
```
