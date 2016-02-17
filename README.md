# Angular1 async filter

> Angular2 async pipe implemented as Angular 1 filter to handle Promises & RxJS Observables

The async filter takes a Promise or Observable as input and subscribes to the input automatically, eventually returning the emitted value(s) similarly as with Angular2 Async pipe.
Works with RxJS Observables even without https://github.com/Reactive-Extensions/rx.angular.js

## Install

Install from npm:

```
npm install angular1-async-filter --save
```

And bundle with Browserify, Webpack etc.


Or install with bower:

```
bower install angular1-async-filter --save
```

And add script to html:

```html
<script src="bower_components/angular1-async-filter/async-filter.js"></script>
```

Add Angular module dependency. For example:

```js
angular.module('myApp', ['asyncFilter']);
```

## Usage

Basic usage:

```html
<div>Value: {{ promiseOrObservable | async }}</div>
```

Works with any directive that takes an expression, like `ng-if`, `ng-show` and `ng-repeat` etc.

```html
<ul>
    <li ng-repeat="item in list|async">{{ item }}</li>
</ul>
```

Angular $q and $http promises automatically trigger digest cycle when they resolve so all views will get updated.
For compatibility with RxJS Observables, as well as other Promise or Observable implementations, you can provide the current scope as a parameter to the filter, which will then automatically trigger digest cycle whenever a new value is emitted:

```html
<div ng-if="{{ observable | async:this }}">
    Value: {{ observable | async:this }}
</div>
```

If you are using the `safeApply` operator from https://github.com/Reactive-Extensions/rx.angular.js for example, then `this` is not needed.

## License

MIT
