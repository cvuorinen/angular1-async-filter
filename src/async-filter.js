(function (angular) {
    function asyncFilter() {
        const values = {};
        const subscriptions = {};

        function async(input, scope) {
            // Make sure we have an Observable or a Promise
            if (!input || !(input.subscribe || input.then)) {
                return input;
            }

            const inputId = objectId(input);
            if (!(inputId in subscriptions)) {
                const subscriptionStrategy = input.subscribe && input.subscribe.bind(input)
                    || input.success && input.success.bind(input) // To make it work with HttpPromise
                    || input.then.bind(input);

                subscriptions[inputId] = subscriptionStrategy(value => {
                    values[inputId] = value;

                    if (scope && scope.$applyAsync) {
                        scope.$applyAsync(); // Automatic safe apply, if scope provided
                    }
                });
            }

            return values[inputId] || undefined;
        };

        // Need a way to tell the input objects apart from each other (so we only subscribe to them once)
        let nextObjectID = 0;
        function objectId(obj) {
            if (!obj.hasOwnProperty('__asyncFilterObjectID__')) {
                obj.__asyncFilterObjectID__ = ++nextObjectID;
            }

            return obj.__asyncFilterObjectID__;
        }

        // So that Angular does not cache the return value
        async.$stateful = true;

        return async;
    };

    angular
        .module('asyncFilter', [])
        .filter('async', asyncFilter);

})(angular);
