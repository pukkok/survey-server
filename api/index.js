require('module-alias/register')  // ✅ 반드시 맨 위에 있어야 함

const app = require('@/app')
const PORT = 8080

app.listen(PORT, () => {
    console.log(`${PORT}번 연결`)
})

module.exports = app