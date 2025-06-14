require('module-alias')

const express = require('express')
const app = express()

const userRouter = require('@/routes/user')
const formRouter = require('@/routes/form')
const OTPRouter = require('@/routes/emailOTP')
const answerRouter = require('@/routes/answer')
const { isAuth, generateToken } = require('@/auth')

const mongoose = require('mongoose')
const config = require('@/config')

mongoose.connect(config.MONGODB_URI)
.then(()=> console.log('데이터베이스 연결 완료'))
.catch((err) => console.log(`데이터베이스 연결 실패 : ${err}`))

const cors = require('cors')
const corsOptions = {
    origin: [config.CLIENT, 'http://localhost:5454'],
    credentials: true
}
app.use('*', cors(corsOptions))

const logger = require('morgan')
app.use(logger('tiny'))

app.use(express.json())

app.post('/auth', isAuth, (req, res) => {
    if (req.user) res.json({ code: 200, msg: '토큰 있음' })
})

app.post('/refresh-token', isAuth, (req, res) => {
    try {
        const userInfo = req.user
        const newToken = generateToken(userInfo)
        return res.status(200).json({ token: newToken })
    } catch (err) {
        return res.status(500).json({ msg: "토큰 갱신 중 오류", error: err.message })
    }
})

app.use('/user', userRouter)
app.use('/form', formRouter)
app.use('/confirm', OTPRouter)
app.use('/answer', answerRouter)

app.get('/', (req, res) => {
    res.json({ code: 200, msg: '서버 동작 확인' })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ code: 500, msg: '서버 에러 발생' })
})

module.exports = app
