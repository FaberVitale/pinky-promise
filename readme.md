# PinkyPromise

## Description

A [Promise A+](https://promisesaplus.com/) spec compliant Promise implementation written in [Typescript](https://www.typescriptlang.org/).

The api is copy of Ecmascript [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

## Why?

This implementation was built for a [talk](https://github.com/FaberVitale/build-js-promise-from-scratch-talk).

Although fully spec compliant and thoroughly tested, we do no recommend using this implementation the over [`globalThis.Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

## Develop

### Set node version

```bash
nvm use
```

### Package manager

This project uses [pnpm](https://pnpm.io/) as package manger and managed by [corepack](https://nodejs.org/api/corepack.html).

Run `corepack enable` to enable `pnpm`.

### Scripts

#### build

```bash
pnpm build
```

#### test

```bash
pnpm test # requires `pnpm build`
```

## References

### MDN

- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Using Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

### Specs

- [Promise A+ spec](https://promisesaplus.com/)
- [Ecmascript Promise](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects)

## License

[MIT](LICENSE)
