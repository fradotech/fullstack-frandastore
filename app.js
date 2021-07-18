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
const date = new Date()

const bot = new TelegramBot(tokenTele, { polling: true });

var disc
let newfPay = {}
let trans = {}
let transDate = {}
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

    const getUser = User.findOne({ email: email })
        .then(getUser => {
            if (getUser) {
                if (password === getUser.password) {
                    token = jwt.sign({ email: getUser.email }, 'franda20012021.01082000.20052003', { expiresIn: '24h' })

                    res.cookie('token', token)
                    res.cookie('user', getUser)

                    res.redirect('/reseller')

                } else {
                    res.render('login', {
                        layout: 'layouts/main-layout',
                        title: 'Franda Store',
                        message: 'Password salah! Lupa password? Coba lagi! Atau chat 085895004066 untuk tanya password',
                        messageClass: 'alert-danger'
                    })
                }
            } else {
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
    let user = new User({
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
    if(disc == 'no'){
        res.render('ml-menu', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
        })
    }else{
        res.render('ml-menu-disc', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
        })
    }
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

app.get('/reseller-preview/ml-menu', (req, res) => {
    if(disc == 'no'){
        res.render('reseller-preview-ml-menu', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
        })
    }else{
        res.render('reseller-preview-ml-menu-disc', {
            layout: 'layouts/main-layout',
            title: 'Franda Store',
        })
    }
})

app.post('/transaction', (req, res) => {
    const trans = {
        id: req.body.id + (' (' + req.body.serverId + ')'),
        topup: req.body.gridRadios
    }

    res.render('transaction', {
        layout: 'layouts/main-layout',
        title: 'Franda Store',
        trans
    })
})

//Reseller Area

app.use( async (req, res, next) => {
    const token = await req.cookies['token']
    req.user = await req.cookies['user']
    if (req.user) {
        next()
    } else {
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

app.get('/reseller-ff-menu', (req, res) => {
    res.render('reseller-ff-menu', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user
    })
})

app.get('/reseller-ml-menu', (req, res) => {
    if(disc == 'no'){
        res.render('reseller-ml-menu', {
            layout: 'layouts/reseller-layout',
            title: 'Franda Store',
            user: req.user
        })
    }else{
        res.render('reseller-ml-menu-disc', {
            layout: 'layouts/reseller-layout',
            title: 'Franda Store',
            user: req.user
        })
    }
})

app.get('/profile', async (req, res) => {
    const email = req.user.email

    const getUser = await User.findOne({ email: email })
        .then(getUser => {
            res.render('profile', {
                layout: 'layouts/reseller-layout',
                title: 'Franda Store',
                user: getUser
            })
        })
})

app.post('/res-transaction', async (req, res) => {
    const ms = date.getMilliseconds()
    const s = date.getSeconds()
    const m = date.getMinutes()
    const h = date.getHours()
    const d = date.getDate()
    const mn = date.getMonth()
    const y = date.getFullYear()
    const key = Math.random()

    transDate[token] = ((key * (s * 1) + (ms * 1)) + '-' + ((h * 1) + '-' + (m * 1)) + '-' + d + mn + y)

    let id = await req.body.id
    const dm = await req.body.gridRadios
    let rp

    function hargaFF(dm) {
        if (dm == 20) {
            return rp = 3800
        } if (dm == 50) {
            return rp = 8100
        } if (dm == 70) {
            return rp = 9700
        } if (dm == 100) {
            return rp = 14900
        } if (dm == 140) {
            return rp = 19500
        } if (dm == 210) {
            return rp = 29900
        } if (dm == 355) {
            return rp = 48900
        } if (dm == 720) {
            return rp = 96900
        } if (dm == 1440) {
            return rp = 194900
        } if (dm == 2000) {
            return rp = 284900
        } if (dm == 'mingguan') {
            return rp = 29900
        } if (dm == 'bulanan') {
            return rp = 117900
        }
    }

    function hargaML(dm) {
        const newId = id + (' (' + req.body.serverId + ')')
        id = newId

        if (dm == 50) {
            return rp = 14900
        } if (dm == 85) {
            return rp = 22900
        } if (dm == 100) {
            return rp = 29100
        } if (dm == 172) {
            return rp = 41900
        } if (dm == 282) {
            return rp = 71100
        } if (dm == 366) {
            return rp = 92600
        } if (dm == 568) {
            return rp = 137800
        } if (dm == 708) {
            return rp = 174800
        } if (dm == 875) {
            return rp = 209800
        } if (dm == 966) {
            return rp = 229800
        } if (dm == 1446) {
            return rp = 339600
        } if (dm == 'starlight') {
            return rp = 135900
        }
    }

    function hargaMLdisc(dm) {
        const newId = id + (' (' + req.body.serverId + ')')
        id = newId

        if (dm == 50) {
            return rp = 14600
        } if (dm == 85) {
            return rp = 20900
        } if (dm == 100) {
            return rp = 28700
        } if (dm == 172) {
            return rp = 40200
        } if (dm == 282) {
            return rp = 69700
        } if (dm == 366) {
            return rp = 89800
        } if (dm == 568) {
            return rp = 132700
        } if (dm == 708) {
            return rp = 158800
        } if (dm == 875) {
            return rp = 198900
        } if (dm == 966) {
            return rp = 215400
        } if (dm == 1446) {
            return rp = 317600
        } if (dm == 'starlight') {
            return rp = 124800
        }
    }

    if(req.body.game == 'Free Fire') hargaFF(dm)
    if(req.body.game == 'Mobile Legends') hargaML(dm)
    if(req.body.game == 'Mobile Legends Diskon') hargaMLdisc(dm)

    trans[transDate[token]] = {
        game: req.body.game,
        id,
        dm,
        rp,
        date: transDate[token]
    }

    transStatus[token] = true

    res.render('res-transaction', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user,
        trans: trans[transDate[token]]
    })
})

app.post('/nota', async (req, res) => {
    if (trans[transDate[token]].date == req.body.date && transStatus[token]) {

        const trans = {
            game: req.body.game,
            id: req.body.id,
            dm: req.body.dm,
            rp: req.body.rp,
            date: req.body.date
        }

        const email = await req.user.email
        const fPay = await req.body.rp

        const getUser = await User.findOne({ email: email })
        .then (async getUser => {
            if (getUser) {
                if (getUser.fPay < fPay) {

                    res.render('nota', {
                        layout: 'layouts/reseller-layout',
                        title: 'Franda Store',
                        message: 'Transaksi Gagal! Saldo tidak cukup, silakan isi saldo!',
                        messageClass: 'alert-danger',
                        user: getUser,
                        trans
                    })

                } else {
                    newfPay[trans] = getUser.fPay - fPay * 1

                    const franda = await User.findOne({ email: 'frandatech@gmail.com' })
                    .then(franda => {

                        const frandaFPay = franda.fPay + fPay * 1

                        User.updateOne(
                            { email: 'frandatech@gmail.com' },
                            {
                                $set: {
                                    fPay: frandaFPay
                                }
                            }
                        ).then((result) => {
                            User.updateOne(
                                { email },
                                {
                                    $set: {
                                        fPay: newfPay[trans]
                                    }
                                }
                            ).then((result) => {
        
                                const order = 
                                `
${getUser.name}
${getUser.email}
${getUser.fPay}
----------------------------------------------------
${frandaFPay}
----------------------------------------------------
${trans.game}
${trans.date}
${trans.dm} DM
Rp ${trans.rp}

${trans.id}
        
                                `
                                const fradoId = '895958227'
                                bot.sendMessage(fradoId, order)
        
                                const dindaId = '1805691857'
                                bot.sendMessage(dindaId, order)
        
                                transStatus[token] = false
        
                                res.render('nota', {
                                    layout: 'layouts/reseller-layout',
                                    title: 'Franda Store',
                                    message: 'Transaksi Berhasil!',
                                    messageClass: 'alert-success',
                                    user: getUser,
                                    trans
                                })
                            })
                        })
                    })
                }
            } else {
                const trans = {
                    game: req.body.game,
                    id: req.body.id,
                    dm: req.body.dm,
                    rp: req.body.rp,
                    date: req.body.date
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
    } else {
        const trans = {
            game: req.body.game,
            id: req.body.id,
            dm: req.body.dm,
            rp: req.body.rp,
            date: req.body.date
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
        res.cookie(prop, '', { expires: new Date(0) })
    }
    res.redirect('/')
})

app.use((req, res, next) => {
    if (req.user.email == 'frandatech@gmail.com' && req.user._id == '60ec0639d271804953db5efe') {
        next()
    } else {
        res.redirect('/logout')
    }
})

app.get('/cuma-Dinda-Cantik-yangbisamasuk', (req, res) => {
    res.render('cuma-Dinda-Cantik-yangbisamasuk', {
        layout: 'layouts/reseller-layout',
        title: 'Franda Store',
        user: req.user,
        message: '',
        messageClass: '',
        disc
    })
})

app.post('/cuma-Dinda-Cantik-yangbisamasuk', async (req, res) => {
    const email = req.body.email
    const fPay = req.body.fPay
    const minfPay = req.body.minfPay
    disc = req.body.disc

    const getUser = await User.findOne({ email })
        .then( async getUser => {
            if (getUser) {
                let newfPay = (getUser.fPay + fPay * 1) - (minfPay * 1)

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
                        message: `Berhasil tambah saldo. ${getUser.fPay} + ${fPay} - ${minfPay} = ${newfPay}`,
                        messageClass: 'alert-success',
                        disc
                    })
                })

            } else {
                res.render('cuma-Dinda-Cantik-yangbisamasuk', {
                    layout: 'layouts/reseller-layout',
                    title: 'Franda Store',
                    user: req.user,
                    message: 'Email e salah sayangg :3',
                    messageClass: 'alert-danger',
                    disc
                })
            }
        })
})

app.listen(port)