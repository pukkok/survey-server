const express = require('express')
const User = require('../models/User')
const Form = require('../models/Form')
const Answer = require('../models/Answer')
const expressAsyncHandler = require('express-async-handler')
const { isAuth, verifyToken, hasToken } = require('../../auth')
const Question = require('../models/Question')
const dayjs = require('dayjs')

const router = express.Router()

function randomUrl(n) {
    let newUrl = ''
    const alphabets = 'abcdefghijklmonpqrstuvwxyz'
    const lowerCase = alphabets.split('')
    const upperCase = alphabets.toUpperCase().split('')
    const number = '0123456789'.split('')
    const merge = [...lowerCase, ...upperCase, ...number]
    while(newUrl.length <= n){
        let rn = parseInt(Math.random() * merge.length)
        newUrl += merge[rn]
    }
    return newUrl
}

async function urlChecker (url) {
    const urlCheck = await Form.findOne({url})
    if(!urlCheck){
        return url
    }else{
        url += randomUrl(2)
        return urlChecker(url)
    }
}

// 설문지 생성
router.post('/create', isAuth, expressAsyncHandler( async(req, res, next) => {
    let url = req.body.url
    url = await urlChecker(url)
    if(url){
        const {title, pages, listStyle, options} = req.body

        const form = new Form({
            author: req.user.name, url, title, pages, endingMent:[],
            listStyle, options
        })
    
        const success = await form.save()
        if(success){
            res.json({code: 200, msg: '설문지 생성 완료'})
        }else{
            res.json({code: 401, msg: '설문지 생성 실패'})
        }
    }
}))

// 설문지 편집데이터 저장
router.post('/edit', isAuth, expressAsyncHandler( async(req, res, next) => {
    const {url, title, pages, endingMent, listStyle, options} = req.body

    const form = await Form.findOne({author: req.user.name, url})
    if(form){
        form.pages = [...pages]
        form.title = title
        form.endingMent = {...endingMent}
        form.lastModifiedAt = dayjs()
        form.listStyle = listStyle
        form.options = options
        const success = await form.save()
        if(success){
            res.json({code: 200, msg: '업데이트 성공'})
        }else{
            res.json({code: 400, msg: '업데이트 실패'})
        }
    }else{
        // 비로그인에서 생성후 로그인 후 저장하는 경우
        const newForm = new Form({
            author: req.user.name, url, title, pages, endingMent:[],
            listStyle, options
        })

        const success = await newForm.save()
        if(success){
            res.json({code: 200, msg: '새로운 설문지가 생성되었습니다.'})
        }else{
            res.json({code: 400, msg: '유효한 설문지가 아닙니다.'})
        }

    }
}))

// 내 설문지 불러오기
router.post('/my-form/load', isAuth, expressAsyncHandler( async (req, res, next) => {
    const forms = await Form.find({ author : req.user.name })
    if(forms){
        res.json({code: 200, msg: '설문지 전송', forms})
    }else{
        res.json({code: 404, msg: '설문지를 찾을수 없어요'})
    }
}))

// 설문지 복사
router.post('/my-form/copy', isAuth, expressAsyncHandler( async (req, res, next) => {
    const form = await Form.findOne({ author : req.user.name, url : req.body.url })
    let url = randomUrl(10)
    url = await urlChecker(url)

    if(form){
        const {author, coWorkers, title, pages, endingMent, isPublic} = form
        const copyForm = new Form({
            author, coWorkers, title : title+'(사본)', pages, endingMent, isPublic, 
            url, createdAt : dayjs(), lastModifiedAt: dayjs()
        })
        
        const success = await copyForm.save()
        if(success){
            res.json({code: 200, msg: '설문지 복사 성공'})
        }else{
            res.json({code: 400, msg: '설문지 복사 실패'})
        }
    }else{
        res.json({code: 404, msg: '복사할 설문지를 찾을 수 없어요'})
    }

}))

// 내 설문지 삭제
router.post('/my-form/delete', isAuth, expressAsyncHandler( async (req, res, next) => {
    const form = await Form.findOneAndDelete({ author : req.user.name, url : req.body.url })
    if(form){
        res.json({code: 200, msg: '설문지 삭제 완료'})
    }else{
        res.json({code: 400, msg: '설문지 삭제 실패'})
    }

}))


// 공개된 전체 설문지 불러오기
router.get('/all-forms', expressAsyncHandler( async(req, res, next) => {
    // 공개 설정, 게시 체크
    const forms = await Form.find({'options.isPublic' : true, 'options.isOpen': true})
    if(forms){
        res.json({code: 200, msg: '설문지 전체 전송 성공', forms})
    }else{
        res.json({code: 400, msg: '설문지 전체 전송 실패'})
    }
}))

router.post('/submit-form', hasToken, expressAsyncHandler( async(req, res, next) => {
    const { url } = req.query // 쿼리 파라미터에서 url 값 추출
    const userInfo = req.user

    if (!url) {
        return res.status(400).json({ code: 400, msg: 'URL 쿼리 파라미터가 필요합니다.' })
    }

    const form = await Form.findOne({ url })

    if (!form) {
        return res.status(404).json({ code: 404, msg: '설문지를 찾을 수 없습니다.' })
    }

    if(form.options?.isNeedLogin){ // 로그인 필수인 경우
        if(!userInfo) return res.status(401).json({code: 401, msg: '로그인 후 이용 가능합니다.'})
    }
    
    if(form.options?.isEnd){
        return res.status(403).json({code: 403, msg: '종료된 설문지 입니다.'})
    }

    if(userInfo){
        const alreadySubmitted = await Answer.findOne({ url, userId: userInfo.userId })
    
        if(alreadySubmitted){ // 설문지 수정 가능?
            if(!form.options.isAllowModify){
                return res.status(403).json({code: 403, msg: '이미 제출된 설문지 입니다.\n(수정이 불가능한 설문지 입니다.)'})
            }else{
                return res.status(200).json({code: 200, msg: '설문지 전송 완료', form, submittedAnswer : alreadySubmitted.answers})
            }
        }
    }

    const {startDate, endDate} = form.options
    if(startDate && dayjs(startDate).isAfter(dayjs())){
        return res.status(403).json({ code: 403, msg: '참여할 수 있는 기간이 아닙니다.'})
    }
    if(endDate && dayjs(endDate).isBefore(dayjs())){
        return res.status(403).json({ code: 403, msg: '종료된 설문지입니다.'})
    }
    
    // 인원 체크
    const maxCount = form.options?.maximumCount || 10000
    if (form.numberOfResponses.length >= maxCount) {
        return res.status(403).json({ code: 403, msg: '참여인원을 초과하였습니다.' })
    }

    return res.status(200).json({ code: 200, msg: '설문지 전송 완료', form })
    
}))

router.post('/question/save', isAuth, expressAsyncHandler( async(req, res, next) => {
    const {id, q, description, type, options, hasExtraOption, } = req.body

    const question = new Question({
        id, author: req.user.name, q, description, type, options, hasExtraOption
    })

    if(question){
        const success = await question.save()
        if(success){
            res.json({code: 200, msg: '질문 등록 완료'})
        }else{
            res.json({code: 401, msg: '질문 등록 실패'})
        }
    }
}))

router.post('/question/load', isAuth, expressAsyncHandler( async(req, res, next) => {
    const questions = await Question.find({author : req.user.name})

    if(questions){
        res.status(200).json({code: 200, msg: '질문 전송', questions})
    }else{
        res.status(404).json({code: 404, msg: '질문을 찾을 수 없어요.'})
    }
}))

module.exports = router