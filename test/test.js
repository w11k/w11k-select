'use strict';

angular.module('demo', ['w11k.select']);

angular.module('demo').controller('TestCtrl', function ($scope) {

  var amount = 10;

  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0 1 2 3 4 5 6 7 8 9';
  var chars = possible.split('');

  function randomText(length) {
    var text = '';

    for (var i = 0; i < length; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }

    return text;
  }

  $scope.options = {
    data: []
  };

  $scope.selected = {
    data: [1, 2, 3, 10, 11]
  };

  $scope.staticConfig = {
    disabled: false,
    header: {
      placeholder: 'test'
    }
  };

  $scope.dynamicConfig = {
    required: true,
    multiple: true
  };

  function createOptions() {
    $scope.options.data = [];
//    for (var i = 1; i <= amount; i++) {
//      $scope.options.data.push({ label: randomText(i % 200), value: i });
//    }
    for (var i = 1; i <= amount; i++) {
      $scope.options.data.push({ label: i, value: i });
    }
  }

  $scope.selectRandom = function () {
    var randomIndex = Math.floor((Math.random() * $scope.options.data.length));
    var randomValue = $scope.options.data[randomIndex].value;

    if ($scope.selected.data.indexOf(randomValue) < 0) {
      $scope.selected.data.push(randomValue);
      // we have to assign a different object, otherwise ng-model will not detect the change
      $scope.selected.data = angular.copy($scope.selected.data);
    }
  };

  $scope.createNewOptions = function () {
    $scope.options.data = $scope.options.data.slice(($scope.options.data.length / 2) - 1);
  };

  $scope.createAndSelect = function () {
    var i = $scope.options.data[$scope.options.data.length - 1].value + 1;
    var option = { label: i, value: i};
    $scope.options.data.push(option);

    $scope.selected.data = [];
    $scope.selected.data.push(i);
  }

  createOptions();
});
