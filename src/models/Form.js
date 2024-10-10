const dayjs = require('dayjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const {Types : { ObjectId }} = Schema

const FormSchema = new Schema({
    author : {
        type: String,
        required: true
    },
    coWorkers : [{
        type: ObjectId,
        ref: 'User'
    }],
    url:{
        type: String,
        required: true,
        unique: true,
    },
    title : {
        type : String
    },
    pages : {
        type : Object
    },
    endingMent : {
        type : Object
    },
    listStyle: {
        type : String
    },
    options : {
        type : Object
    },
    createdAt : {
        type: Date,
        default: dayjs()
    },
    lastModifiedAt : {
        type: Date,
        default: dayjs()
    },
    numberOfResponses : [{
        type: ObjectId,
        ref: 'Answer'
    }]
})

const Form = mongoose.model('Form', FormSchema)
module.exports = Form

