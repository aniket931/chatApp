import bcrypt from 'bcryptjs'

async function hashedPass(password) {
const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
};

async function verifyPassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

export {hashedPass, verifyPassword};