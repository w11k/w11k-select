'use strict';
/** @internal */
import * as angular from 'angular';
import {IModule} from 'angular';
import {Config} from './model/config.model';
import {W11KSelectHelper} from './w11k-select-helper.factory';
import {w11kSelect} from './w11k-select.directive';
import {w11kSelectOptionDirektive} from './w11k-select-option/w11k-select-option.directive';
import {w11kSelectCheckboxDirective} from './w11k-select-checkbox/w11k-checkbox.directive';
import {w11kSelectInfiniteScroll} from './w11k-select-infinite-scroll.directive';
import {keyListener} from './lib/key-listener';

export const module: IModule = angular.module('w11k.select', [
  'w11k.dropdownToggle',
  'w11k.select.template'
]);

module
    .constant('w11kSelectConfig', new Config())
    .directive('w11kSelectInfiniteScroll', w11kSelectInfiniteScroll)
    .service('w11kSelectHelper', W11KSelectHelper)
    .directive('w11kSelect', w11kSelect)
    .directive('w11kSelectOption', w11kSelectOptionDirektive)
    .directive('w11kSelectCheckbox', w11kSelectCheckboxDirective)
    .directive('keyListener', keyListener);
