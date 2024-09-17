const express = require('express')
const User = require('../models/User')
const expressAsyncHandler = require('express-async-handler')
const { validateUserId, validateUserPassword, validateUserPhone, validateUserEmail } = require('../../validator')
const { validationResult } = require('express-validator')
const { generateToken, isAdmin, isAuth } = require('../../auth')

const router = express.Router()

// 회원가입
router.post('/join', [
    validateUserId(),
    validateUserPassword(),
    validateUserPhone(),
    validateUserEmail()
],  
expressAsyncHandler( async(req, res, next) => {
    const errs = validationResult(req)
    if(!errs.isEmpty()){
        return res.json({
            code: 400,
            msg: errs.array()[0].msg,
            err: errs.array()
        })
    }else{
        const dupUser = await User.findOne({userId : req.body.userId})
        if(dupUser){
            return res.json({code: 401, msg: '이미 존재하는 아이디입니다.'})
        }else{
            const {name, email, phone, userId, password} = req.body
    
            const user = new User({
                name, email, phone, userId, password
            })
        
            const success = await user.save()
            if(success){
                res.json({code: 200, msg: '회원가입 완료'})
            }else{
                res.json({code: 401, msg: '회원가입 실패'})
            }
        }
    }
}))

// 아이디 중복확인 처리
router.post('/join/id-check', validateUserId(), expressAsyncHandler( async(req, res, next) => {
    const errs = validationResult(req)
    if(!errs.isEmpty()){
        res.json({
            code: 400,
            msg: errs.array()[0].msg,
            err: errs.array()
        })
    }else{
        const user = await User.findOne({userId : req.body.userId})
        if(user){
            res.json({code: 401, msg: '이미 존재하는 아이디입니다.'})
        }else{
            res.json({code: 200, msg: '사용 가능한 아이디입니다.'})
        }
    }
}))

// 로그인
router.post('/login',
expressAsyncHandler( async(req, res, next) => {
    const loginUser = await User.findOne({
        userId: req.body.userId,
        password: req.body.password
    })

    if(!loginUser){
        res.json({ code: 401, msg: '아이디나 비밀번호를 확인해주세요'})
    }else{
        const { name, email, userId, createdAt } = loginUser
        res.json({
            code: 200,
            msg: '로그인 완료',
            data : {name, email, userId, createdAt, token: generateToken(loginUser)}
        })
    }
})
)

module.exports = router