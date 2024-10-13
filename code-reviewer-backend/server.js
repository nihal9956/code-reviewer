const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connection = mongoose.createConnection(process.env.MONGO_URI);
connection.on('connected', () => {
    console.log('Connected To MongoDB Atlas!')
})
connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

app.listen(5000, () => {
    console.log('server running on port 5000.')
})