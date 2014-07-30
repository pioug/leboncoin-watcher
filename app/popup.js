angular
  .module('App',['ngAnimate'])
  .controller('popupCtrl', ['$scope', function($scope) {

    chrome.storage.local.get(null, function(value) {
      $scope.$apply(function() {
        var firstKey = _.keys(value.results)[0]
        $scope.allResults = value.results || [];
        $scope.current = localStorage.previousKey || firstKey;
        $scope.seenResults = $scope.allResults[$scope.current];
      });
    });

    $scope.seeResults = function(key) {
      $scope.current = key;
      $scope.seenResults = $scope.allResults[key];
      localStorage.previousKey = key;
    };

    $scope.seeItem = function(item) {
      chrome.tabs.create({ url: item.url });
    };

  }])
  .filter('beautify', function() {

    return function(input) {
      var matches = input.match(/q=([^&]*)/);
      if (matches) return matches[1];
      return input.split('/')[5].replace(/_/g, " ");
    }

  });
