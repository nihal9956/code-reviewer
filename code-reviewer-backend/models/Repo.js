const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    name: String,
    url: String,
    insights: [
        {
            reviewText: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
});

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;