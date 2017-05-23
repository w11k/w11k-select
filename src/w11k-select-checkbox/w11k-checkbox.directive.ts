import {OptionState} from '../model/option-state.enum';


export class W11KSelectCheckbox {
  state: OptionState;
  toggle: Function;

  getClass(state: OptionState): string {
    return OptionState[state];
  }

}

export function w11kSelectCheckboxDirective(): ng.IDirective {
  return {
    scope: {
      'state': '=',
    },
    bindToController: true,
    controllerAs: '$ctrl',
    template: `<a class="w11k-checkbox" ng-class="$ctrl.getClass($ctrl.state)"></a>`,
    restrict: 'E',
    controller: W11KSelectCheckbox
  }

}
