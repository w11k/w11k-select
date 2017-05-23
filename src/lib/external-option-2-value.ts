export function externalOption2value(option, optionsExpParsed) {
  let context = {};
  context[optionsExpParsed.item] = option;

  return optionsExpParsed.value(context);
}
