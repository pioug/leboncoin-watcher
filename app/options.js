angular
  .module('App',['ngAnimate'])
  .controller('optionsCtrl', ['$scope', function($scope) {

    chrome.storage.local.get('queries', function(value) {
      $scope.$apply(function() {
        $scope.queries = value.queries || [];
        if ($scope.queries.length === 0) $scope.queries.push({ });
      });
    });

    $scope.$watch('queries', function(newValue) {
      chrome.storage.local.set({ queries: angular.copy(newValue) });
    }, true);

    $scope.addSearch = function() {
      $scope.queries.push({ });
    };

    $scope.deleteSearch = function(index) {
      $scope.queries.splice(index, 1);
    };

}]);
