
export const generateString = () => {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random()*charactersLength));
    }
    return result;
}

export const isEmail = (email: string) => {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegexp.test(email)
}