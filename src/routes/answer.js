const express = require('express')
const Answer = require('../models/Answer')
const Form = require('../models/Form')
const expressAsyncHandler = require('express-async-handler')
const dayjs = require('dayjs')
const { hasToken } = require('../../auth')

const router = express.Router()

router.post('/submit', hasToken, expressAsyncHandler( async(req, res, next) => {
    const { url } = req.query
    const { answer } = req.body
    const userInfo = req.user
    const userId = userInfo?.userId || '비회원'

    const form = await Form.findOne({ url })

    if (!form) {
        return res.json({ code: 404, msg: '설문지를 찾을 수 없습니다.' })
    }

    if(userId !== '비회원'){
        const alreadySubmitted = await Answer.findOne({ url, userId })

        if(alreadySubmitted){
            alreadySubmitted.answer = {...answer}
            alreadySubmitted.lastModifiedAt = dayjs()

            const success = await alreadySubmitted.save()
            if(success){
                return res.json({code: 200, msg: '설문 내용이 수정되었습니다.'})
            }else{
                return res.json({code: 400, msg: '업데이트에 실패했습니다.'})
            }
        }
    }

    // 인원 체크
    const maxCount = form.options?.maximumCount || 10000
    if (form.numberOfResponses.length > maxCount) {
        return res.json({ code: 401, msg: '참여인원을 초과하였습니다.' })
    }

    const newAnswer = new Answer({
        userId,
        url,
        answer,
        dateOfParticipation: dayjs()
    })
    const success = await newAnswer.save()
    if(success){
        form.numberOfResponses.push(newAnswer._id)
        await form.save()

        res.json({code: 200, msg: '답변이 제출되었습니다.'})
    }else{
        res.json({code: 401, msg: '답변 제출에 실패했습니다.'})
    }
}))

module.exports = router