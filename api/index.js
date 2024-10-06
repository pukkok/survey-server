const express = require('express')
const app = express()
const port = 5000

const userRouter = require('../src/routes/user')
const formRouter = require('../src/routes/form')
const OTPRouter = require('../src/routes/emailOTP')
const { isAuth, generateToken } = require('../auth')

const mongoose = require('mongoose')
const config = require('../config')
mongoose.connect(config.MONGODB_URI)
.then(()=> console.log('데이터베이스 연결 완료'))
.catch((err) => console.log(`데이터베이스 연결 실패 : ${err}`))

const User = require('../src/models/User')
// cors설정
const cors = require('cors')
const corsOptions = {
    origin: [config.CLIENT, 'http://localhost:3000'],
    credentials: true
}
app.use('*', cors(corsOptions))

//로그 설정
const logger = require('morgan')

app.use(logger('tiny'))
/** 필수!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 */
app.use(express.json()) // 파싱
/** 필수!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 */
app.post('/auth', isAuth, (req, res, next) => {
    if(req.user) res.json({code: 200, msg: '토큰 있음'})
})

app.post('/refresh-token', isAuth, (req, res, next) => {
    try {
        const userInfo = req.user

        // 사용자 정보로 새 토큰 발급
        const newToken = generateToken(userInfo)

        return res.status(200).json({ token: newToken })
    } catch (err) {
        return res.status(500).json({ msg: "토큰 갱신 중 오류가 발생했습니다.", error: err.message })
    }
})

app.use('/user', userRouter)

app.use('/form', formRouter)

app.use('/confirm', OTPRouter)

app.get('/', (req, res, next) => {
    res.json({code: 200, msg: '서버 동작 확인'})
})

// 에러 발생시
// app.use((req, res, next) => {
//     res.status(404).json({ code: 404, msg: '페이지를 찾을 수 없습니다.'})
// })
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).json({ code: 500, msg: '서버 에러 발생'})
})

app.listen(port, () => {
    console.log(`${port}번 연결`)
})