export function value2trackingId(value, w11kSelectHelper, optionsExpParsed) {
  if (optionsExpParsed.tracking !== undefined) {
    let context = {};
    let assignValueFn = optionsExpParsed.value.assign;
    assignValueFn(context, value);

    let trackingValue = optionsExpParsed.tracking(context);

    if (trackingValue === undefined) {
      throw new Error('Couldn\'t get \'track by\' value. Please make sure to only use something in \'track by’ part of w11kSelectOptions expression, accessible from result of value part. (\'option.data\' and \'option.data.unique\' but not \'option.unique\')');
    }

    return trackingValue.toString();
  }
  else {
    return w11kSelectHelper.hashCode(value);
  }

}
