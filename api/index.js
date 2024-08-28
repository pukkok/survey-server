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

app.get('/', (req, res, next) => {
    res.json({code: 200, msg: '서버 동작 확인'})
})

app.get('/user', expressAsyncHandler( async (req, res, next) => {
    const user = await User.findOne({name: '서민석'})
    if(user){
        res.json({code: 200, msg: user})
    }else{
        res.json({code: 400, msg: '파일 전송 실패'})
    }
}))

app.listen(port, () => {
    console.log(`${port}번 연결`)
})