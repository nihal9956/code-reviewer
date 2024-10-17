const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { ESLint } = require('eslint')
const express = require("express")
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
dotenv.config();
app.use(express.json());
const defaultEslintConfigPath = path.join(__dirname, '.eslintrc.json');
const defaultEslintConfig = JSON.parse(fs.readFileSync(defaultEslintConfigPath, 'utf-8'));
async function analyzeCode(repoPath ) {
    const eslintConfigPath = path.join(repoPath, '.eslintrc.json');

    let eslintCommand;

    // Check if the repository has its own ESLint config
    if (fs.existsSync(eslintConfigPath)) {
        eslintCommand = `eslint "${repoPath}/**/*.js"`;
    } else {
        // Create a temporary ESLint config file from the default config
        const tempEslintConfigPath = path.join(repoPath, 'temp-eslint-config.json');
        fs.writeFileSync(tempEslintConfigPath, JSON.stringify(defaultEslintConfig));

        // Use the temporary config
        eslintCommand = `eslint -c ${tempEslintConfigPath} "${repoPath}/**/*.js"`;
    }

    exec(eslintCommand, (err, stdout, stderr) => {
        if (err) {
            console.error('Error running ESLint:', stderr);
            return;
        }
        console.log(`ESLint analysis for:`, stdout);
    });
}
// Establish MongoDB connection using mongoose.connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas!');
}).catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
    process.exit(1); // Exit process if connection fails
});

analyzeCode('cmec-smtm')

app.listen(5000, () => {
    console.log('server running on port 5000.')
})