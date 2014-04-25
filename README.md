# LeatherScript

## Setup

```
npm install
```

## Try

```
node src/cli/lthstx.js lib/lthstx.lthstx.json lib/std.lthstx > lib/std.lthstx.json
node src/cli/lthstx.js lib/std.lthstx.json examples/scratch.lth > examples/scratch.lth.json
node src/cli/lthgen.js examples/scratch.lth.json
```

## Features

### Recursive types

再帰的な構造に型をつけることができます。
例:

```
f : mutable simple string -> 'a as 'a;
f := (x : simple string) -> f
```