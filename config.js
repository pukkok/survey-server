const dotenv = require('dotenv')

dotenv.config({path : '../.env'}) // 배포용
// dotenv.config({path : '.env'}) // 개발용

module.exports = {
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    CLIENT : process.env.CLIENT,
    EMAIL_ID : process.env.EMAIL_ID,
    EMAIL_PW : process.env.EMAIL_PW
}