const app = require('../src/app')

const PORT = 8080

app.listen(PORT, () => {
    console.log(`${PORT}번 연결`)
})

// module.exports = app