import {externalOption2value} from './external-option-2-value';
import {externalOption2label} from './external-option-2-label';
import {value2trackingId} from './value-2-tracking-id';
import {OptionState} from '../model/option-state.enum';
import {ConfigInstance} from '../model/config.model';
import {InternalOption} from '../model/internal-option.model';

export function externalOptions2internalOptions(externalOptions, viewValue, w11kSelectHelper, optionsExpParsed, config: ConfigInstance): InternalOption[] {
  let viewValueIDs = {};

  let i = viewValue.length;

  while (i--) {
    let trackingId = value2trackingId(viewValue[i], w11kSelectHelper, optionsExpParsed);
    viewValueIDs[trackingId] = true;
  }

  function prepareOptions(externalOption, parent?: string) {
    let value = externalOption2value(externalOption, optionsExpParsed);
    let trackingId = value2trackingId(value, w11kSelectHelper, optionsExpParsed);
    let label = externalOption2label(externalOption, optionsExpParsed);

    let internalOption = new InternalOption(
        trackingId,
        label,
        externalOption,
        !!viewValueIDs[trackingId],
        viewValueIDs[trackingId] ? OptionState.selected : OptionState.unselected,
        [],
        parent || null
    );

    if (externalOption[config.children]) {
      internalOption.children = externalOption[config.children].map(child => prepareOptions(child, trackingId))
    }
    return internalOption;
  }

  return externalOptions.map(prepareOptions);
}
