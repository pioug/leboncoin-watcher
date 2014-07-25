angular
  .module('App',['ngAnimate'])
  .controller('popupCtrl', ['$scope', function($scope) {

    chrome.storage.local.get(null, function(value) {
      $scope.$apply(function() {
        var firstKey = _.keys(value.results)[0]
        $scope.allResults = value.results || [];
        $scope.seenResults = value.results[firstKey];
        $scope.current = firstKey;
      });
    });

    $scope.seeResults = function(key) {
      $scope.current = key;
      $scope.seenResults = $scope.allResults[key];
    };

    $scope.seeItem = function(item) {
      chrome.tabs.create({ url: item.url });
    };

  }])
  .filter('beautify', function() {

    return function(input) {
      var matches = input.match(/q=([^&]*)/);
      return matches[1];
    }

  });
