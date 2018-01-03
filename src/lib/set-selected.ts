import {InternalOption} from '../model/internal-option.model';
import {OptionState} from '../model/option-state.enum';

export function setSelected (options: InternalOption[], selected: boolean) {
  let i = options.length;
  while (i--) {
    options[i].selected = selected;
    options[i].state = selected ? OptionState.selected : OptionState.unselected;

    setSelected(options[i].children || [], selected);
  }
}

// Sets all options to selected (deep) where isSearchResultOrParent is true
export function setFilteredSelected (options: InternalOption[]) {
  options.forEach(option => {
    option.selected = option.isSearchResultOrParent;
    option.state = option.selected ? OptionState.selected : OptionState.unselected;
    setFilteredSelected(option.children || []);
  });
}
