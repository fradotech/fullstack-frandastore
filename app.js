const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

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

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token, 'franda20012021.01082000.20052003')

        req.user = decode
        next()
    }
    catch(err) {
        res.json({
            message: err
        })
    }
}

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
    })
})

app.post('/login', (req, res) => {
    let email = req.body.email
    let password = req.body.password

    User.findOne({email: email})
    .then(user => {
        if(user){
            if(password === user.password){
                let token = jwt.sign({name: user.name}, 'franda20012021.01082000.20052003', {expiresIn: '24h'})
                res.json({
                    message: 'Login success',
                    token: token
                })
            }else{
                res.json({
                    message: 'Lupa Password? Coba lagi! Atau chat 085895004066 untuk tanya password',
                })
            }
        }else{
            res.json({
                message: 'Email salah. Coba lagi!',
            })
        }
    })
})

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.post('/register', (req, res) => {
    const emailSudahDaftar = User.findOne({email: req.body.email})
    if(emailSudahDaftar) return res.status(400).json({
        message: 'Email sudah terdaftar, silakan login'
    })

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

app.get('/reseller/ff-menu', auth, (req, res) => {
    res.render('reseller-ff-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/reseller/ml-menu', auth, (req, res) => {
    res.render('reseller-ml-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.listen(port, () => {
    console.log(`Point Count App | Listening at http://127.0.0.1:${port}`)
})