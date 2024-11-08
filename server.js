// require('dotenv').config() //env
const express = require('express') //commonjs
const configViewEngine = require('./src/config/viewEngine') //commonjs
const app = express() //app express
const port = process.env.PORT || 8888// port
const hostname = process.env.HOSTNAME // hostname
const webRouter = require('./src/routes/userRoute') //router
const connection = require('./src/config/database') //connect mysql

// config template engine
configViewEngine(app)


// config req.body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// khai báo route
app.use('/', webRouter)

app.listen(port, hostname, () => {
    console.log(`Example app listening on port ${port}`)
})
