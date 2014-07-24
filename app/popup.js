angular
  .module('App',['ngAnimate'])
  .controller('popupCtrl', ['$scope', function($scope) {

    chrome.storage.local.get(null, function(value) {
      console.log(value);
      $scope.$apply(function() {
        $scope.queries = value.queries || [];
        if ($scope.queries.length === 0) $scope.queries.push({ });
      });
    });

}]);
