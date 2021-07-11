const mongoose = require('mongoose')

const User = mongoose.model('User', {
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    fPay: {
        type: Number,
    },
})

module.exports = User