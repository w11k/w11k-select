'use strict';

angular.module("demo", ["w11k.select", "w11k.select.template"]);

angular.module("demo").controller("DemoCtrl", function ($scope) {

  var amount = 10000;

  $scope.options = {
    data: []
  };

  $scope.selected = {
    data: []
  };

  function createOptions() {
    $scope.options.data = [];
    for (var i = 1; i <= amount; i++) {
      $scope.options.data.push({ label: i, value: i });
    }
  }

  $scope.selectRandom = function () {
    var randomValue = Math.floor((Math.random() * amount) + 1);

    if ($scope.selected.data.indexOf(randomValue) < 0) {
      $scope.selected.data.push(randomValue);
      // we have to assign a different object, otherwise ng-model will not detect the change
      $scope.selected.data = angular.copy($scope.selected.data);
    }
  };

  $scope.createNewOptions = function () {
    amount = amount / 2;
    createOptions();
  };

  createOptions();
});
