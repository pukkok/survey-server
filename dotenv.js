const dotenv = require('dotenv')

dotenv.config({path: '../.env'})

module.exports = {
    MONGO_URI : process.env.MONGO_URI,
    JWT_SECRET : process.env.JWT_SECRET
}