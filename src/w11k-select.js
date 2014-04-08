'use strict';

angular.module('w11k.select', [
  'pasvaz.bindonce',
  'w11k.dropdownToggle'
]);

angular.module('w11k.select').constant('w11kSelectConfig', {
  templateUrl: 'w11k-select.tpl.html'
});

angular.module('w11k.select').factory('optionParser', ['$parse', function ($parse) {

  //                     value      as   label     for   item                    in   collection
  var OPTIONS_EXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

  return {
    parse: function (input) {

      var match = input.match(OPTIONS_EXP);
      if (!match) {
        var expected = '"value" [as "label"] for "item" in "collection"';
        throw new Error('Expected options in form of \'' + expected + '\' but got "' + input + '".');
      }

      var result = {
        value: $parse(match[1]),
        label: $parse(match[2] || match[1]),
        item: match[3],
        collection: $parse(match[4])
      };

      return result;
    }
  };
}]);

angular.module('w11k.select').directive('w11kSelect', [
  'w11kSelectConfig', '$parse', '$document', 'optionParser', '$filter', '$timeout', '$window',
  function (w11kSelectConfig, $parse, $document, optionParser, $filter, $timeout, $window) {

    var jqWindow = angular.element($window);

    return {
      restrict: 'A',
      replace: false,
      templateUrl: w11kSelectConfig.templateUrl,
      scope: {
        isMultiple: '=?multiple',
        isRequired: '=?required',
        isDisabled: '=?disabled'
      },
      require: 'ngModel',
      link: function (scope, element, attrs, controller) {

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * internal model
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        var hasBeenOpened = false;
        var options = [];
        var optionsFiltered = [];
        scope.optionsToShow = [];

        var header = {
          placeholder: '',
          selectedMessage: null
        };

        scope.header = {
          text: ''
        };

        scope.filter = {
          active: true,
          values: {},
          placeholder: ''
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * dropdown
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        var onEscPressed = function (event) {
          if (event.keyCode === 27) {
            scope.dropdown.close();
          }
        };

        scope.dropdown = {
          onOpen: function ($event) {
            if (scope.isDisabled) {
              $event.prevent();
              return;
            }

            if (hasBeenOpened === false) {
              hasBeenOpened = true;
              filterOptions();
            }

            if (scope.filter.active) {
              // use timeout to open dropdown first and then set the focus,
              // otherwise focus won't be set because element is not visible
              $timeout(function () {
                element[0].querySelector('.dropdown-menu input').focus();
              });

            }

            $document.on('keyup', onEscPressed);

            $timeout(function () {
              adjustHeight();
            });
            jqWindow.on('resize', adjustHeight);
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
          }
        };

        scope.$on('$destroy', function () {
          $document.off('keyup', onEscPressed);
          jqWindow.off('resize', adjustHeight);
        });

        function adjustHeight() {
          var content = element[0].querySelector('.dropdown-menu .content');

          var offset = content.getBoundingClientRect();

          var windowHeight = $window.innerHeight || $window.document.documentElement.clientHeight;
          var maxHeight = (windowHeight - offset.top) - 60;

          var minHeightFor3Elements = 93;
          if (maxHeight < minHeightFor3Elements) {
            maxHeight = minHeightFor3Elements;
          }

          content.style.maxHeight = maxHeight + 'px';
        }

        function resetHeight() {
          var content = element[0].querySelector('.dropdown-menu .content');
          content.style.maxHeight = '';
        }

        // read the placeholder attribute once
        var placeholderAttrObserver = attrs.$observe('placeholder', function (placeholder) {
          if (angular.isDefined(placeholder)) {
            header.placeholder = scope.$eval(placeholder);
            updateHeader();

            if (angular.isFunction(placeholderAttrObserver)) {
              placeholderAttrObserver();
              placeholderAttrObserver = undefined;
            }
          }
        });

        // read the selected-message attribute once
        var selectedMessageAttrObserver = attrs.$observe('selectedMessage', function (selectedMessage) {
          if (angular.isDefined(selectedMessage)) {
            header.selectedMessage = scope.$eval(selectedMessage);
            updateHeader();

            if (angular.isFunction(selectedMessageAttrObserver)) {
              selectedMessageAttrObserver();
              selectedMessageAttrObserver = undefined;
            }
          }
        });

        // read the select-filtered-text attribute once
        var selectFilteredTextAttrObserver = attrs.$observe('selectFilteredText', function (selectFilteredText) {
          if (angular.isDefined(selectFilteredText)) {
            var text = scope.$eval(selectFilteredText);
            var span = angular.element(element[0].querySelector('.select-filtered-text'));
            span.text(text);

            if (angular.isFunction(selectFilteredTextAttrObserver)) {
              selectFilteredTextAttrObserver();
              selectFilteredTextAttrObserver = undefined;
            }
          }
        });

        // read the deselect-filtered-text attribute once
        var deselectFilteredTextAttrObserver = attrs.$observe('deselectFilteredText', function (deselectFilteredText) {
          if (angular.isDefined(deselectFilteredText)) {
            var text = scope.$eval(deselectFilteredText);
            var span = angular.element(element[0].querySelector('.deselect-filtered-text'));
            span.text(text);

            if (angular.isFunction(deselectFilteredTextAttrObserver)) {
              deselectFilteredTextAttrObserver();
              deselectFilteredTextAttrObserver = undefined;
            }
          }
        });

        function getHeaderText() {
          if (isEmpty()) {
            return header.placeholder;
          }

          var optionsSelected = options.filter(function (option) {
            return option.selected;
          });

          var selectedOptionsLabels = optionsSelected.map(function (option) {
            return option.label;
          });

          var selectedOptionsString = selectedOptionsLabels.join(', ');

          var result;
          if (header.selectedMessage !== null) {
            var replacements = {length: optionsSelected.length, selectedItems: selectedOptionsString};

            result = header.selectedMessage.replace(/\{(.*)\}/g, function (match, p1) {
              return replacements[p1];
            });
          }
          else {
            result = selectedOptionsString;
          }

          return result;
        }

        function updateHeader() {
          scope.header.text = getHeaderText();
        }

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * filter
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        var filter = $filter('filter');
        var limitTo = $filter('limitTo');
        var initialLimitTo = 80;
        var increaseLimitTo = initialLimitTo * 0.5;

        function filterOptions() {
          if (hasBeenOpened) {
            optionsFiltered = filter(options, scope.filter.values, false);
            scope.optionsToShow = limitTo(optionsFiltered, initialLimitTo);
          }
        }

        scope.showMoreOptions = function () {
          scope.optionsToShow = optionsFiltered.slice(0, scope.optionsToShow.length + increaseLimitTo);
        };

        // read the filter-placeholder attribute once
        var filterPlaceholderAttrObserver = attrs.$observe('filterPlaceholder', function (filterPlaceholder) {
          if (angular.isDefined(filterPlaceholder)) {
            scope.filter.placeholder = scope.$eval(filterPlaceholder);

            if (angular.isFunction(filterPlaceholderAttrObserver)) {
              filterPlaceholderAttrObserver();
              filterPlaceholderAttrObserver = undefined;
            }
          }
        });

        scope.$watch('filter.values', function () {
          filterOptions();
        }, true);

        scope.clearFilter = function () {
          scope.filter.values = {};
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

          if (scope.isMultiple) {
            angular.forEach(optionsFiltered, function (option) {
              option.selected = true;
            });
          }
          else if (optionsFiltered.length === 1) {
            optionsFiltered[0].selected = true;
          }

          updateNgModel();
        };

        scope.deselectFiltered = function ($event) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          angular.forEach(optionsFiltered, function (option) {
            option.selected = false;
          });

          updateNgModel();
        };

        scope.deselectAll = function ($event) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          angular.forEach(options, function (option) {
            option.selected = false;
          });

          updateNgModel();
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * options
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        var optionsExp = attrs.options;
        var optionsExpParsed = optionParser.parse(optionsExp);

        function collection2options(collection, viewValue) {
          return collection.map(function (option, index) {
            var optionValue = modelElement2value(option);
            var optionLabel = modelElement2label(option);

            var selected;
            if (angular.isArray(viewValue) && viewValue.indexOf(optionValue) !== -1) {
              selected = true;
            }
            else {
              selected = false;
            }

            return {
              index: index,
              label: optionLabel,
              model: option,
              selected: selected
            };
          });
        }

        function updateOptions() {
          var collection = optionsExpParsed.collection(scope.$parent);
          var modelValue = controller.$viewValue;

          options = collection2options(collection, modelValue);

          filterOptions();
          updateNgModel();
        }

        scope.select = function (option) {
          if (scope.isMultiple) {
            option.selected = !option.selected;
          }
          else {
            scope.deselectAll();
            option.selected = true;
            scope.dropdown.close();
          }

          updateNgModel();
        };

        // watch for changes of options collection made outside
        scope.$watch(
          function () {
            return optionsExpParsed.collection(scope.$parent);
          },
          function (newVal) {
            if (angular.isDefined(newVal)) {
              updateOptions();
            }
          },
          true
        );

        // called on click to a checkbox of an option
        scope.onOptionStateClick = function ($event) {
          // we have to stop propagation, otherwise selected state will be toggled twice
          // because of click handler of list element
          $event.stopPropagation();
        };

        // called on click to a checkbox of an option
        scope.onOptionStateChange = function () {
          updateNgModel();
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * ngModel
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        function updateNgModel() {
          var selectedValues = options2model(options);

          controller.$setViewValue(selectedValues);
          updateHeader();
        }

        function readNgModel() {
          var modelValue = controller.$viewValue;

          angular.forEach(options, function (option) {
            var optionValue = option2value(option);

            if (modelValue.indexOf(optionValue) !== -1) {
              option.selected = true;
            }
            else {
              option.selected = false;
            }
          });

          updateHeader();
        }

        function modelValue2viewValue(modelValue) {
          var viewValue;

          if (angular.isArray(modelValue)) {
            viewValue = modelValue;
          }
          else {
            viewValue = [modelValue];
          }

          return viewValue;
        }

        function viewValue2modelValue(viewValue) {
          var modelValue;

          if (scope.isMultiple) {
            modelValue = viewValue;
          }
          else {
            modelValue = viewValue[0];
          }

          return modelValue;
        }

        function validateRequired(viewValue) {
          if (angular.isUndefined(scope.isRequired) || scope.isRequired === false) {
            return viewValue;
          }

          var valid = false;

          if (scope.isMultiple === true && angular.isArray(viewValue) && viewValue.length > 0) {
            valid =  true;
          }

          controller.$setValidity('required', valid);
          if (valid) {
            return viewValue;
          }
          else {
            return undefined;
          }
        }

        function isEmpty() {
          var value = controller.$viewValue;
          return !(angular.isArray(value) && value.length > 0);
        }

        scope.isEmpty = function () {
          return isEmpty();
        };

        controller.$render = readNgModel;
        controller.$isEmpty = isEmpty;

        controller.$parsers.push(validateRequired);
        controller.$parsers.push(viewValue2modelValue);

        controller.$formatters.push(modelValue2viewValue);

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * helper functions
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        function options2model(options) {
          var selectedOptions = options.filter(function (option) {
            var isSelected = option.selected;
            var isPartlySelected = angular.isArray(option.children) && option.partlySelected;

            return  isSelected || isPartlySelected;
          });

          var selectedValues = selectedOptions.map(option2value);

          return selectedValues;
        }

        function option2value(option) {
          return modelElement2value(option.model);
        }

        function modelElement2value(modelElement) {
          var context = {};
          context[optionsExpParsed.item] = modelElement;

          return optionsExpParsed.value(context);
        }

        function modelElement2label(modelElement) {
          var context = {};
          context[optionsExpParsed.item] = modelElement;

          return optionsExpParsed.label(context);
        }
      }
    };
  }
]);

angular.module('w11k.select').directive('infiniteScroll', ['$timeout', function ($timeout) {
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
              scope.$eval(attrs.infiniteScroll);
            });
          }
          else {
            scope.$eval(attrs.infiniteScroll);
          }
        }
        else if (shouldScroll) {
          checkImmediatelyWhenEnabled = true;
        }
      };

      attrs.$observe('infiniteScrollDistance', function (value) {
        scrollDistance = parseFloat(value);
      });


      attrs.$observe('infiniteScrollDisabled', function (value) {
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
        if (attrs.infiniteScrollImmediateCheck) {
          if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
            onScrollHandler();
          }
        }
      });
    }
  };
}]);
