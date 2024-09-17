const express = require('express')
const User = require('../models/User')
const Form = require('../models/Form')
const expressAsyncHandler = require('express-async-handler')
const { isAuth } = require('../../auth')

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

router.get('/download', expressAsyncHandler( async(req, res, next) => {
    
}))

module.exports = router