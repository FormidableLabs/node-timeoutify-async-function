/* eslint-disable max-nested-callbacks */

'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const taf = require('../index');

describe('timeoutify-async-function', () => {
  let clock;
  let sandbox;

  const mockDeadlineTimeout = 5000;
  const mockCompletionTimeout = 2500;
  const mockOverrunTimeout = 7500;

  let stubFn;

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(() => {
    clock = sinon.useFakeTimers();

    stubFn = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  describe('timeoutify', () => {
    it('wraps a function in a timed-promise', () => {
      const result = taf(stubFn, mockDeadlineTimeout);
      expect(result).to.be.a('function');
    });

    it('resolves if the function resolves in the time allotted', (done) => {
      (async () => {
        const mockThis = 'some-this';

        const mockArg1 = 'some';
        const mockArg2 = 'passed';
        const mockArg3 = 'args';

        const mockResolution = 'Complete';

        stubFn.callsFake(function (...args) {
          // eslint-disable-next-line no-invalid-this
          expect(this)
            .to.be.a('string')
            .that.equals(mockThis);

          expect(args)
            .to.be.an('array')
            .that.deep.equals([mockArg1, mockArg2, mockArg3]);

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(mockResolution);
            }, mockCompletionTimeout);
          });
        });

        const timedFn = taf(stubFn, mockDeadlineTimeout, mockThis);
        expect(timedFn).to.be.a('function');

        const promise = timedFn(mockArg1, mockArg2, mockArg3);
        expect(promise).to.be.a('promise');

        clock.next();

        const result = await promise;
        expect(result)
          .to.be.a('string')
          .that.equals(mockResolution);

        done();
      })();
    });

    it('rejects if the function does not resolve in the time allotted', (done) => {
      (async () => {
        const mockArg1 = 'some';
        const mockArg2 = 'passed';
        const mockArg3 = 'args';

        const mockResolution = 'Complete';

        stubFn.callsFake(function (...args) {
          // eslint-disable-next-line no-invalid-this,no-unused-expressions
          expect(this).to.be.undefined;

          expect(args)
            .to.be.an('array')
            .that.deep.equals([mockArg1, mockArg2, mockArg3]);

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(mockResolution);
            }, mockOverrunTimeout);
          });
        });

        const timedFn = taf(stubFn, mockDeadlineTimeout);
        expect(timedFn).to.be.a('function');

        const promise = timedFn(mockArg1, mockArg2, mockArg3);
        expect(promise).to.be.a('promise');

        clock.next();
        clock.next();

        try {
          await promise;
        } catch (error) {
          expect(error).to.be.an('error');
          done();
        }
      })();
    });

    it('rejects if the function rejects', (done) => {
      (async () => {
        const mockArg1 = 'some';
        const mockArg2 = 'passed';
        const mockArg3 = 'args';

        const mockRejection = 'Failure';

        stubFn.callsFake((...args) => {
          expect(args)
            .to.be.an('array')
            .that.deep.equals([mockArg1, mockArg2, mockArg3]);

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(mockRejection);
            }, mockCompletionTimeout);
          });
        });

        const timedFn = taf(stubFn, mockDeadlineTimeout);
        expect(timedFn).to.be.a('function');

        const promise = timedFn(mockArg1, mockArg2, mockArg3);
        expect(promise).to.be.a('promise');

        clock.next();

        try {
          await promise;
        } catch (error) {
          expect(error)
            .to.be.a('string')
            .that.equals(mockRejection);
          done();
        }
      })();
    });
  });
});
