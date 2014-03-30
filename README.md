# w11k-select - Single- and Multi-Select Directive for AngularJS

w11k-select is an AngularJS directive created to replace the default HTML select element which has a poor usability for most use cases particularly in desktop browsers.

Features:

* Single- and multi-select
* High performance and usability even with hundreds of options
* Filter options to find the right one quickly
* Uses Twitter Bootstrap markup / styling, comes with default css but easy to adjust / override
* Disabled state and required-validation
* Customisable texts (placeholders and selected representation)
 

## Installation

* Install via Bower (w11k-select) or download manually from our release repository (https://github.com/w11k/w11k-select-bower)
* Include scripts into your application (w11k-select and dependencies):
  * AngularJS
  * bind-once
  * w11k-dropdownToggle
  * w11k-select
  * font-awesome (optional)
* Add dependency to w11k-select to your angular module

## Usage

    <div w11k-select multiple="options.multiple"
                     disabled="!options.enabled"
                     required="options.required"
                     ng-model="selected.data"
                     options="option.value as option.label for option in options.data"
                     placeholder="'All'"
                     filter-placeholder="'Filter'"
                     select-filtered-text="'all'"
                     deselect-filtered-text="'none'"
                     >
    </div>
    

```placeholder```, ```filter-placeholder```, ```select-filtered-text``` and ```deselect-filtered-text``` are optional attributes with default values in English.
**Attention**: These attributes are expressions but for a better preformance they are evaluated only once. So you can not change the texts dynamically at runtime via data-binding but e.g. you can use expressions like ```'common.filter.placeholder' | translate``` to read the text form a translation file.

### Usage without font-awesome

font-awesome is an optional dependency of w11k-select. w11k-select uses font-awesome classes to show icons. If you don't want to include font-awesome in your project, you can use the following classes to style the icons / define their content. Otherwise they will be empty.

This is a sass example to reproduce the default icons. Notice: You don't need this code if you use font-awesome. The font-awesome classes are already included in the template of the directive.

    .w11k-select .icon-deselect-all {
      @extend .fa;
      @extend .fa-times;
    }
    .w11k-select .icon-dropdown-open {
      @extend .fa;
      @extend .fa-chevron-up;
    }
    .w11k-select .icon-dropdown-closed {
      @extend .fa;
      @extend .fa-chevron-down;
    }
    .w11k-select .icon-select-filtered {
      @extend .fa;
      @extend .fa-check-square-o;
    }
    .w11k-select .icon-deselect-filtered {
      @extend .fa;
      @extend .fa-square-o;
    }


## Roadmap

see milestones and issues at https://github.com/w11k/w11k-select/issues


## License

MIT - see LICENSE file
