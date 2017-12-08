# hydux
An elm-like state manager inspired by [Hyperapp](https://github.com/hyperapp/hyperapp), [Elmish](https://github.com/fable-elmish/elmish), Elm, Redux, etc. Working with any vdom library!

## Why

After trying [Fable](https://fable.io) + [Elmish](https://github.com/fable-elmish/elmish) for a while, I need to write a small App in my company, for many reasons I cannot choose some fancy stuff like [Fable](https://fable.io) + [Elmish](https://github.com/fable-elmish/elmish). Anyway, I need to use the mainstream JS stack and cannot bear Redux's anymore(cumbersome, complex toolchain...). After some dig around hyperapp looks really awesome, but I quickly find out it doesn't work with React, and many libraries don't work with the newest API anymore. So I create this to support **different** vdom libraries, like React, [picodom](https://github.com/picodom/picodom), Preact, [inferno](https://github.com/infernojs/inferno) or what ever you want, just write a simple enhancer. Also to avoid breaking change, we have **built-in** support for HMR, logger, persist, Redux Devtools, you know you want it!

## Install
```sh
yarn add hydux # or npm i hydux
```

## Example

```sh
git clone https://github.com/hydux/hydux.git
cd examples/counter
yarn # or npm i
npm start
```

Now open http://localhost:8080 and hack!

# License
MIT
