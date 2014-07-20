angular
  .module('App',['ngAnimate'])
  .controller('popupCtrl', ['$scope', function($scope) {

    chrome.storage.sync.get('queries', function(value) {
      $scope.$apply(function() {
        $scope.queries = value.queries || [];
        if ($scope.queries.length === 0) $scope.queries.push({ });
      });
    });

}]);
