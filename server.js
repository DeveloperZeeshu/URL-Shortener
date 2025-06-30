import express from 'express'
import router from './routes/shortener.routes.js'

const app = express()

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(router)

app.set('view engine', 'ejs')

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running at ${PORT} port...`))

