const dotenv = require('dotenv')

dotenv.config({path : '../.env'})

module.exports = {
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    CLIENT : process.env.CLIENT
}