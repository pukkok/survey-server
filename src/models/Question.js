const dayjs = require('dayjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const {Types : { ObjectId }} = Schema

// 내 질문들
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
    d: {
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
    scoreRanges: {
        type: Object,
    },
    tableRows: {
        type: Array,
    },
    tableCols: {
        type: Array,
    },
    hasDescription: {
        type: Boolean,
    },
    period: {
        type: Object,
    },
    setPeriod: {
        type: Boolean,
    },
    essential: {
        type: Boolean,
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