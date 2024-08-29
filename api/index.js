const express = require('express')
const app = express()
const port = 5000

const expressAsyncHandler = require('express-async-handler')

const mongoose = require('mongoose')
const dotenv = require('../dotenv')
mongoose.connect(dotenv.MONGO_URI)
.then(()=> console.log('데이터베이스 연결 완료'))
.catch((err) => console.log(`데이터베이스 연결 실패 : ${err}`))

const User = require('../src/models/User')
// cors설정
const cors = require('cors')
const corsOptions = {
    origin: '*',
    credentials: true
}
app.use(cors(corsOptions))

//로그 설정
const logger = require('morgan')
app.use(logger('tiny'))
/** 필수!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 */
app.use(express.json()) // 파싱
/** 필수!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 */


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

const userRouter = require('../src/routes/user')
app.use('/user', userRouter)

app.listen(port, () => {
    console.log(`${port}번 연결`)
})