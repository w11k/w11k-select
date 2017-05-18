export function keyListener () {
  return function (scope, elm, attrs) {
    // prevent scroll on space click
    elm.bind("keydown", function (event) {
      if (event.keyCode === 32) {
        event.preventDefault();
      }
    });

    // trigger click on spacer || enter
    elm.bind("keyup", function (event) {
      if (event.keyCode === 32 || event.keyCode === 13) {
        scope.$apply(attrs.keyListener);
      }
    });

  };
}
