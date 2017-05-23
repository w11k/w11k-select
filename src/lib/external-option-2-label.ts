export function externalOption2label(option, optionsExpParsed) {
  let context = {};
  context[optionsExpParsed.item] = option;

  return optionsExpParsed.label(context);
}
