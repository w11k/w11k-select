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
    }
  }
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
      templateUrl: w11kSelectConfig.common.templateUrl,
      scope: {},
      require: 'ngModel',
      link: function (scope, element, attrs, controller) {

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * internal model
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        var hasBeenOpened = false;
        var options = [];
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
            return scope.$parent.$eval(attrs.w11kSelectConfig);
          },
          function (newConfig) {
            if (angular.isArray(newConfig)) {
              extendDeep.apply(null, [scope.config].concat(newConfig));
              applyConfig();
            }
            else if (angular.isObject(newConfig)) {
              extendDeep(scope.config, newConfig);
              applyConfig();
            }
          },
          true
        );

        function applyConfig() {
          checkSelection();
          setViewValue();

          if (!configRead) {
            if (scope.config.filter.select.active && scope.config.filter.select.text) {
              var jqSelectFilteredButton = angular.element(element[0].querySelector('.select-filtered-text'));
              jqSelectFilteredButton.text(scope.config.filter.select.text);
            }

            if (scope.config.filter.deselect.active && scope.config.filter.deselect.text) {
              var jqDeselectFilteredButton = angular.element(element[0].querySelector('.deselect-filtered-text'));
              jqDeselectFilteredButton.text(scope.config.filter.deselect.text);
            }

            if (scope.config.header.placeholder) {
              var jqHeaderPlaceholder = angular.element(element[0].querySelector('.header-placeholder'));
              jqHeaderPlaceholder.text(scope.config.header.placeholder);
            }

            configRead = true;
          }
        }

        function checkSelection() {
          var selectedOptions = options.filter(function (option) {
            return  option.selected;
          });
          if (scope.config.multiple === false && selectedOptions.length > 0) {
            scope.deselectAll();
            selectedOptions[0].selected = true;
          }
        }

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * dropdown
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

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

        var visibility = 'visibility';
        var jqDropDownMenu = angular.element(element[0].querySelector('.dropdown-menu'));
        var domDropDownContent = element[0].querySelector('.dropdown-menu .content');
        var domHeightAdjustContainer = getParent(element, '.w11k-select-adjust-height-to');
        var jqHeaderText = angular.element(element[0].querySelector('.header-text'));

        scope.dropdown = {
          onOpen: function ($event) {
            if (scope.config.disabled) {
              $event.prevent();
              return;
            }

            if (hasBeenOpened === false) {
              hasBeenOpened = true;
              filterOptions();
            }

            $document.on('keyup', onEscPressed);

            jqDropDownMenu.css(visibility, 'hidden');
            $timeout(function () {
              adjustHeight();
              jqDropDownMenu.css(visibility, 'visible');
              
              if (scope.config.filter.active) {
                // use timeout to open dropdown first and then set the focus,
                // otherwise focus won't be set because element is not visible
                $timeout(function () {
                  element[0].querySelector('.dropdown-menu input').focus();
                });
              }
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

        function updateHeader() {
          if (angular.isDefined(scope.config.header.text)) {
            jqHeaderText.text(scope.$parent.$eval(scope.config.header.text));
          }
          else {
            var optionsSelected = options.filter(function (option) {
              return option.selected;
            });

            var selectedOptionsLabels = optionsSelected.map(function (option) {
              return option.label;
            });

            jqHeaderText.text(selectedOptionsLabels.join(', '));
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
            optionsFiltered = filter(options, scope.filter.values, false);
            scope.options.visible = optionsFiltered.slice(0, initialLimitTo);
          }
        }

        scope.showMoreOptions = function () {
          scope.options.visible = optionsFiltered.slice(0, scope.options.visible.length + increaseLimitTo);
        };

        scope.$watch('filter.values.label', function () {
          filterOptions();
        });

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

          if (scope.config.multiple) {
            angular.forEach(optionsFiltered, function (option) {
              option.selected = true;
            });
          }
          else if (optionsFiltered.length === 1) {
            optionsFiltered[0].selected = true;
          }

          setViewValue();
        };

        scope.deselectFiltered = function ($event) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          angular.forEach(optionsFiltered, function (option) {
            option.selected = false;
          });

          setViewValue();
        };

        scope.deselectAll = function ($event) {
          if (angular.isDefined($event)) {
            $event.preventDefault();
            $event.stopPropagation();
          }

          angular.forEach(options, function (option) {
            option.selected = false;
          });

          setViewValue();
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * options
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        var optionsExp = attrs.w11kSelectOptions;
        var optionsExpParsed = optionParser.parse(optionsExp);

        function collection2options(collection, viewValue) {
          var viewValueHashes = viewValue.map(function (selectedValue) {
            return hashCode(selectedValue);
          });

          return collection.map(function (option) {
            var optionValue = modelElement2value(option);
            var optionValueHash = hashCode(optionValue);
            var optionLabel = modelElement2label(option);

            var selected;
            if (viewValueHashes.indexOf(optionValueHash) !== -1) {
              selected = true;
            }
            else {
              selected = false;
            }

            return {
              hash: optionValueHash.toString(36),
              label: optionLabel,
              model: option,
              selected: selected
            };
          });
        }

        function updateOptions() {
          var collection = optionsExpParsed.collection(scope.$parent);
          var viewValue = controller.$viewValue;

          options = collection2options(collection, viewValue);

          filterOptions();
          updateNgModel();
        }

        scope.select = function (option) {
          if (scope.config.multiple) {
            option.selected = !option.selected;
          }
          else {
            scope.deselectAll();
            option.selected = true;
            scope.dropdown.close();
          }

          setViewValue();
        };

        // watch for changes of options collection made outside
        scope.$watchCollection(
          function () {
            return optionsExpParsed.collection(scope.$parent);
          },
          function (newVal) {
            if (angular.isDefined(newVal)) {
              updateOptions();
            }
          }
        );

        // called on click to a checkbox of an option
        scope.onOptionStateClick = function ($event) {
          // we have to stop propagation, otherwise selected state will be toggled twice
          // because of click handler of list element
          $event.stopPropagation();
        };

        // called on click to a checkbox of an option
        scope.onOptionStateChange = function () {
          setViewValue();
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * ngModel
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        function setViewValue() {
          var selectedValues = options2model(options);

          controller.$setViewValue(selectedValues);
          updateHeader();
        }

        function updateNgModel() {
          var value = options2model(options);

          angular.forEach(controller.$parsers, function (fn) {
            value = fn(value);
          });

          $parse(attrs.ngModel).assign(scope.$parent, value);
        }

        function render() {
          var viewValue = controller.$viewValue;

          angular.forEach(options, function (option) {
            var optionValue = option2value(option);

            if (viewValue.indexOf(optionValue) !== -1) {
              option.selected = true;
            }
            else {
              option.selected = false;
            }
          });

          validateRequired(viewValue);
          updateHeader();
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

          validateRequired(viewValue);

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
          var valid = false;

          if (scope.config.required === true && viewValue.length > 0) {
            valid =  true;
          }
          else if (scope.config.required === false) {
            valid = true;
          }

          controller.$setValidity('required', valid);
          if (valid) {
            return viewValue;
          }
        }

        function isEmpty() {
          var value = controller.$viewValue;
          return !(angular.isArray(value) && value.length > 0);
        }

        scope.isEmpty = isEmpty;

        controller.$isEmpty = isEmpty;

        controller.$render = render;
        controller.$formatters.push(external2internal);

        controller.$parsers.push(validateRequired);
        controller.$parsers.push(internal2external);


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * helper functions
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        function options2model(options) {
          var selectedOptions = options.filter(function (option) {
            return  option.selected;
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

        // inspired by https://github.com/stuartbannerman/hashcode
        var hashCode = (function () {
          var stringHash = function (string) {
            var result = 0;
            for (var i = 0; i < string.length; i++) {
              result = (((result << 5) - result) + string.charCodeAt(i)) | 0;
            }
            return result;
          };

          var primitiveHash = function (primitive) {
            var string = primitive.toString();
            return stringHash(string);
          };

          var objectHash = function (obj) {
            var result = 0;
            for (var property in obj) {
              if (obj.hasOwnProperty(property)) {
                result += primitiveHash(property + hash(obj[property]));
              }
            }
            return result;
          };

          var hash = function (value) {
            var typeHashes = {
              'string' : stringHash,
              'number' : primitiveHash,
              'boolean' : primitiveHash,
              'object' : objectHash
              // functions are excluded because they are not representative of the state of an object
              // types 'undefined' or 'null' will have a hash of 0
            };

            var type = typeof value;

            if (value === null || value === undefined) {
              return 0;
            }
            else if (typeHashes[type] !== undefined) {
              return typeHashes[type](value) + primitiveHash(type);
            }
            else {
              return 0;
            }
          };

          return hash;
        })();
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
