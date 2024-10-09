const express = require('express')
const User = require('../models/User')
const Form = require('../models/Form')
const expressAsyncHandler = require('express-async-handler')
const { isAuth } = require('../../auth')
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
        res.json({code: 400, msg: '유효한 설문지가 아닙니다.'})
    }
}))

router.post('/my-form/load', isAuth, expressAsyncHandler( async (req, res, next) => {
    const forms = await Form.find({ author : req.user.name })
    if(forms){
        res.json({code: 200, msg: '설문지 전송', forms})
    }else{
        res.json({code: 404, msg: '설문지를 찾을수 없어요'})
    }
}))

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

router.post('/my-form/delete', isAuth, expressAsyncHandler( async (req, res, next) => {
    const form = await Form.findOneAndDelete({ author : req.user.name, url : req.body.url })
    if(form){
        res.json({code: 200, msg: '설문지 삭제 완료'})
    }else{
        res.json({code: 400, msg: '설문지 삭제 실패'})
    }

}))

router.get('/all-forms', expressAsyncHandler( async(req, res, next) => {
    const forms = await Form.find({'options.isPublic' : true, 'options.isOpen': true})
    if(forms){
        res.json({code: 200, msg: '설문지 전체 전송 성공', forms})
    }else{
        res.json({code: 400, msg: '설문지 전체 전송 실패'})
    }
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
        res.json({code: 200, msg: '질문 전송', questions})
    }else{
        res.json({code: 404, msg: '질문을 찾을 수 없어요.'})
    }
}))

module.exports = router