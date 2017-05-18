import {InternalOption} from '../model/internal-option.model';
import {OptionState} from '../model/option-state.enum';

export function collectActiveLabels(option: InternalOption, labelArray: string[]): void {
  if (option.state === OptionState.selected) {
    labelArray.push(option.label)
  }
  option.children.forEach(option => collectActiveLabels(option, labelArray))
}
