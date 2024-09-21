const dayjs = require('dayjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const {Types : { ObjectId }} = Schema

const QuestionSchema = new Schema({
    author : {
        type: String,
        required: true
    },
    coWorker : [{
        type: ObjectId,
        ref: 'User'
    }],
    id: {
        type: String,
        required: true
    },
    q : {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    type : {
        type: String,
        required: true
    },
    options: [{
        type: Object,
        required: true
    }],
    hasExtraOption: {
        type: Boolean,
        default: false
    },
    createdAt : {
        type: Date,
        default: dayjs()
    },
    lastModifiedAt : {
        type: Date,
        default: dayjs()
    }
    
})

const Question = mongoose.model('Question', QuestionSchema)
module.exports = Question