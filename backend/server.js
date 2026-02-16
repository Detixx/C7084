require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

const telefonokRouter = require('./routes/telefonok')
app.use('/api/telefonok', telefonokRouter)

app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }))

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ success: false, error: "Szerver hiba" })
})

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
    console.log(`API endpoint: http://localhost:${PORT}/api/telefonok`)
})

server.on('error', (err) => {
    console.error('Szerver hiba:', err.message)
    process.exit(1)
})

// Ha a process váratlanul kilépne, legalább látszik a konzolon
process.on('exit', (code) => {
    if (code !== 0 && code !== 1) console.log('Process kilépés, kód:', code)
})