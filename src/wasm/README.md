# wasm-game

websocket, webassembly, webgl game

```sh
wasm-pack build #generate wasm

cd web/
pnpm dev #app
```

## references

profiling https://rustwasm.github.io/docs/book/game-of-life/time-profiling.html

- [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) for communicating between wasm and js.
- [console_error_panic_hook](https://github.com/rustwasm/console_error_panic_hook) panic messages in developer console.
- [wee_alloc](https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/template-deep-dive/wee_alloc.html) for a smaller .wasm

general rustwasm guide, recommended read, before even looking at wasm-bindgen guide
[using rust and webassembly, game of life](https://rustwasm.github.io/docs/book/game-of-life/hello-world.html)

wasm-bindgen guide
[wasm-bindgen intro](https://rustwasm.github.io/wasm-bindgen/introduction.html)
[wasm-bindgen websockets example](https://rustwasm.github.io/wasm-bindgen/examples/websockets.html)


(serde, serialize/deserialize rust types)[https://serde.rs/derive.html]