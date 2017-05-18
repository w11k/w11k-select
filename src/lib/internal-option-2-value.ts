import {externalOption2value} from './external-option-2-value';
export function internalOption2value(option, optionsExpParsed) {
  return externalOption2value(option.model, optionsExpParsed);
}
