const dayjs = require('dayjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const {Types : { ObjectId }} = Schema

const AnswerSchema = new Schema({
    user : {
        type : String,
    },
    url : {
        type: String,
    },
    answer : {
        type : Object
    },
    dateOfParticipation : {
        type : Date,
        default : dayjs()
    }
    
})

const Answer = mongoose.model('Answer', AnswerSchema)
module.exports = Answer