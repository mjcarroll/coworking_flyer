'use strict';

var flyerControllers = angular.module('flyerControllers', []);

flyerControllers.controller('FlyerDetailCtrl', ['$scope', '$routeParams', '$timeout', '$filter', 'Facebook',
function($scope, $routeParams, $timeout, $filter, Facebook) {
    $scope.logged = false;
    $scope.night_id = $routeParams.id;
    $scope.date = new Date($routeParams.date);

    $scope.$watch(
        function() {
            return Facebook.isReady();
        },
        function(newVal) {
            if (newVal) {
                $scope.facebookReady = true;
                $scope.IntentLogin();
            }
        }
    );

    var userIsConnected = false;
    Facebook.getLoginStatus(function(response) {
        if(response.status == 'connected') {
            userIsConnected = true;
        }
    });

    $scope.IntentLogin = function() {
        if(!userIsConnected) {
            $scope.login();
        }
    };

    $scope.login = function() {
        Facebook.login(function(response) {
            if (response.status == 'connected') {
                $scope.logged = true;
                $scope.userIsConnected = true;
                $scope.openhuntsville();
            }
        });
    };

    $scope.draw_events = function() {
        var df = new Date($scope.date);
        df.setDate(df.getDate() - 1);

        var dt = new Date($scope.date);
        dt.setDate(dt.getDate() + 1);

        var result = [];

        for (var i = 0; i < $scope.events.length ; i++) {
            var event_date = new Date($scope.events[i].start_time);
            if (event_date > df && event_date < dt)
                result.push($scope.events[i]) ;
        }

        $scope.events = $filter('orderBy')(result, 'start_time');

        console.log($scope.events[0]);

        var len = $scope.events.length,
            mid = Math.ceil(len/2);
        $scope.left = $scope.events.slice(0, mid);
        $scope.right = $scope.events.slice(mid, len);
    }

    $scope.openhuntsville = function() {
        Facebook.api('/954447087970025', 'GET', {'fields': 'events'},
        function(response) {
            $scope.$apply(function() {
                $scope.events = response.events.data;
                $scope.draw_events();
            });
        });
    };

    $scope.events = [];
}])
.directive('eventDetail', function() {
    return {
        templateUrl: 'partials/event-detail.html'
    };
});

flyerControllers.controller('FlyerListCtrl', ['$scope', '$routeParams',
function($scope, $routeParams) {
    $scope.events = [
        {
            "date": new Date('February 24, 2016'),
            "id": 44
        },
        {
            "date": new Date('March 2, 2016'),
            "id": 45
        },
        {
            "date": new Date('March 9, 2016'),
            "id": 46
        },
        {
            "date": new Date('March 16, 2016'),
            "id": 47
        },
        {
            "date": new Date('March 23, 2016'),
            "id": 48
        },
        {
            "date": new Date('March 30, 2016'),
            "id": 49
        }
        ];
}]);
