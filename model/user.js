const mongoose = require('mongoose')

const User = mongoose.model('User', {
    nama: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    noHp: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    faPay: {
        type: Number,
        require: true,
    },
})

module.exports = User