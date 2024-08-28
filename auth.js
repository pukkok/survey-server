const dotenv = require('./dotenv')
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({ // 토큰 생성
        _id: user._id,
        name: user.name,
        userId: user.userId,
        createdAt: user.createdAt,
    },
    dotenv.JWT_SECRET, // 비밀키
    {
        expiresIn: '3h', // 토큰 만료 시간
        issuer: '푹곡좌'
    }
    )
}

const isAuth = (req, res, next) => {
    const bearerToken = req.headers.authorization // 요청 헤더의 Authorization
    if(!bearerToken){
        return res.status(401).json({ code: 401, msg: '토큰이 없습니다.'})
    }else{
        const token = bearerToken.slice(7, bearerToken.length)
        jwt.verify(token, dotenv.JWT_SECRET, (err, userInfo) => {
            if(err && err.name === 'TokenExpiredError'){
                return res.status(419).json({code: 419, msg: '토큰이 만료되었습니다.'})
            }else if(err){
                return res.status(401).json({code: 401, msg: '유효한 토큰이 아닙니다.'})
            }
            req.user = userInfo
            next()
        })
    }
}

const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        next()
    }else{
        return res.status(401)
        .json({ code: 401, msg: '당신은 관리자가 아니었습니다!'})
    }
}

module.exports = {
    generateToken,
    isAuth,
    isAdmin
}