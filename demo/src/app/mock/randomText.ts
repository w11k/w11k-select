let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0 1 2 3 4 5 6 7 8 9';
let chars = possible.split('');

export function randomText(length) {
  let text = '';

  for (let i = 0; i < length; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  return text;
}
