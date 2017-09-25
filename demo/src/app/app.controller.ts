// import {w11kCheckbox} from '../w11k-checkbox.directive';
import {DATA_FLAT} from './mock/data.flat.mock';
import {DATA_DEEP} from './mock/data.deep.mock';
import {randomText} from './mock/randomText';
import * as angular from 'angular';
import {Config} from '../../../src/model/config.model';

export class AppCtrl {
  config;
  options = {
    data: DATA_DEEP as any
  };

  optionsFlat = {
    data: DATA_FLAT as any
  };
  staticConfigFlat = {
    disabled: false,
    children: 'subItems',
    header: {
      placeholder: 'Please select something'
    },
  };

  staticConfigDeep = {
    disabled: false,
    children: 'subItems',
    header: {
      placeholder: 'Please select something'
    },
  };
  dynamicConfigDeep = {
    required: true,
    multiple: true
  };

  dynamicConfigFlat = {
    required: true,
    multiple: true,
    children: undefined
  };

  debug: boolean;

  selected: {
    dataFlat: string | string [];
    dataDeep: string | string [];
  };

  constructor() {
    'ngInject';

    this.debug = true;
    this.createOptions();
  }


  mergeConfig(configurations: Config[]): Config {
    return configurations.reduce((previousValue, currentValue) => {
        return { ...previousValue, ...currentValue };
      }, {} as Config);
  }


  createOptions() {

    for (let i = 1; i <= 100; i++) {
      this.options.data.push({label: i, value: randomText(i % 200), subItems: null});
      this.optionsFlat.data.push({label: i, value: randomText(i % 200), subItems: null});
    }
  }

  selectRandom() {
    let randomIndex = Math.floor((Math.random() * this.optionsFlat.data.length));
    let randomValue = this.optionsFlat.data[randomIndex].value;

    if (this.dynamicConfigFlat.multiple) {
      if (this.selected.dataFlat.indexOf(randomValue) < 0) {

        (this.selected.dataFlat as string[]).push(randomValue)
      }
      // we have to assign a different object, otherwise ng-model will not detect the change
    }
    else {
      this.selected.dataFlat = randomValue;
    }
    this.selected.dataFlat = angular.copy(this.selected.dataFlat);


  };

  createNewOptions() {
    this.optionsFlat.data = this.optionsFlat.data.slice((this.optionsFlat.data.length / 2) - 1);
  };

}
