export function getRandomString(length: number) {
  let token = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

export const reverse = (str) => {
  const arr = str.split('');
  const rev = arr.reverse();
  const newStr = rev.join('');
  return newStr;
};
