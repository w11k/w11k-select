/** @internal */
import * as angular from 'angular';
import {setSelected} from './lib/set-selected';
import {internalOptions2externalModel} from './lib/internal-options-2-external-model';
import {value2trackingId} from './lib/value-2-tracking-id';
import {externalOptions2internalOptions} from './lib/external-options-2-internal-options';
import {InternalOption} from './model/internal-option.model';
import {OptionState} from './model/option-state.enum';
import {ConfigInstance} from './model/config.model';
import {collectActiveLabels} from './lib/collect-active-labels';


export interface Scope extends ng.IScope {
  config: ConfigInstance;
  style: any;  // only required once?
  onKeyPressedOnDropDownToggle: (event: any) => void;
  showMoreOptions: () => void;
  onFilterValueChanged: () => void;
  clearFilter: () => void;
  onKeyPressedInFilter: ($event: any) => void;
  selectFiltered: ($event?: any) => void
  deselectFiltered: ($event: any) => void
  deselectAll: ($event: any) => void
  select: ($event: any) => void;
  isEmpty: () => boolean;

  options: {
    visible: any[]
  };
  filter: {
    values: any
  };

  dropdown: {
    onOpen?: ($event: any) => void | undefined;
    onClose?: () => void | undefined;
    close?: () => void;
    toggle?: any
  }

}

export function w11kSelect(w11kSelectConfig, $parse, $document, w11kSelectHelper, $filter, $timeout, $window, $q) {
  'ngInject';

  let jqWindow = angular.element($window);

  return {
    restrict: 'A',
    replace: false,
    templateUrl: w11kSelectConfig.common.templateUrl,
    scope: {},
    require: 'ngModel',
    controller: function ($scope, $attrs, $parse) {
      if ($attrs.w11kSelect && $attrs.w11kSelect.length > 0) {
        let exposeExpression = $parse($attrs.w11kSelect);

        if (exposeExpression.assign) {
          exposeExpression.assign($scope.$parent, this);
        }
      }

      this.open = function () {
        $scope.dropdown.open();
      };

      this.close = function () {
        $scope.dropdown.close();
      };

      this.toggle = function () {
        $scope.dropdown.toggle();
      };
    },
    compile: function (tElement, tAttrs) {
      let configExpParsed = $parse(tAttrs.w11kSelectConfig);
      let optionsExpParsed = w11kSelectHelper.parseOptions(tAttrs.w11kSelectOptions);

      let ngModelSetter = $parse(tAttrs.ngModel).assign;
      let assignValueFn = optionsExpParsed.value.assign;

      if (optionsExpParsed.tracking !== undefined && assignValueFn === undefined) {
        throw new Error('value part of w11kSelectOptions expression must be assignable if \'track by\' is used');
      }

      return function (scope: Scope, iElement: any, iAttrs: any, controller: any) {
        let domElement = iElement[0];

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * internal model
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        let hasBeenOpened = false;
        let internalOptions: InternalOption[] = [];
        let internalOptionsMap = {};
        let optionsFiltered = [];

        scope.options = {
          visible: []
        };

        scope.filter = {
          values: {}
        };

        scope.config = angular.copy(w11kSelectConfig.instance);

        // marker to read some parts of the config only once
        let configRead = false;

        scope.$watch(
            function () {
              return configExpParsed(scope.$parent);
            },
            function (newConfig) {
              if (angular.isArray(newConfig)) {
                w11kSelectHelper.extendDeep.apply(null, [scope.config].concat(newConfig));
                applyConfig();
              }
              else if (angular.isObject(newConfig)) {
                w11kSelectHelper.extendDeep(scope.config, newConfig);
                applyConfig();
              }
            },
            true
        );

        function applyConfig() {
          optionsAlreadyRead.then(function () {
            checkSelection();
            updateNgModel();
            checkConfig(scope.config, setViewValue);
          });

          if (!configRead) {
            updateStaticTexts();
            configRead = true;
          }
        }

        function updateStaticTexts() {
          if (scope.config.filter.select.active && scope.config.filter.select.text) {
            let selectFilteredButton = domElement.querySelector('.select-filtered-text');
            selectFilteredButton.textContent = scope.config.filter.select.text;
          }

          if (scope.config.filter.deselect.active && scope.config.filter.deselect.text) {
            let deselectFilteredButton = domElement.querySelector('.deselect-filtered-text');
            deselectFilteredButton.textContent = scope.config.filter.deselect.text;
          }

          if (scope.config.header.placeholder) {
            let headerPlaceholder = domElement.querySelector('.header-placeholder');
            headerPlaceholder.textContent = scope.config.header.placeholder;
          }
        }

        function checkSelection() {
          if (scope.config.multiple === false) {
            let selectedOptions: InternalOption[] = internalOptions.filter(
                (option) => option.state === OptionState.selected
            );

            if (selectedOptions.length > 0) {
              setSelected(selectedOptions, false);
              selectedOptions[0].state = OptionState.selected;
            }
          }
        }

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * dropdown
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


        function onEscPressed(event) {
          if (event.keyCode === 27) {
            if (scope.dropdown.close) { // check is for ts only
              scope.dropdown.close();
            }
          }
        }

        function adjustHeight() {
          if (angular.isDefined(scope.config.style.maxHeight)) {
            domDropDownContent.style.maxHeight = scope.style.maxHeight;
          }
          else {
            let maxHeight = calculateDynamicMaxHeight();
            domDropDownContent.style.maxHeight = maxHeight + 'px';

          }
        }

        function resetHeight() {
          domDropDownContent.style.maxHeight = '';
        }

        function calculateDynamicMaxHeight() {
          let maxHeight;

          let contentOffset = domDropDownContent.getBoundingClientRect().top;

          let windowHeight = $window.innerHeight || $window.document.documentElement.clientHeight;

          let containerHeight;
          let containerOffset;

          if (angular.isDefined(domHeightAdjustContainer)) {
            containerHeight = domHeightAdjustContainer.innerHeight || domHeightAdjustContainer.clientHeight;
            containerOffset = domHeightAdjustContainer.getBoundingClientRect().top;
          }
          else {
            containerHeight = $window.innerHeight || $window.document.documentElement.clientHeight;
            containerOffset = 0;
          }

          if (scope.config.style.marginBottom.indexOf('px') < 0) {
            throw new Error('Illegal Value for w11kSelectStyle.marginBottom');
          }
          let marginBottom = parseFloat(scope.config.style.marginBottom.slice(0, -2));

          let referenceHeight;
          let referenceOffset;

          if (containerHeight + containerOffset > windowHeight) {
            referenceHeight = windowHeight;
            referenceOffset = 0;
          }
          else {
            referenceHeight = containerHeight;
            referenceOffset = containerOffset;
          }

          maxHeight = referenceHeight - (contentOffset - referenceOffset) - marginBottom;

          let minHeightFor3Elements = 93;
          if (maxHeight < minHeightFor3Elements) {
            maxHeight = minHeightFor3Elements;
          }

          return maxHeight;
        }

        let domDropDownMenu = domElement.querySelector('.dropdown-menu');
        let domDropDownContent = domElement.querySelector('.dropdown-menu .content');
        let domHeightAdjustContainer = w11kSelectHelper.getParent(iElement, '.w11k-select-adjust-height-to');
        let domHeaderText = domElement.querySelector('.header-text');

        scope.dropdown = {
          onOpen: function ($event) {
            if (scope.config.disabled) {
              $event.prevent();
              return;
            }

            if (hasBeenOpened === false) {
              hasBeenOpened = true;
            }
            filterOptions();

            $document.on('keyup', onEscPressed);

            domDropDownMenu.style.visibility = 'hidden';
            $timeout(function () {
              adjustHeight();
              domDropDownMenu.style.visibility = 'visible';

              if (scope.config.filter.active) {
                // use timeout to open dropdown first and then set the focus,
                // otherwise focus won't be set because iElement is not visible
                $timeout(function () {
                  iElement[0].querySelector('.dropdown-menu input').focus();
                });
              }
            });
            jqWindow.on('resize', adjustHeight);

            if (angular.isFunction(scope.config.dropdown.onOpen)) {
              (scope.config.dropdown.onOpen as any)();
            }
          },
          onClose: function () {
            // important: set properties of filter.values to empty strings not to null,
            // otherwise angular's filter won't work
            scope.filter.values.label = '';

            $timeout(function () {
              resetHeight();
            });
            $document.off('keyup', onEscPressed);
            jqWindow.off('resize', adjustHeight);

            if (angular.isFunction(scope.config.dropdown.onClose)) {
              (scope.config.dropdown.onClose as any)();
            }
          }
        };

        scope.$on('$destroy', function () {
          $document.off('keyup', onEscPressed);
          jqWindow.off('resize', adjustHeight);
        });

        scope.onKeyPressedOnDropDownToggle = function ($event) {
          // enter or space
          if ($event.keyCode === 13 || $event.keyCode === 32) {
            $event.preventDefault();
            $event.stopPropagation();

            scope.dropdown.toggle();
          }
        };

        function updateHeader() {
          if (angular.isDefined(scope.config.header.text)) {
            domHeaderText.textContent = scope.$parent.$eval(scope.config.header.text as any);
          }
          else {
            let arr = [];
            internalOptions.forEach(option => collectActiveLabels(option, arr));
            domHeaderText.textContent = arr.join(', ');
          }
        }

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * filter
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        let filter = $filter('filter');
        let initialLimitTo = 80;
        let increaseLimitTo = initialLimitTo * 0.5;

        function filterOptions() {
          if (hasBeenOpened) {
            // false as third parameter: use contains to compare
            optionsFiltered = filter(internalOptions, scope.filter.values, false);
            scope.options.visible = optionsFiltered.slice(0, initialLimitTo);
          }
        }

        scope.showMoreOptions = function () {
          scope.options.visible = optionsFiltered.slice(0, scope.options.visible.length + increaseLimitTo);
        };

        scope.onFilterValueChanged = function () {
          filterOptions();
        };

        scope.clearFilter = function () {
          scope.filter.values = {};
          filterOptions();
        };

        scope.onKeyPressedInFilter = function ($event) {
          // on enter
          if ($event.keyCode === 13) {
            $event.preventDefault();
            $event.stopPropagation();

            scope.selectFiltered();
          }
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * buttons
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        scope.selectFiltered = function ($event?) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          if (scope.config.multiple) {
            setSelected(optionsFiltered, true);
          }
          else if (optionsFiltered.length === 1) {
            scope.select(optionsFiltered[0]); // behaves like if the option was clicked using the mouse
          }

          setViewValue();
        };

        scope.deselectFiltered = function ($event) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          setSelected(optionsFiltered, false);
          setViewValue();
        };

        scope.deselectAll = function ($event) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          setSelected(internalOptions, false);
          setViewValue();
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * options
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


        let optionsAlreadyRead;

        let updateOptions = (function () {
          let deferred = $q.defer();
          optionsAlreadyRead = deferred.promise;

          return function updateOptions() {
            let externalOptions = optionsExpParsed.collection(scope.$parent);
            let viewValue = controller.$viewValue;

            if (angular.isArray(externalOptions)) {
              internalOptions = externalOptions2internalOptions(externalOptions, viewValue, w11kSelectHelper, optionsExpParsed, scope.config);
              internalOptionsMap = {};
              let i = internalOptions.length;
              while (i--) {
                let option: any = internalOptions[i];
                if (internalOptionsMap[option.trackingId]) {
                  throw new Error('Duplicate hash value for options ' + option.label + ' and ' + internalOptionsMap[option.trackingId].label);
                }
                internalOptionsMap[option.trackingId] = option;
              }

              filterOptions();

              if (ngModelAlreadyRead) {
                updateNgModel();
              }
              deferred.resolve();
            }
          };
        })();

        // watch for changes of options collection made outside
        scope.$watchCollection(
            function externalOptionsWatch() {
              return optionsExpParsed.collection(scope.$parent);
            },
            function externalOptionsWatchAction(newVal) {
              if (angular.isDefined(newVal)) {
                updateOptions();
              }
            }
        );

        scope.select = function select(option: InternalOption) {
          // runs only if hierarchy is flat and multiple false

          if (scope.config.multiple) {
            setViewValue();
            return
          }

          // disable all others:
          setSelected(internalOptions, false);
          option.state = OptionState.selected;
          setViewValue();
          (scope.dropdown.close as any)();
        };


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * ngModel
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        function setViewValue() {
          let selectedValues = internalOptions2externalModel(internalOptions, optionsExpParsed, w11kSelectConfig);

          controller.$setViewValue(selectedValues);
          updateHeader();
        }

        function updateNgModel() {
          let value = internalOptions2externalModel(internalOptions, optionsExpParsed, w11kSelectConfig);
          angular.forEach(controller.$parsers, function (parser) {
            value = parser(value);
          });

          ngModelSetter(scope.$parent, value);
        }


        let ngModelAlreadyRead;

        function render() {
          optionsAlreadyRead.then(function () {
            ngModelAlreadyRead = true;

            let viewValue = controller.$viewValue;

            setSelected(internalOptions, false);

            let i = viewValue.length;
            while (i--) {
              let trackingId = value2trackingId(viewValue[i], w11kSelectHelper, optionsExpParsed);
              let option = internalOptionsMap[trackingId];

              if (option) {
                option.state = OptionState.selected;
              }
            }

            updateHeader();
          });
        }


        function external2internal(modelValue) {
          let viewValue;

          if (angular.isArray(modelValue)) {
            viewValue = modelValue;
          }
          else if (angular.isDefined(modelValue)) {
            viewValue = [modelValue];
          }
          else {
            viewValue = [];
          }

          return viewValue;
        }

        function internal2external(viewValue) {
          if (angular.isUndefined(viewValue)) {
            return;
          }

          let modelValue;

          if (scope.config.multiple) {
            modelValue = viewValue;
          }
          else {
            modelValue = viewValue[0];
          }

          return modelValue;
        }

        function validateRequired(viewValue) {
          if (scope.config.multiple === true && scope.config.required === true && viewValue.length === 0) {
            return false;
          }
          if (scope.config.multiple === false && scope.config.required === true && viewValue === undefined) {
            return false;
          }

          return true;
        }

        function isEmpty() {
          let value = controller.$viewValue;
          return !(angular.isArray(value) && value.length > 0);
        }

        scope.isEmpty = isEmpty;

        controller.$isEmpty = isEmpty;

        controller.$render = render;
        controller.$formatters.push(external2internal);
        controller.$validators.required = validateRequired;
        controller.$parsers.push(internal2external);

      };
    }
  };
}


let checkConfig = (config: ConfigInstance, setViewValue) => {
  /**
   *  Currently there is a bug if multiple = false and required = true.
   *  Then the validator runs only once, before the config is present
   *  and returns a wrong validation state.
   *  might be fixed by calling updateNgModel() here
   * */
  // throw error if multiple is false and childrenKey is present
  if (config.children && !config.multiple) {
    throw new Error('Multiple must be enabled when displaying hierarchically structure');
  }
  if (config.children) {
    setViewValue();
  }
};
