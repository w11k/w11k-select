'use strict';

angular.module('w11k.select', [
  'pasvaz.bindonce',
  'w11k.dropdownToggle',
  'w11k.select.template'
]);

angular.module('w11k.select').constant('w11kSelectConfig', {
  common: {
    /**
     * path to template
     * do not change if you're using w11k-select.tpl.js
     * adjust if you want to use your own template or
     */
    templateUrl: 'w11k-select.tpl.html'
  },
  instance: {
    /** for form validation */
    required: false,
    /** Hide checkboxes during single selection */
    hideCheckboxes: false,
    /** single or multiple select */
    multiple: true,
    /** disable user interaction */
    disabled: false,
    /** all the configuration for the header (visible if dropdown closed) */
    header: {
      /** text to show if no item selected (plain text, no evaluation, no data-binding) */
      placeholder: '',
      /**
       * text to show if item(s) selected (expression, evaluated against user scope)
       * make sure to enclose your expression withing quotes, otherwise it will be evaluated too early
       * default: undefined evaluates to a comma separated representation of selected items
       * example: ng-model="options.selected" w11k-select-config="{header: {placeholder: 'options.selected.length'}}"
       */
      text: undefined
    },
    dropdown: {
      onOpen: undefined,
      onClose: undefined
    },
    /** all the configuration for the filter section within the dropdown */
    filter: {
      /** activate filter input to search for options */
      active: true,
      /** text to show if no filter is applied */
      placeholder: 'Filter',
      /** 'select all filtered options' button */
      select: {
        /** show select all button */
        active: true,
        /**
         * label for select all button
         * default: undefined evaluates to 'all'
         */
        text: undefined
      },
      /** 'deselect all filtered options' button */
      deselect: {
        /** show deselect all button */
        active: true,
        /**
         * label for deselect all button
         * default: undefined evaluates to 'none'
         */
        text: undefined
      }
    },
    /** values for dynamically calculated styling of dropdown */
    style: {
      /** margin-bottom for automatic height adjust */
      marginBottom: '10px',
      /** static or manually calculated max height (disables internal height calculation) */
      maxHeight: undefined
    },
    /** when set to true, the clear-button is always visible. */
    showClearAlways: false
  }
});

angular.module('w11k.select').factory('w11kSelectHelper', ['$parse', '$document', function ($parse, $document) {

  //                   value                 as    label                for       item              in        collection                |  filter                        track by     tracking
  var OPTIONS_EXP = /^([a-zA-Z][\w\.]*)(?:\s+as\s+([a-zA-Z][\w\.]*))?\s+for\s+(?:([a-zA-Z][\w]*))\s+in\s+([$_a-zA-Z][\w\.\(\)]*(?:\s+\|\s[a-zA-Z][\w\:_\{\}']*)*)(?:\s+track\sby\s+([a-zA-Z][\w\.]*))?$/;

  function extendDeep(dst) {
    angular.forEach(arguments, function (obj) {
      if (obj !== dst) {
        angular.forEach(obj, function (value, key) {
          if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
            extendDeep(dst[key], value);
          } else {
            dst[key] = value;
          }
        });
      }
    });
    return dst;
  }

  function hashCode(value) {
    var string;
    if (typeof value === 'object') {
      string = angular.toJson(value);
    }
    else {
      string = value.toString();
    }

    var hash = 0;
    var length = string.length;
    for (var i = 0; i < length; i++) {
      hash = string.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    }

    return hash.toString(36);
  }

  function parseOptions(input) {

    var match = input.match(OPTIONS_EXP);
    if (!match) {
      var expected = '"item.value" [as "item.label"] for "item" in "collection [ | filter ] [track by item.value.unique]"';
      throw new Error('Expected options in form of \'' + expected + '\' but got "' + input + '".');
    }

    var result = {
      value: $parse(match[1]),
      label: $parse(match[2] || match[1]),
      item: match[3],
      collection: $parse(match[4])
    };

    if (match[5] !== undefined) {
      result.tracking = $parse(match[5]);
    }

    return result;
  }

  function getParent(element, selector) {
    // with jQuery
    if (angular.isFunction(element.parents)) {
      var container = element.parents(selector);
      if (container.length > 0) {
        return container[0];
      }

      return;
    }

    // without jQuery
    var matchesSelector = 'MatchesSelector';
    var matchFunctions = [
      'matches',
      'matchesSelector',
      'moz' + matchesSelector,
      'webkit' + matchesSelector,
      'ms' + matchesSelector,
      'o' + matchesSelector
    ];

    for (var index in matchFunctions) {
      var matchFunction = matchFunctions[index];
      if (angular.isFunction(element[0][matchFunction])) {
        var parent1 = element[0].parentNode;
        while (parent1 !== $document[0]) {
          if (parent1[matchFunction](selector)) {
            return parent1;
          }
          parent1 = parent1.parentNode;
        }

        return;
      }
    }

    return;
  }


  return {
    parseOptions: parseOptions,
    hashCode: hashCode,
    extendDeep: extendDeep,
    getParent: getParent
  };
}]);

angular.module('w11k.select').directive('w11kSelect', [
  'w11kSelectConfig', '$parse', '$document', 'w11kSelectHelper', '$filter', '$timeout', '$window', '$q',
  function (w11kSelectConfig, $parse, $document, w11kSelectHelper, $filter, $timeout, $window, $q) {

    var jqWindow = angular.element($window);

    return {
      restrict: 'A',
      replace: false,
      templateUrl: w11kSelectConfig.common.templateUrl,
      scope: {},
      require: 'ngModel',
      controller: function ($scope, $attrs, $parse) {
        if ($attrs.w11kSelect && $attrs.w11kSelect.length > 0) {
          var exposeExpression = $parse($attrs.w11kSelect);

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
        var configExpParsed = $parse(tAttrs.w11kSelectConfig);
        var optionsExpParsed = w11kSelectHelper.parseOptions(tAttrs.w11kSelectOptions);

        var ngModelSetter = $parse(tAttrs.ngModel).assign;
        var assignValueFn = optionsExpParsed.value.assign;

        if (optionsExpParsed.tracking !== undefined && assignValueFn === undefined) {
          throw new Error('value part of w11kSelectOptions expression must be assignable if \'track by\' is used');
        }

        return function (scope, iElement, iAttrs, controller) {
          var domElement = iElement[0];

          /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           * internal model
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

          var hasBeenOpened = false;
          var internalOptions = [];
          var internalOptionsMap = {};
          var optionsFiltered = [];

          scope.options = {
            visible: []
          };

          scope.filter = {
            values: {}
          };

          scope.config = angular.copy(w11kSelectConfig.instance);

          // marker to read some parts of the config only once
          var configRead = false;

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
            });

            if (!configRead) {
              updateStaticTexts();
              configRead = true;
            }
          }

          function updateStaticTexts() {
            if (scope.config.filter.select.active && scope.config.filter.select.text) {
              var selectFilteredButton = domElement.querySelector('.select-filtered-text');
              selectFilteredButton.textContent = scope.config.filter.select.text;
            }

            if (scope.config.filter.deselect.active && scope.config.filter.deselect.text) {
              var deselectFilteredButton = domElement.querySelector('.deselect-filtered-text');
              deselectFilteredButton.textContent = scope.config.filter.deselect.text;
            }

            if (scope.config.header.placeholder) {
              var headerPlaceholder = domElement.querySelector('.header-placeholder');
              headerPlaceholder.textContent = scope.config.header.placeholder;
            }
          }

          function checkSelection() {
            if (scope.config.multiple === false) {
              var selectedOptions = internalOptions.filter(function (option) {
                return  option.selected;
              });

              if (selectedOptions.length > 0) {
                setSelected(selectedOptions, false);
                selectedOptions[0].selected = true;
              }
            }
          }

          /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           * dropdown
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


          function onEscPressed(event) {
            if (event.keyCode === 27) {
              scope.dropdown.close();
            }
          }

          function adjustHeight() {
            if (angular.isDefined(scope.config.style.maxHeight)) {
              domDropDownContent.style.maxHeight = scope.style.maxHeight;
            }
            else {
              var maxHeight = calculateDynamicMaxHeight();
              domDropDownContent.style.maxHeight = maxHeight + 'px';

            }
          }

          function resetHeight() {
            domDropDownContent.style.maxHeight = '';
          }

          function calculateDynamicMaxHeight() {
            var maxHeight;

            var contentOffset = domDropDownContent.getBoundingClientRect().top;

            var windowHeight = $window.innerHeight || $window.document.documentElement.clientHeight;

            var containerHeight;
            var containerOffset;

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
            var marginBottom = parseFloat(scope.config.style.marginBottom.slice(0, -2));

            var referenceHeight;
            var referenceOffset;

            if (containerHeight + containerOffset > windowHeight) {
              referenceHeight = windowHeight;
              referenceOffset = 0;
            }
            else {
              referenceHeight = containerHeight;
              referenceOffset = containerOffset;
            }

            maxHeight = referenceHeight - (contentOffset - referenceOffset) - marginBottom;

            var minHeightFor3Elements = 93;
            if (maxHeight < minHeightFor3Elements) {
              maxHeight = minHeightFor3Elements;
            }

            return maxHeight;
          }

          var domDropDownMenu = domElement.querySelector('.dropdown-menu');
          var domDropDownContent = domElement.querySelector('.dropdown-menu .content');
          var domHeightAdjustContainer = w11kSelectHelper.getParent(iElement, '.w11k-select-adjust-height-to');
          var domHeaderText = domElement.querySelector('.header-text');

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
                scope.config.dropdown.onOpen();
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
                scope.config.dropdown.onClose();
              }
            }
          };

          scope.$on('$destroy', function () {
            $document.off('keyup', onEscPressed);
            jqWindow.off('resize', adjustHeight);
          });

          scope.onKeyPressedOnDropDownToggle = function ($event) {
            // enter or space
            if ($event.keyCode === 13 || $event.keyCode === 32) {
              $event.preventDefault();
              $event.stopPropagation();

              scope.dropdown.toggle();
            }
          };

          function updateHeader() {
            if (angular.isDefined(scope.config.header.text)) {
              domHeaderText.textContent = scope.$parent.$eval(scope.config.header.text);
            }
            else {
              var optionsSelected = internalOptions.filter(function (option) {
                return option.selected;
              });

              var selectedOptionsLabels = optionsSelected.map(function (option) {
                return option.label;
              });

              domHeaderText.textContent = selectedOptionsLabels.join(', ');
            }
          }

          /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           * filter
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

          var filter = $filter('filter');
          var initialLimitTo = 80;
          var increaseLimitTo = initialLimitTo * 0.5;

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

          scope.selectFiltered = function ($event) {
            if (angular.isDefined($event)) {
              $event.preventDefault();
              $event.stopPropagation();
            }

            if (scope.config.multiple) {
              setSelected(optionsFiltered, true);
            }
            else if (optionsFiltered.length === 1) {
              scope.select(optionsFiltered[0]); //behaves like if the option was clicked using the mouse
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

          function externalOptions2internalOptions(externalOptions, viewValue) {
            var viewValueIDs = {};

            var i = viewValue.length;
            while (i--) {
              var trackingId = value2trackingId(viewValue[i]);
              viewValueIDs[trackingId] = true;
            }

            var internalOptions = externalOptions.map(function (externalOption) {
              var value = externalOption2value(externalOption);
              var trackingId = value2trackingId(value);
              var label = externalOption2label(externalOption);

              var selected;
              if (viewValueIDs[trackingId]) {
                selected = true;
              }
              else {
                selected = false;
              }

              var internalOption = {
                trackingId: trackingId,
                label: label,
                model: externalOption,
                selected: selected
              };

              return internalOption;
            });

            return internalOptions;
          }

          var optionsAlreadyRead;

          var updateOptions = (function () {
            var deferred = $q.defer();
            optionsAlreadyRead = deferred.promise;

            return function updateOptions() {
              var externalOptions = optionsExpParsed.collection(scope.$parent);
              var viewValue = controller.$viewValue;

              if (angular.isArray(externalOptions)) {
                internalOptions = externalOptions2internalOptions(externalOptions, viewValue);

                internalOptionsMap = {};
                var i = internalOptions.length;
                while (i--) {
                  var option = internalOptions[i];
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

          scope.select = function select(option) {
            if (option.selected === false && scope.config.multiple === false) {
              setSelected(internalOptions, false);
              option.selected = true;

              scope.dropdown.close();
              setViewValue();
            }
            else if (option.selected && scope.config.required === false && scope.config.multiple === false) {
              option.selected = false;
              scope.dropdown.close();
              setViewValue();
            }
            else if (scope.config.multiple) {
              option.selected = !option.selected;
              setViewValue();
            }
          };

          // called on click to a checkbox of an option
          scope.onOptionStateClick = function onOptionStateClick($event, option) {
            // we have to stop propagation, otherwise selected state will be toggled twice
          // because of click handler of list element
            $event.stopPropagation();

            if (option.selected && scope.config.required && scope.config.multiple === false) {
              $event.preventDefault();
            }

            scope.select(option);
          };

          /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           * ngModel
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

          function setViewValue() {
            var selectedValues = internalOptions2externalModel(internalOptions);

            controller.$setViewValue(selectedValues);
            updateHeader();
          }

          function updateNgModel() {
            var value = internalOptions2externalModel(internalOptions);

            angular.forEach(controller.$parsers, function (parser) {
              value = parser(value);
            });

            ngModelSetter(scope.$parent, value);
          }


          var ngModelAlreadyRead;

          function render() {
            optionsAlreadyRead.then(function () {
              ngModelAlreadyRead = true;

              var viewValue = controller.$viewValue;

              setSelected(internalOptions, false);

              var i = viewValue.length;
              while (i--) {
                var trackingId = value2trackingId(viewValue[i]);
                var option = internalOptionsMap[trackingId];

                if (option) {
                  option.selected = true;
                }
              }

              updateHeader();
            });
          }

          function value2trackingId(value) {
            if (optionsExpParsed.tracking !== undefined) {
              var context = {};
              assignValueFn(context, value);

              var trackingValue = optionsExpParsed.tracking(context);

              if (trackingValue === undefined) {
                throw new Error('Couldn\'t get \'track by\' value. Please make sure to only use something in \'track by’ part of w11kSelectOptions expression, accessible from result of value part. (\'option.data\' and \'option.data.unique\' but not \'option.unique\')');
              }

              return trackingValue.toString();
            }
            else {
              return w11kSelectHelper.hashCode(value);
            }

          }

          function external2internal(modelValue) {
            var viewValue;

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

            var modelValue;

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
            var value = controller.$viewValue;
            return !(angular.isArray(value) && value.length > 0);
          }

          scope.isEmpty = isEmpty;

          controller.$isEmpty = isEmpty;

          controller.$render = render;
          controller.$formatters.push(external2internal);

          if (angular.version.major === 1 && angular.version.minor < 3) {
            controller.$parsers.push(function (viewValue) {
              controller.$setValidity('required', validateRequired(viewValue));
            });
          } else {
            controller.$validators.required = validateRequired;
          }

          controller.$parsers.push(internal2external);


          /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           * helper functions
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

          function setSelected(options, selected) {
            var i = options.length;
            while (i--) {
              options[i].selected = selected;
            }
          }

          function internalOptions2externalModel(options) {
            var selectedOptions = options.filter(function (option) {
              return option.selected;
            });

            var selectedValues = selectedOptions.map(internalOption2value);

            return selectedValues;
          }

          function internalOption2value(option) {
            return externalOption2value(option.model);
          }

          function externalOption2value(option) {
            var context = {};
            context[optionsExpParsed.item] = option;

            return optionsExpParsed.value(context);
          }

          function externalOption2label(option) {
            var context = {};
            context[optionsExpParsed.item] = option;

            return optionsExpParsed.label(context);
          }
        };
      }
    };
  }
]);

angular.module('w11k.select').directive('w11kSelectInfiniteScroll', ['$timeout', function ($timeout) {
  return {
    link: function (scope, element, attrs) {
      var scrollDistance   = 0;
      var scrollEnabled    = true;
      var checkImmediatelyWhenEnabled = false;

      var onDomScrollHandler = function () {
        onScrollHandler(true);
      };

      var scrollContainer = element[0];

      if (scrollContainer.children.length !== 1) {
        throw new Error('scroll container has to have exactly one child!');
      }

      var content = scrollContainer.children[0];

      var onScrollHandler = function (apply) {

        var distanceToBottom  = content.clientHeight - scrollContainer.scrollTop;
        var shouldScroll  = distanceToBottom <= scrollContainer.clientHeight * (scrollDistance + 1);

        if (shouldScroll && scrollEnabled) {
          if (apply) {
            scope.$apply(function () {
              scope.$eval(attrs.w11kSelectInfiniteScroll);
            });
          }
          else {
            scope.$eval(attrs.w11kSelectInfiniteScroll);
          }
        }
        else if (shouldScroll) {
          checkImmediatelyWhenEnabled = true;
        }
      };

      attrs.$observe('w11kSelectInfiniteScrollDistance', function (value) {
        scrollDistance = parseFloat(value);
      });


      attrs.$observe('w11kSelectInfiniteScrollDisabled', function (value) {
        scrollEnabled = !value;

        if (scrollEnabled && checkImmediatelyWhenEnabled) {
          checkImmediatelyWhenEnabled = false;
          onScrollHandler();
        }
      });

      element.on('scroll', onDomScrollHandler);
      scope.$on('$destroy', function () {
        element.off('scroll', onDomScrollHandler);
      });

      return $timeout(function () {
        if (attrs.w11kSelectInfiniteScrollImmediateCheck) {
          if (scope.$eval(attrs.w11kSelectInfiniteScrollImmediateCheck)) {
            onScrollHandler();
          }
        }
      });
    }
  };
}]);
