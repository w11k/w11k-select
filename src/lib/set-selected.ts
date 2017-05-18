import {InternalOption} from '../model/internal-option.model';
import {OptionState} from '../model/option-state.enum';
export function setSelected(options: InternalOption[], selected: boolean) {
  let i = options.length;
  while (i--) {
    options[i].selected = selected;
    options[i].state = selected ? OptionState.selected : OptionState.unselected;
    setSelected(options[i].children || [], selected)
  }
}
