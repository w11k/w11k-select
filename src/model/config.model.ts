export class ConfigCommon {
  templateUrl: string = 'w11k-select.tpl.html';
  templateUrlOptions: string = 'w11k-select-option.tpl.html';
}
export interface StyleConfig {
  marginBottom: '10px';
  maxHeight: undefined | string;
}

export interface FilterConfig {
  active: boolean;
  placeholder: string;
  select: {
    active: boolean;
    text: undefined | string;
  }
  deselect: {
    active: true,
    text: undefined | string;
  }
}

export class ConfigInstance {
  /** for form validation */
  required: boolean = false;
  /** Hide checkboxes during single selection */
  hideCheckboxes: boolean = false;
  /** single or multiple select */
  multiple: boolean = true;
  /** disable user interaction */
  disabled: boolean = false;
  /** all the configuration for the header (visible if dropdown closed) */
  header = {
    /** text to show if no item selected (plain text, no evaluation, no data-binding) */
    placeholder: '',
    /**
     * text to show if item(s) selected (expression, evaluated against user scope)
     * make sure to enclose your expression withing quotes, otherwise it will be evaluated too early
     * default: undefined evaluates to a comma separated representation of selected items
     * example: ng-model='options.selected' w11k-select-config='{header: {placeholder: 'options.selected.length'}}'
     */
    text: undefined
  };
  dropdown: {
    onOpen: (() => void) | undefined,
    onClose: (() => void) | undefined
  } = {
    onOpen: undefined,
    onClose: undefined
  };
  /** all the configuration for the filter section within the dropdown */
  filter: FilterConfig = {
    /** activate filter input to search for options */
    active: true,
    /** text to show if no filter is applied */
    placeholder: 'Filter',
    /** 'select all filtered options' button */
    select: {
      /** show select all button */
      active: true,
      /**
       * label for select all button
       * default: undefined evaluates to 'all'
       */
      text: undefined
    },
    /** 'deselect all filtered options' button */
    deselect: {
      /** show deselect all button */
      active: true,
      /**
       * label for deselect all button
       * default: undefined evaluates to 'none'
       */
      text: undefined
    }
  };

  /** values for dynamically calculated styling of dropdown */
  style: StyleConfig = {
    /** margin-bottom for automatic height adjust */
    marginBottom: '10px',
    /** static or manually calculated max height (disables internal height calculation) */
    maxHeight: undefined
  };
  /** when set to true, the clear-button is always visible. */
  showClearAlways: boolean = false;
  children: string;

}

export class Config {
  common: ConfigCommon;
  instance: ConfigInstance;


  constructor(common?: ConfigCommon, instance?: ConfigInstance) {
    this.common = common || new ConfigCommon();
    this.instance = instance || new ConfigInstance();
  }
}
