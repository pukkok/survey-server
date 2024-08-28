const dayjs = require('dayjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const {Types : { ObjectId }} = Schema

const FormShcema = new Schema({
    author : {
        type: String,
        required: true
    },
    coWorkers : [{
        type: ObjectId,
        ref: 'User'
    }],
    title : {
        type : String,
        required: true,
    },
    pages : {
        type : Object,
    },
    createdAt : {
        type: Date,
        default : dayjs()
    },
    lastModifiedAt : {
        type: Date,
        default: dayjs()
    }
})

// 설문조사시 
// 설문지 제목
// 페이지
// 퀴즈 배열

const Form = mongoose.model('Form', FormShcema)
module.exports = Form

