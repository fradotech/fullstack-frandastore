const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

require('./utils/db')
const User = require('./model/user')

const app = express()
const port = process.env.PORT || 3000

let user
let tokenNow
let token

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

app.get('/', (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
        message: '',
        messageClass: 'alert-success'
    })
})

app.post('/login', (req, res) => {
    let email = req.body.email
    let password = req.body.password

    const getUser = User.findOne({email: email})
    .then(getUser => {
        if(getUser){
            if(password === getUser.password){
                token = jwt.sign({name: getUser.name}, 'franda20012021.01082000.20052003', {expiresIn: '24h'})
                res.cookie('AuthToken', token)
                user = getUser

                res.redirect('/reseller')
            }else{
                res.render('login', {
                    layout: 'layouts/main-layout',
                    title: 'Franda Store',
                    message: 'Password salah! Lupa password? Coba lagi! Atau chat 085895004066 untuk tanya password',
                    messageClass: 'alert-danger'
                })
            }
        }else{
            res.render('login', {
                    layout: 'layouts/main-layout',
                    title: 'Franda Store',
                    message: 'Email salah! Coba lagi!',
                    messageClass: 'alert-danger'
            })
        }
    })
})

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
        message: '',
        messageClass: 'alert-success'
    })
})

app.post('/register', (req, res) => {
    let user = new User ({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        fPay: 0
    })

    user.save()
    .then(user => {
        res.render('login', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
            message: 'Pendaftaran berhasil! Silakan login!',
            messageClass: 'alert-success'
        })
    })
    .catch(err => {
        res.json({
            status: 'Gagal Daftar'
        })
    })
})

app.get('/ff-menu', (req, res) => {
    res.render('ff-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/ml-menu', (req, res) => {
    res.render('ml-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

//Reseller Area

app.use((req, res, next) => {
    tokenNow = req.cookies['AuthToken']
    if(tokenNow = token){
        next()
    }else{
        res.render('login', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
            message: 'Anda perlu login reseller dahulu!',
            messageClass: 'alert-danger'
        })
    }
})

app.get('/reseller', (req, res) => {
    res.render('reseller', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user
    })
})

app.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user
    })
})

app.get('/reseller/ff-menu', (req, res) => {
    res.render('reseller-ff-menu', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user
    })
})

app.get('/reseller/ml-menu', (req, res) => {
    res.render('reseller-ml-menu', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user
    })
})

app.get('/logout', (req, res) => {
    tokenNow = ''
    res.redirect('/')
})

app.listen(port)