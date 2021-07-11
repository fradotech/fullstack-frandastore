const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')

require('./utils/db')
const User = require('./model/user')

const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser('secret'))
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
)

app.get('/', (req, res) =>{
    res.render('index', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/login', (req, res) =>{
    res.render('login', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/register', (req, res) =>{
    res.render('register', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/ff-menu', (req, res) =>{
    res.render('ff-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/ml-menu', (req, res) =>{
    res.render('ml-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.listen(port, () =>{
    console.log(`Point Count App | Listening at http://127.0.0.1:${port}`)
})