'use strict';

var flyerApp = angular.module('flyerApp', ['flyerControllers','facebook', 'ngRoute'])


flyerApp.config([
        'FacebookProvider',
        function(FacebookProvider) {
            var myAppId = '586301318195672';
            FacebookProvider.init(myAppId);
        }
    ])

flyerApp.config([
        '$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/flyers', {
                templateUrl: 'partials/flyer-list.html',
                controller: 'FlyerListCtrl'
            }).
            when('/flyer/:id', {
                templateUrl: 'partials/flyer.html',
                controller: 'FlyerDetailCtrl'
            }).
            when('/lint', {
                templateUrl: "partials/lint.html",
                controller: 'EventLintCtrl'
            }).
            otherwise({
                redirectTo: '/flyers'
            });
        }]);

