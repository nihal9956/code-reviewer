const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Establish MongoDB connection using mongoose.connect
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB Atlas!');
}).catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
    process.exit(1); // Exit process if connection fails
});


app.listen(5000, () => {
    console.log('server running on port 5000.')
})