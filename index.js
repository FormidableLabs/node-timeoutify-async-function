'use strict';

/**
 * Given a function, wrap it in a timed-Promise that must resolve within the
 * specified timeout.
 *
 * @param {Function} fn
 * The function to call.
 *
 * @param {Number} timeout
 * The amount of time the function is given to complete, in ms.
 *
 * @param {?} thisArg
 * The this arg to pass to the function.
 *
 * @returns {Function}
 * A function that accepts any number of arguments that calls the
 * original function with the previously specified "this" arg,
 * the current arguments, and is monitored for completion within the
 * time limit.
 */
const timeoutify = (fn, timeout, thisArg) => {
  return (...args) => {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Function call did not resolve within the allotted time.'));
      }, timeout);

      try {
        resolve(await fn.call(thisArg, ...args));
      } catch (error) {
        reject(error);
      } finally {
        clearTimeout(timer);
      }
    });
  };
};

exports = module.exports = timeoutify;
