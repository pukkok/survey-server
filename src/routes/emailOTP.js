const express = require('express')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const expressAsyncHandler = require('express-async-handler')
const dayjs = require('dayjs')
const config = require('../../config')

const router = express.Router()

let otpStore = {}

const generateOtp = () => {
    const otp = crypto.randomInt(10000000, 99999999)
    return otp
}

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'naver', // 이메일 서비스
    host: 'smtp.naver.com',
    auth: {
      user: config.EMAIL_ID,  // 본인의 이메일
      pass: config.EMAIL_PW    // 본인의 이메일 비밀번호
    }
})

// OTP 전송 API
router.post('/send-otp', expressAsyncHandler( async (req, res, next) => {
    const email = req.body.email

    // OTP 생성 및 저장
    const otp = generateOtp()
    otpStore[email] = {
        otp,
        expiresIn : dayjs() + 1000 * 60 * 5
    }

    // 이메일 전송
    try{
        await transporter.sendMail({
            from: `"Form OTP" <${config.EMAIL_ID}>`,
            to : email,
            subject : 'FormTok OTP Code',
            text : `OTP 코드: ${otp}`
        })

        res.json({ code: 200, msg: 'OTP 전송 성공'})
    }catch (error){
        res.json({ code: 500, msg: 'OTP 전송 실패', error: error})
    }

}))

// OTP 인증 API
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body
  
    // OTP 유효성 검사
    if (!otpStore[email]) {
      return res.status(400).json({ message: 'Invalid email' });
    }
  
    const { otp: storedOtp, expiresIn } = otpStore[email];
  
    // OTP 만료 확인
    if (dayjs() > expiresIn) {
      delete otpStore[email]; // 만료된 OTP 삭제
      return res.status(400).json({ message: 'OTP has expired' });
    }
  
    // OTP 일치 확인
    if (storedOtp === Number(otp)) {
      delete otpStore[email] // 성공 시 OTP 삭제
      return res.status(200).json({ message: '유효한 OTP 입니다.' });
    }
  
    return res.status(400).json({ message: 'Invalid OTP' });
  })
  
  module.exports = router