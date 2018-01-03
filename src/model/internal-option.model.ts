import {OptionState} from './option-state.enum';

export class InternalOption {

  trackingId: string;
  label: string;
  model: any;
  selected: boolean;
  state: OptionState;
  children: InternalOption[];
  isSearchResultOrParent: boolean;
  parent: any;

  constructor (trackingId: string, label: string, model: any, selected: boolean, state: OptionState, children: InternalOption[], parent: any) {
    this.trackingId = trackingId;
    this.label = label;
    this.model = model;
    this.selected = selected;
    this.state = state;
    this.children = children;
    this.parent = parent;
    this.isSearchResultOrParent = true;
  }
}
