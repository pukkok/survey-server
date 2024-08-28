const express = require('express')
const app = express()
const port = 5000

const expressAsyncHandler = require('express-async-handler')

const mongoose = require('mongoose')
const dotenv = require('../dotenv')
mongoose.connect(dotenv.MONGO_URI)
.then(()=> console.log('데이터베이스 연결 완료'))
.catch((err) => console.log(`데이터베이스 연결 실패 : ${err}`))

const cors = require('cors')
const User = require('../src/models/User')
const corsOptions = {
    origin: '*',
    credentials: true
}
app.use(cors(corsOptions))

/** 필수!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 */
app.use(express.json()) // 파싱
/** 필수!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11 */


app.get('/', (req, res, next) => {
    res.json({code: 200, msg: '서버 동작 확인'})
})

const userRouter = require('../src/routes/user')
app.use('/user', userRouter)

app.listen(port, () => {
    console.log(`${port}번 연결`)
})