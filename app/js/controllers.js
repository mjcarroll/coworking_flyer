'use strict';

var flyerControllers = angular.module('flyerControllers', []);

flyerControllers.controller('EventLintCtrl', ['$scope', '$http', '$routeParams', '$filter', 'Facebook',
function($scope, $http, $routeParams, $filter, Facebook) {
    $scope.userIsConnected = false;
    $scope.events = [];
    $scope.coworking_nights = [];

    $http.get('events.json').success(function(data) {
        $scope.coworking_nights = data.events;
        $scope.venues = data.venues;
    });

    $scope.$watch(
        function() {
            return Facebook.isReady();
        },
        function(newVal) {
            if (newVal) {
                $scope.facebookReady = true;
                Facebook.getLoginStatus(function(response) {
                    if(response.status == 'connected') {
                        $scope.retrieve_events();
                        $scope.check_events();
                        $scope.userIsConnected = true;
                    }
                });
            }
        }
    );

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
        Facebook.api('/954447087970025', 'GET', {'fields': 'events{owner,id,place,start_time,end_time,description,name,is_viewer_admin,attending_count}'},
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
    };

    var find_venue = function(event) {
        for(var i = 0; i < $scope.venues.length; i++) {
            if(event.place.name.indexOf($scope.venues[i].match) != -1) {
                return $scope.venues[i];
            }
        }
        return { "match": "To Be Posted", "full": "To Be Posted", "floor": "" };
    };

    var find_night_id = function(event) {
        for(var i = 0; i < $scope.coworking_nights.length; i++) {
            var event_date = new Date(event.start_time);
            var night_date = new Date($scope.coworking_nights[i].date);

            if ( event_date.getDate() == night_date.getDate() && event_date.getMonth() == night_date.getMonth() && event_date.getYear() == night_date.getYear() ) {
               return $scope.coworking_nights[i].id;
            }
        }
        return -1;
    };

    $scope.check_events = function() {
        $scope.results = [];
        for (var i = 0; i < $scope.events.length; i++) {
            var result = $scope.events[i];
            result.check = {}
            result.place = find_venue(result);
            result.check.size = "Pass";

            if (result.place.full != "To Be Posted") {
                if (result.attending_count >= 2* result.place.capacity) {
                    result.check.size = "Over Capacity";
                } else if (result.attending_count >= result.place.capacity) {
                    result.check.size = "Full";
                }
            }

            result.check.title = check_title(result.name);
            result.check.description = check_description(result.description);
            result.check.start = check_time('Start', result.start_time);
            result.check.end = check_time('Stop', result.end_time);
            result.night_id = find_night_id(result);
            $scope.results.push(result);
        }
        $scope.results = $filter('orderBy')($scope.results, 'start_time');

        $scope.upcoming = [];
        $scope.past = [];
        var today = new Date();
        for(var i = 0; i < $scope.results.length; i++) {
            var event_date = new Date($scope.results[i].start_time);

            if (event_date >= today)
                $scope.upcoming.push($scope.results[i]);
            else
                $scope.past.push($scope.results[i]);
        }
    };
}]);

flyerControllers.controller('FlyerDetailCtrl', ['$scope', '$routeParams', '$http', '$timeout', '$filter', 'Facebook',
function($scope, $routeParams, $http, $timeout, $filter, Facebook) {
    $scope.night_id = $routeParams.id;
    $scope.facebookReady = false;
    $scope.userIsConnected = false;


    $http.get('events.json').success(function(data) {
        $scope.venues = data.venues;

        for(var i = 0; i < data.events.length; i++) {
            if (data.events[i].id == $scope.night_id) {
                $scope.date = new Date(data.events[i].date);
            }
        }
    });


    $scope.$watch(
        function() {
            return Facebook.isReady();
        },
        function(newVal) {
            if (newVal) {
                $scope.facebookReady = true;
                Facebook.getLoginStatus(function(response) {
                    if(response.status == 'connected') {
                        $scope.userIsConnected = true;
                        $scope.retrieve_events();

                    }
                });
            }
        }
    );

    $scope.IntentLogin = function() {
        if(!$scope.userIsConnected) {
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

    var find_venue = function(event) {
        for(var i = 0; i < $scope.venues.length; i++) {
            if(event.place.name.indexOf($scope.venues[i].match) != -1) {
                return $scope.venues[i];
            }
        }
        return { "match": "To Be Posted", "full": "To Be Posted", "floor": "" };
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
                $scope.events[i].venue = find_venue($scope.events[i]);
                result.push($scope.events[i]) ;
            }
        }

        $scope.events = $filter('orderBy')(result, 'start_time');

        var len = $scope.events.length,
            mid = Math.ceil(len/2);
        $scope.left = $scope.events.slice(0, mid);
        $scope.right = $scope.events.slice(mid, len);
    }


    $scope.retrieve_events = function() {
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
        $scope.upcoming.shift();
    });

    $scope.events = [];
    $scope.upcoming = [];
    $scope.past = [];
    $scope.next_event = {};

}]);
