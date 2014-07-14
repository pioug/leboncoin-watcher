function optionsCtrl($scope) {

  chrome.storage.sync.get('queries', function(value) {
    $scope.$apply(function() {
      $scope.queries = value.queries || [];
    });
  });

  $scope.$watch('queries', function(newValue, oldValue) {
    chrome.storage.sync.set({ queries: angular.copy(newValue) });
  }, true);

  $scope.addSearch = function() {
    $scope.queries.push({});
  }

};
