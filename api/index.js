const app = require('../src/app') // ⬅ alias 대신 상대경로

const PORT = 8080

app.listen(PORT, () => {
    console.log(`${PORT}번 연결`)
})

// module.exports = app