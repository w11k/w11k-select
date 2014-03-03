'use strict';

angular.module('w11k.select', [
  'pasvaz.bindonce',
  'w11k.dropdownToggle'
]);

angular.module('w11k.select').factory('optionParser', function ($parse) {

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
});

angular.module('w11k.select').directive('w11kSelect', function ($parse, $document, optionParser, $filter, $timeout, $window) {
  return {
    restrict: 'A',
    replace: false,
    templateUrl: 'w11k-select.tpl.html',
    scope: {
      isMultiple: '=?multiple',
      isRequired: '=?required',
      isDisabled: '=?disabled'
    },
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {

      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
       * internal model
       * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

      var options = [];
      scope.optionsFiltered = [];

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

      scope.dropdown = {
        onOpen: function ($event) {
          if (scope.isDisabled) {
            $event.prevent();
            return;
          }

          if (scope.filter.active) {
            // use timeout to open dropdown first and then set the focus,
            // otherwise focus won't be set because element is not visible
            $timeout(function () {
              element.find('.dropdown-menu input').first().focus();

              adjustHeight();
              $($window).on('resize', adjustHeight);
            });
          }
        },
        onClose: function () {
          // important: set properties of filter.values to empty strings not to null,
          // otherwise angular's filter won't work
          scope.filter.values.label = '';

          $timeout(function () {
            resetHeight();
          });
          $($window).off('resize', adjustHeight);
        }
      };

      function adjustHeight() {
        var content = element.find('.dropdown-menu .content');

        var offset = content.offset();
        var scrollTop = $($window).scrollTop();

        var windowHeight = $window.innerHeight;
        var maxHeight = (windowHeight - (offset.top - scrollTop)) - 60;

        var minHeightFor3Elements = 93;
        if (maxHeight < minHeightFor3Elements) {
          maxHeight = minHeightFor3Elements;
        }

        content.css('max-height', maxHeight);
      }

      function resetHeight() {
        var content = element.find('.dropdown-menu .content');
        content.css('max-height', '');
      }

      // read the placeholder attribute once
      var placeholderAttrObserver = attrs.$observe('placeholder', function (placeholder) {
        if (angular.isDefined(placeholder)) {
          header.placeholder = scope.$eval(placeholder);
          updateHeader();

          placeholderAttrObserver();
          placeholderAttrObserver = null;
        }
      });

      // read the selected-message attribute once
      var selectedMessageAttrObserver = attrs.$observe('selectedMessage', function (selectedMessage) {
        if (angular.isDefined(selectedMessage)) {
          header.selectedMessage = scope.$eval(selectedMessage);
          updateHeader();

          selectedMessageAttrObserver();
          selectedMessageAttrObserver = null;
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

      function filterOptions() {
        scope.optionsFiltered = filter(options, scope.filter.values, false);
      }

      // read the selected-message attribute once
      var filterPlaceholderAttrObserver = attrs.$observe('filterPlaceholder', function (filterPlaceholder) {
        if (angular.isDefined(filterPlaceholder)) {
          scope.filter.placeholder = scope.$eval(filterPlaceholder);

          filterPlaceholderAttrObserver();
          filterPlaceholderAttrObserver = null;
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

          scope.selectAll();
        }
      };

      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
       * buttons
       * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

      scope.selectAll = function ($event) {
        if (angular.isDefined($event)) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        if (scope.isMultiple === false) {
          return;
        }

        angular.forEach(scope.optionsFiltered, function (option) {
          option.selected = true;
        });

        updateNgModel();
      };

      scope.deselectAll = function ($event) {
        if (angular.isDefined($event)) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        angular.forEach(scope.optionsFiltered, function (option) {
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
        return collection.map(function (option) {
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
            label: optionLabel,
            model: option,
            selected: selected
          };
        });
      }

      function updateOptions() {
        var collection = optionsExpParsed.collection(scope.$parent);
        var modelValue = ngModelCtrl.$viewValue;

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

        ngModelCtrl.$setViewValue(selectedValues);
        updateHeader();
      }

      function readNgModel() {
        var modelValue = ngModelCtrl.$viewValue;

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

        ngModelCtrl.$setValidity('required', valid);
        if (valid) {
          return viewValue;
        }
        else {
          return undefined;
        }
      }

      function isEmpty() {
        var value = ngModelCtrl.$modelValue;
        if (scope.isMultiple) {
          return !(angular.isArray(value) && value.length > 0);
        }
        else {
          return angular.isUndefined(value);
        }
      }

      scope.isEmpty = function () {
        return isEmpty();
      };

      ngModelCtrl.$render = readNgModel;
      ngModelCtrl.$isEmpty = isEmpty;

      ngModelCtrl.$parsers.push(validateRequired);
      ngModelCtrl.$parsers.push(viewValue2modelValue);

      ngModelCtrl.$formatters.push(modelValue2viewValue);

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
});
