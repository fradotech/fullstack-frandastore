const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { get } = require('mongoose')
const TelegramBot = require('node-telegram-bot-api')

require('./utils/db')
const User = require('./model/user')

const app = express()
const port = process.env.PORT || 3000
const tokenTele = '1732495901:AAFzAs_v_JGTqef9IS0bAtqe78cOuXu6_KQ'

const bot = new TelegramBot(tokenTele, {polling: true});

let authTokens = {}
let newfPay = {}
let transStatus = {}

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
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
                token = jwt.sign({email: getUser.email}, 'franda20012021.01082000.20052003', {expiresIn: '24h'})

                authTokens[token] = getUser
                res.cookie('token', token)
                
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

app.get('/reseller-preview', (req, res) => {
    res.render('reseller-preview', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/reseller-preview/ff-menu', (req, res) => {
    res.render('reseller-preview-ff-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.get('/reselle-previewr/ml-menu', (req, res) => {
    res.render('ml-menu', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
    })
})

app.post('/transaction', (req, res) => {
    const trans = {
        id: req.body.id,
        topup: req.body.gridRadios
    }

    res.render('transaction', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
        trans
    })
})

//Reseller Area

app.use((req, res, next) => {
    const token = req.cookies['token']
    req.user = authTokens[token]
    if (req.user) {
        next()
    }else{
        res.render('login', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
            message: 'Anda perlu login dahulu!',
            messageClass: 'alert-danger'
        })
    }
})

app.get('/reseller', (req, res) => {
    res.render('reseller', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user
    })
})

app.get('/reseller/ff-menu', (req, res) => {
    res.render('reseller-ff-menu', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user
    })
})

app.get('/reseller/ml-menu', (req, res) => {
    res.render('reseller-ml-menu', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user
    })
})

app.get('/profile', (req, res) => {
    const email = req.user.email

    const getUser = User.findOne({ email: email })
    .then(getUser => {
        res.render('profile', {
            layout: 'layouts/reseller-layout',
            title: 'Franda Store',
            user: getUser
        })
    })
})

app.post('/res-transaction', (req, res) => {
    transStatus[token] = true
    console.log(transStatus)

    const id = req.body.id
    const dm = req.body.gridRadios
    let rp

     if(dm == 20){
        rp = 3800
    }if(dm == 50){
        rp = 8100
    }if(dm == 70){
        rp = 9900
    }if(dm == 100){
        rp = 15200
    }if(dm == 140){
        rp = 19900
    }if(dm == 210){
        rp = 30600
    }if(dm == 355){
        rp = 49900
    }if(dm == 720){
        rp = 97900
    }if(dm == 1440){
        rp = 194900
    }if(dm == 2000){
        rp = 284900
    }if(dm == 'mingguan'){
        rp = 29900
    }if(dm == 'bulanan'){
        rp = 117900
    }

    const trans = {
        id,
        dm,
        rp
    }

    res.render('res-transaction', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user,
        trans
    })
})

app.post('/nota', (req, res) => {
    if (transStatus[token]) {
        const email = req.user.email
        const fPay = req.body.rp

        const getUser = User.findOne({ email: email })
        .then(getUser => {
            if(getUser){
                if(getUser.fPay < fPay){

                    res.render('nota', {
                        layout: 'layouts/reseller-layout',
                        title: 'Franda Store',
                        message: 'Transaksi Gagal! Saldo tidak cukup, silakan isi saldo!',
                        messageClass: 'alert-danger',
                        user: getUser,
                        trans
                    })

                }else{
                    transStatus[token] = false
                    newfPay[token] = getUser.fPay - fPay * 1
                
                    User.updateOne(
                        { email },
                        {
                            $set: {
                                fPay: newfPay[token]
                            }
                        }
                    ).then((result) => {

                        const trans = {
                            id: req.body.id,
                            dm: req.body.dm,
                            rp: req.body.rp
                        }

                        const order = `Reseller          ${getUser.name}
                        email: ${getUser.email}
                        Saldo: ${getUser.fPay}
                        -------------------------
                        ${trans.dm} DM
                        Rp ${trans.rp}

                        ID: ${trans.id}

                        `
                        const fradoId = '895958227'
                        bot.sendMessage(fradoId, order)

                        const dindaId = '1805691857'
                        bot.sendMessage(dindaId, order)

                        res.render('nota', {
                            layout: 'layouts/reseller-layout',
                            title: 'Franda Store',
                            message: 'Transaksi Berhasil!',
                            messageClass: 'alert-success',
                            user: getUser,
                            trans
                        })
                    })
                }

            }else{
                const trans = {
                    id: req.body.id,
                    dm: req.body.dm,
                    rp: req.body.rp
                }
                res.render('nota', {
                        layout: 'layouts/reseller-layout',
                        title: 'Franda Store',
                        message: 'Transaksi Gagal!',
                        messageClass: 'alert-danger',
                        user: getUser,
                        trans
                })
            }
        })
    }else{
        const trans = {
            id: req.body.id,
            dm: req.body.dm,
            rp: req.body.rp
        }
        res.render('nota', {
            layout: 'layouts/reseller-layout',
            title: 'Franda Store',
            message: 'Transaksi Berhasil!',
            messageClass: 'alert-success',
            user: req.user,
            trans
        })
    }
})

app.get('/isi-saldo', (req, res) => {
    res.render('isi-saldo', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user
    })
})

app.get('/logout', (req, res) => {
    cookie = req.cookies
    for (let prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue
        }
        res.cookie(prop, '', {expires: new Date(0)})
    }
    res.redirect('/')
})

app.use((req, res, next) => {
    if(req.user.email == 'frandatech@gmail.com' && req.user._id == '60ec0639d271804953db5efe'){
        next()
    }else{
        res.redirect('/logout')
    }
})

app.get('/cuma-Dinda-Cantik-yangbisamasuk', (req, res) => {
    res.render('cuma-Dinda-Cantik-yangbisamasuk', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user,
        message: '',
        messageClass: ''
    })
})

app.post('/cuma-Dinda-Cantik-yangbisamasuk', (req, res) => {
    const email = req.body.email
    const fPay = req.body.fPay

    const getUser = User.findOne({ email: email })
    .then(getUser => {
        if(getUser){
            let newfPay = getUser.fPay + fPay * 1
            
            User.updateOne(
                { email },
                {
                    $set: {
                        fPay: newfPay
                    }
                }
            ).then((result) => {
                res.render('cuma-Dinda-Cantik-yangbisamasuk', {
                    layout: 'layouts/reseller-layout',
                    title: 'Franda Store',
                    user: req.user,
                    message: `Berhasil tambah saldo. ${getUser.fPay} + ${fPay} = ${newfPay}`,
                    messageClass: 'alert-success'
                })
            })

        }else{
            res.render('cuma-Dinda-Cantik-yangbisamasuk', {
                    layout: 'layouts/reseller-layout',
                    title: 'Franda Store',
                    user: req.user,
                    message: 'Email e salah sayangg :3',
                    messageClass: 'alert-danger'
            })
        }
    })
})

app.listen(port)