const dayjs = require('dayjs')
const mongoose = require('mongoose')
const { Schema } = mongoose

const AnswerSchema = new Schema({
    userId : {
        type : String,
    },
    url : {
        type: String,
    },
    answers : {
        type : Object
    },
    dateOfParticipation : {
        type : Date,
        default : dayjs()
    },
    lastModifiedAt : {
        type: Date,
        default: dayjs()
    },
    
})

const Answer = mongoose.model('Answer', AnswerSchema)
module.exports = Answer