const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongoConnectionURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDB COnnected');

    } catch (err) {
        console.error('MongoDB COnnection Error');
        process.exit(1)
    }
}

module.exports = connectDB;