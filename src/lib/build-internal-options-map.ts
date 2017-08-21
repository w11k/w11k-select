export function buildInternalOptionsMap (internalOptions, internalOptionsMap) {
  internalOptions.forEach((option) => {
    if (internalOptionsMap[option.trackingId]) {
      throw new Error('Duplicate hash value for options ' + option.label + ' and ' + internalOptionsMap[option.trackingId].label);
    }
    internalOptionsMap[option.trackingId] = option;
    if (option.children) {
      buildInternalOptionsMap(option.children, internalOptionsMap);
    }
  });
}
