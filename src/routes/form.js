const express = require('express')
const User = require('../models/User')
const Form = require('../models/Form')
const expressAsyncHandler = require('express-async-handler')
const { isAuth } = require('../../auth')
const Question = require('../models/Question')

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

router.post('/create', isAuth, expressAsyncHandler( async(req, res, next) => {
    // const urlCheck = await Form.findOne({url: req.body.url})
    let url = req.body.url
    url = await urlChecker(url)
    if(url){
        const {title, pages} = req.body

        const form = new Form({
            author: req.user.name, url, title, pages
        })
    
        const success = await form.save()
        if(success){
            res.json({code: 200, msg: '설문지 저장 완료'})
        }else{
            res.json({code: 401, msg: '설문지 생성 실패'})
        }
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

router.get('/form', expressAsyncHandler( async(req, res, next) => {
    
}))

router.post('/question/save', isAuth, expressAsyncHandler( async(req, res, next) => {
    const {id, q, description, type, options, hasExtraOption} = req.body

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