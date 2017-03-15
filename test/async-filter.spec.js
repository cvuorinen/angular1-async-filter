describe('Filter: async', function () {
    var asyncFilter,
        unresolvedPromise = function() {
            return { then: function() {} };
        },
        resolvedPromise = function(value) {
            return { then: function(callback) { callback(value); } };
        },
        promiseMock = function() {
            var callback;
            return {
                then: function(callbackFn) { callback = callbackFn; },
                resolve: function (value) { callback(value); }
            };
        },
        observableMock = function(subscription) {
            var callback;
            return {
                subscribe: function(callbackFn) {
                    callback = callbackFn;

                    return subscription;
                },
                next: function (value) { callback(value); }
            };
        },
        subscriptionMock = function(unsubscribeFunctionName) {
            var subscription = {};
            subscription[unsubscribeFunctionName] = function() {};

            return subscription;
        };

    beforeEach(module('asyncFilter'));
    beforeEach(inject(function ($filter) {
        asyncFilter = $filter('async');
    }));

    it('should return null on null input', function() {
        expect(asyncFilter(null)).toEqual(null);
    });

    it('should return input when it is not Promise or Observable', function() {
        expect(asyncFilter("foo")).toEqual("foo");
    });

    it('should return undefined when promise is not resolved', function() {
        expect(asyncFilter(unresolvedPromise())).toEqual(undefined);
    });

    it('should return promises resolved value', function() {
        expect(asyncFilter(resolvedPromise(42))).toEqual(42);
    });

    it('should return undefined until promise resolved', function() {
        var promise = promiseMock();

        expect(asyncFilter(promise)).toEqual(undefined);

        promise.resolve(42);

        expect(asyncFilter(promise)).toEqual(42);
    });

    it('should return falsy value', function() {
        expect(asyncFilter(resolvedPromise(0))).toEqual(0);
    });

    it('should return undefined until observable emits', function() {
        var observable = observableMock();

        expect(asyncFilter(observable)).toEqual(undefined);

        observable.next(42);

        expect(asyncFilter(observable)).toEqual(42);
    });

    it('should return observables latest value', function() {
        var observable = observableMock();
        asyncFilter(observable);

        observable.next(42);

        expect(asyncFilter(observable)).toEqual(42);

        observable.next("foo");

        expect(asyncFilter(observable)).toEqual("foo");
    });

    it('should only subscribe once', function() {
        var observable = observableMock();
        spyOn(observable, 'subscribe');

        asyncFilter(observable);
        asyncFilter(observable);
        asyncFilter(observable);

        expect(observable.subscribe).toHaveBeenCalled();
        expect(observable.subscribe.calls.count()).toEqual(1);
    });

    it('should call $applyAsync on each value if scope provided', function() {
        var observable = observableMock();
        var scope = {
            $applyAsync: jasmine.createSpy('scope.$applyAsync')
        };

        expect(asyncFilter(observable, scope)).toEqual(undefined);
        expect(scope.$applyAsync).not.toHaveBeenCalled();

        observable.next(42);

        expect(scope.$applyAsync).toHaveBeenCalled();
        expect(scope.$applyAsync.calls.count()).toEqual(1);

        observable.next("foo");

        expect(scope.$applyAsync.calls.count()).toEqual(2);
    });

    it('should listen for scope $destroy event if scope provided', function() {
        var observable = observableMock();
        var scope = {
            $on: jasmine.createSpy('scope.$on')
        };

        asyncFilter(observable, scope);

        expect(scope.$on).toHaveBeenCalledWith('$destroy', jasmine.any(Function));
    });

    it('should dispose subscription on scope $destroy event', function() {
        // RxJS 4 style unsubscribe
        var subscription = subscriptionMock('dispose');
        spyOn(subscription, 'dispose');
        var observable = observableMock(subscription);
        var onDestroy;
        var scope = {
            $on: function(event, callback) { onDestroy = callback; }
        };

        asyncFilter(observable, scope);

        expect(subscription.dispose).not.toHaveBeenCalled();

        onDestroy();

        expect(subscription.dispose).toHaveBeenCalled();
    });

    it('should unsubscribe subscription on scope $destroy event', function() {
        // RxJS 5 support
        var subscription = subscriptionMock('unsubscribe');
        spyOn(subscription, 'unsubscribe');
        var observable = observableMock(subscription);
        var onDestroy;
        var scope = {
            $on: function(event, callback) { onDestroy = callback; }
        };

        asyncFilter(observable, scope);

        expect(subscription.unsubscribe).not.toHaveBeenCalled();

        onDestroy();

        expect(subscription.unsubscribe).toHaveBeenCalled();
    });
});
