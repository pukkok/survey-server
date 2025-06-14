const express = require('express')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const expressAsyncHandler = require('express-async-handler')
const dayjs = require('dayjs')
const config = require('../config')

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
            subject : 'FormTok 인증 코드입니다.',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
                <h2 style="color: #7E37ED;">FormTok OTP 인증</h2>
                <p style="font-size: 16px;">안녕하세요,</p>
                <p style="font-size: 16px;">FormTok 서비스의 본인 인증을 위해 아래의 OTP 코드를 입력해 주세요.</p>
                <div style="text-align: center; padding: 20px; background-color: white; border-radius: 8px;">
                    <span style="font-size: 24px; font-weight: bold; color: #7E37ED;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">
                    이 코드는 5분간 유효합니다. 만약 본인이 요청하지 않은 경우, 해당 이메일로 회신 부탁드립니다.
                </p>
                <p style="font-size: 16px;">감사합니다,<br/>FormTok</p>
            </div>
        `
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
      return res.json({ code: 400, msg: '유효하지 않은 이메일 입니다.' })
    }
  
    const { otp: storedOtp, expiresIn } = otpStore[email]
  
    // OTP 만료 확인
    if (dayjs() > expiresIn) {
      delete otpStore[email] // 만료된 OTP 삭제
      return res.json({ code: 400, msg: '기간이 만료되었습니다.' })
    }
  
    // OTP 일치 확인
    if (storedOtp === Number(otp)) {
      delete otpStore[email] // 성공 시 OTP 삭제
      return res.json({ code: 200, msg: '유효한 OTP 입니다.' })
    }
  
    return res.json({ code: 400, msg: '유효하지 않은 OTP 입니다.' })
  })
  
  module.exports = router