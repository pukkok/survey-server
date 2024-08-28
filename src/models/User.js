const mongoose = require('mongoose')
const {Schema} = mongoose
const {Types : { ObjectId }} = Schema
const dayjs = require('dayjs')

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: dayjs()
    },
    lastModifiedAt: {
        type: Date,
        default: dayjs()
    }
})

const User = mongoose.model('User', UserSchema)
module.exports = User