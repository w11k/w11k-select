import {enableProdMode} from 'ng-metadata/core';
import {appModule} from './app/app.module';
import * as angular from 'angular';

if (ENV === 'production') {
  enableProdMode();
}

angular.bootstrap(document, [appModule.name], {strictDi: false});


import 'style.scss';
