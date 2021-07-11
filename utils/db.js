const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://fradojr:frado007@cluster0.sfoui.mongodb.net/frandastore?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})