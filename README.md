# node-timeoutify-async-function
A Node.js utility module that wraps an async function inside a timed-promise.

# Motivation
There are a few modules in npm that sorta kinda do the same thing, but this one
works differently than the rest.

Instead of having to already have a promise in hand (e.g. `promise-timeout`,
`timeoutify-promise`), this utility wraps your existing promise-generating _function_
in a timed-promise.

Also, it is required that your function return a `Promise` instead of relying on
a callback (e.g. `timeoutify`).

# Usage
npm i timeoutify-async-function

# Example - Basic
Here is a basic use case: a function that returns a `Promise` (or is defined as
an `async` function, which always return a `Promise`) and you want to call it with
parameters.  The function must complete in 10 seconds (10000ms).

```javascript
const taf = require('timeoutify-async-function');

const myAsyncFunction = async (parm1, parm2) => {
  // i do something
}

const myTimedAsyncFunction = taf(myAsyncFunction, 10000);

try {
  await myTimedAsyncFunction(value1, value2);
} catch (error) {
  // could be a rejection from myAsyncFunction
  // could be a rejection because myAsyncFunction did not resolve in time
}
```

**Note** In the contrived example above, `myAsyncFunction` could also be a
normal function so long as it returns a `Promise`.

The function `myTimedAsyncFunction` calls `myAsyncFunction` inside of a new `Promise`
that invokes `setTimeout` to reject the new `Promise` after 10000ms.

If `myAsyncFunction` resolves before the timer expires, then `myTimedAsyncFunction`
resolves with the same resolved value.

However, if `myAsyncFunction` fails to resolve before the timer expires, then
the function called by `setTimeout` will reject the `Promise`.  Also, if `myAsyncFunction`
rejects its `Promise` or throws any error, then `myTimedAsyncFunction` will reject
the `Promise` with that rejection/error.

Upon resolution or rejection, the timer is cleared with `clearTimeout`.

**Note** All calls to `myTimedAsyncFunction` must resolve within 10000ms.  To call the
same function with different timeouts, you must obtain a new wrapped function with the
differing timeout value and use that second wrapped function instead.

# Example - _this_ Arg
You can also specify a `this` arg to your wrapped function.  It is the third parameter
to the utility.  If you don't specify a `this` arg, then `this` is `undefined` in
`myAsyncFunction`.

```javascript
const taf = require('timeoutify-async-function');
const myTimedAsyncFunction = taf(myAsyncFunction, 10000, myThisArg);
```

**Note** Similar to how the timeout value is the same for all wrapped calls to
`myAsyncFunction`, the `this` arg is also going to be the same.
