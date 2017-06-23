import * as angular from 'angular';
import {AppCtrl} from './app.controller';

export const appModule = angular.module('app', ['w11k.select']);

appModule.controller('AppCtrl', AppCtrl);

const templateModule = angular.module('w11k.select.template', []);

templateModule.run(function ($templateCache) {
  'ngInject';
  $templateCache.put('w11k-select.tpl.html', require('../../node_modules/w11k-select/dist/w11k-select.tpl.html'));
  $templateCache.put('w11k-select-option.tpl.html', require('../../node_modules/w11k-select/dist/w11k-select-option.tpl.html'));
});
