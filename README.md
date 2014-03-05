# w11k-select - Single- and Multi-Select Directive for AngularJS

w11k-select is an AngularJS directive created to replace the default HTML select element which has a poor usability for most use cases particularly in desktop browsers.

Features:

* Single- and multi-select
* High performance and usability even with hundreds of options
* Filter options to find the right one quickly
* Uses Twitter Bootstrap markup / styling, comes with default css but easy to adjust / override
* Disabled state and required-validation
* Customisable texts (placeholders and selected representation)
 

## Getting Started

### Installation

* Install via Bower (w11k-select) or download manually from our release repository (https://github.com/w11k/w11k-select-bower)
* Include scripts into your application (w11k-select and dependencies):
  * jQuery
  * AngularJS
  * bind-once
  * w11k-dropdownToggle
  * w11k-select
* Add dependency to w11k-select to your angular module

### Usage

    <div w11k-select multiple="options.multiple"
                     disabled="!options.enabled"
                     required="options.required"
                     ng-model="selected.data"
                     options="option.value as option.label for option in options.data"
                     placeholder="'All'"
                     filter-placeholder="'Filter'"
                     >
    </div>
    
Attention: ```placeholder``` and ```filter-placeholder``` are expressions but for a better preformance they are evaluated only once. So you can not change the placeholder and filter-placeholder text dynamically at runtime via data-binding but e.g. you can use expressions like ```'common.filter.placeholder' | translate``` to read the text form a translation file. 


## Roadmap

see milestones and issues at https://github.com/w11k/w11k-select/issues


## License

MIT - see LICENSE file
