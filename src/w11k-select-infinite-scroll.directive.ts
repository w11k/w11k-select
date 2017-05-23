export function w11kSelectInfiniteScroll($timeout) {
  'ngInject';
  return {
    link: function (scope, element, attrs) {
      let scrollDistance = 0;
      let scrollEnabled = true;
      let checkImmediatelyWhenEnabled = false;

      let onDomScrollHandler = function () {
        onScrollHandler(true);
      };

      let scrollContainer = element[0];

      if (scrollContainer.children.length !== 1) {
        throw new Error('scroll container has to have exactly one child!');
      }

      let content = scrollContainer.children[0];

      let onScrollHandler = function (apply?) {

        let distanceToBottom = content.clientHeight - scrollContainer.scrollTop;
        let shouldScroll = distanceToBottom <= scrollContainer.clientHeight * (scrollDistance + 1);

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

      attrs.$observe('w11kSelectInfiniteScrollDistance', function (value: any) {
        scrollDistance = parseFloat(value);
      });


      attrs.$observe('w11kSelectInfiniteScrollDisabled', function (value: any) {
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
}
