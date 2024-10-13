const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv");

const PORT = 5000;
const app = express();
dotenv.config();
const mongoURI = process.env.MONGODB_URI
app.get('/',(req,res)=>{
    res.send('hello world');
})

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`)
})



mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('MongoDB connected successfully!');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });

    const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Listen for successful connection
db.once('open', () => {
  console.log('MongoDB connected successfully!');
});

// Optional: Handle disconnected or reconnecting events
db.on('disconnected', () => {
  console.log('MongoDB disconnected.');
});

db.on('reconnected', () => {
  console.log('MongoDB reconnected.');
});