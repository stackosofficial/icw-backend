

export function getRandomString(length: number) {
    var token = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
}

export const reverse = (str) => {
    const arr = str.split("");
    const rev = arr.reverse();
    const newStr = rev.join("");
    return newStr;
}