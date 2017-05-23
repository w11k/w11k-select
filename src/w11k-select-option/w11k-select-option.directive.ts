import {OptionState} from '../model/option-state.enum';
import {InternalOption} from '../model/internal-option.model';

class Result {
  selected: number = 0;
  unselected: number = 0;
  childsSelected: number = 0;
  length: number;

  constructor(length: number) {
    this.length = length;
  }
}

export function w11kSelectOptionDirektive(w11kSelectConfig) {
  'ngInject';

  return {
    restrict: 'A',
    replace: false,
    templateUrl: w11kSelectConfig.common.templateUrlOptions,
    scope: {
      'options': '=',
      'parent': '=',
      'select': '&',
    },
    require: 'ngModel',
    controller: function ($scope, $attrs, $parse) {
      if ($scope.$parent.childsMap) {
        $scope.$parent.addChild($scope, $scope.parent)
      }
      $scope.childsMap = {};


      $scope.upwardsClick = function (clickedOption: InternalOption, res: Result) {
        let fatherOption: InternalOption = $scope.options.find(option => option.trackingId === clickedOption.parent);
        if (res.selected === 0 && res.childsSelected === 0) {
          setSelected(fatherOption, OptionState.unselected, $scope);
        } else if (res.selected === res.length) {
          setSelected(fatherOption, OptionState.selected, $scope);
        } else {
          setSelected(fatherOption, OptionState.childsSelected, $scope);

        }

        if ($scope.$parent.upwardsClick) {
          let res = calcRes($scope.options);
          $scope.$parent.upwardsClick(fatherOption, res);
        }


      };

      $scope.addChild = function (childScope, father) {
        $scope.childsMap[father.trackingId] = childScope;
      };
      $scope.onOptionStateClick = function ($event, option: InternalOption) {

        switch (option.state) {
          case OptionState.unselected:
            setSelected(option, OptionState.selected, $scope);
            break;
          case OptionState.selected:
            setSelected(option, OptionState.unselected, $scope);
            break;
          case OptionState.childsSelected:
            setSelected(option, OptionState.selected, $scope);
            break;
        }

        // upwards Click
        if ($scope.$parent.upwardsClick) {
          let res = calcRes($scope.options);
          $scope.$parent.upwardsClick(option, res);
        }

        $scope.childsMap[option.trackingId].downWardstoggleAll(option.state);
      };

      $scope.downWardstoggleAll = function (toSetState: OptionState) {
        $scope.options = toggleDownWards($scope.options, toSetState, $scope);
      }
    },
  };
}


function toggleDownWards(options: InternalOption[], toSetState: OptionState, $scope): InternalOption[] {
  return options.map(
      option => {
        option.children = toggleDownWards(option.children, toSetState, $scope);
        setSelected(option, toSetState, $scope);
        return option;
      }
  )
}


function calcRes(options: InternalOption[]): Result {
  return options.reduce(
      (prev: Result, next: InternalOption) => {
        if (next.state === OptionState.selected) {
          prev.selected++;
        }
        if (next.state === OptionState.unselected) {
          prev.unselected++;
        }
        if (next.state === OptionState.childsSelected) {
          prev.childsSelected++;
        }

        return prev

      },
      new Result(options.length))
}


function setSelected(option: InternalOption, optionState: OptionState, $scope) {
  option.state = optionState;
  $scope.select({option: option});
}
