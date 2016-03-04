'use strict';

var flyerControllers = angular.module('flyerControllers', []);

flyerControllers.controller('EventLintCtrl', ['$scope', '$routeParams', '$filter', 'Facebook',
function($scope, $routeParams, $filter, Facebook) {
    $scope.userIsConnected = false;
    $scope.events = [];

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

    Facebook.getLoginStatus(function(response) {
        if(response.status == 'connected') {
            $scope.userIsConnected = true;
        }
    });

    $scope.IntentLogin = function() {
        if($scope.userIsConnected == false) {
            $scope.login();
        }
    };

    $scope.login = function() {
        Facebook.login(function(response) {
            if (response.status == 'connected') {
                $scope.userIsConnected = true;
                $scope.retrieve_events();
            }
        });
    };

    $scope.retrieve_events = function() {
        Facebook.api('/954447087970025', 'GET', {'fields': 'events'},
        function(response) {
            $scope.$apply(function() {
                $scope.events = response.events.data;
                $scope.check_events();
            });
        });
    };

    var check_title = function(title) {
        if (title.length > 44)
            return "Title > 44 chars"
        return "Pass";
    }

    var check_description = function(description) {
        if (typeof description == 'undefined') {
            return "Description Undefined";
        }


        var short_desc = description.split("\n")[0];
        if (short_desc.length > 150) {
            return "Description > 150 chars";
        }
        return "Pass";
    }

    var check_time = function(d, time) {
        if (typeof time == 'undefined') {
            return d + " Time Undefined";
        }
        return "Pass";
    }

    $scope.check_events = function() {
        $scope.results = [];
        console.log($scope.events);
        for (var i = 0; i < $scope.events.length; i++) {
            var result = $scope.events[i];
            result.check = {}
            result.check.title = check_title(result.name);
            result.check.description = check_description(result.description);
            result.check.start = check_time('Start', result.description);
            result.check.end = check_time('Stop', result.description);
            $scope.results.push(result);
        }
        //$scope.results = $filter('orderBy')($scope.results, 'start_time');

    };


}]);

flyerControllers.controller('FlyerDetailCtrl', ['$scope', '$routeParams', '$timeout', '$filter', 'Facebook',
function($scope, $routeParams, $timeout, $filter, Facebook) {
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
            $scope.userIsConnected = true;
        }
    });

    $scope.IntentLogin = function() {
        if(!$scope.userIsConnected) {
            $scope.login();
        }
    };

    $scope.login = function() {
        Facebook.login(function(response) {
            if (response.status == 'connected') {
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
            if (event_date > df && event_date < dt){
                $scope.events[i].short_desc = $scope.events[i].description.split("\n")[0];
                result.push($scope.events[i]) ;
            }
        }

        $scope.events = $filter('orderBy')(result, 'start_time');

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

flyerControllers.controller('FlyerListCtrl', ['$scope', '$http', '$routeParams',
function($scope, $http, $routeParams) {
    $http.get('events.json').success(function(data) {
        $scope.events = data.events;

        for(var i = 0; i < $scope.events.length; i++) {
            $scope.events[i].date = new Date($scope.events[i].date);
        }

        $scope.upcoming = [];
        $scope.past = [];

        var today = new Date();

        for(var i = 0; i < $scope.events.length; i++) {
            var event_date = new Date($scope.events[i].date);

            if (event_date >= today)
                $scope.upcoming.push($scope.events[i]);
            else
                $scope.past.push($scope.events[i]);
        }

        $scope.next_event = $scope.upcoming[0];
        console.log($scope.next_event);
        $scope.upcoming.shift();
    });

    $scope.events = [];
    $scope.upcoming = [];
    $scope.past = [];
    $scope.next_event = {};

}]);
