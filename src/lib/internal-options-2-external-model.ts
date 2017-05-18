import {internalOption2value} from './internal-option-2-value';
import {Config} from '../model/config.model';
import {InternalOption} from '../model/internal-option.model';
import {OptionState} from '../model/option-state.enum';

export function internalOptions2externalModel(options, optionsExpParsed, config: Config) {
  let arr = [];
  options.forEach(option => traverse(option, arr, optionsExpParsed));
  return arr;
}


function traverse(option: InternalOption, arr, optionsExpParsed) {
  if (option.state === OptionState.selected) {
    arr.push(internalOption2value(option, optionsExpParsed))
  }
  option.children.forEach(option => traverse(option, arr, optionsExpParsed))

}
