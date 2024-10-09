const express = require('express')
const Answer = require('../models/Answer')
const expressAsyncHandler = require('express-async-handler')
const dayjs = require('dayjs')

const router = express.Router()

router.post('/submit', expressAsyncHandler( async(req, res, next) => {
    const {user, url, answer} = req.body
    const newAnswer = new Answer({
        user,
        url,
        answer,
        dateOfParticipation: dayjs()
    })
    const success = await newAnswer.save()
    if(success){
        res.json({code: 200, msg: '답변이 제출되었습니다.'})
    }else{
        res.json({code: 401, msg: '답변 제출에 실패했습니다.'})
    }
}))

module.exports = router