const path = require('path');
const simpleGit = require('simple-git');
const { ESLint } = require('eslint');
const { getAllJsFiles } = require('../Utilities/helper');
const fs = require('fs');

const git = simpleGit();

// Function to clone the repository using Git via child_process
const cloneRepo = async (req, res, next) => {
    const { repoUrl } = req.body;
    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    const repoName = path.basename(repoUrl).replace('.git', '');
    const clonePath = path.resolve(__dirname, '..', 'repos', repoName);

    try {
        await git.clone(repoUrl, clonePath);
        req.repoName = repoName;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to clone repository.' });
    }
};

const review = async (req, res) => {
    const { repoName } = req;

    if (!repoName) {
        return res.status(400).json({ error: 'Repository Name is required' });
    }


    const clonePath = path.resolve(__dirname, '..', 'repos', repoName); // Getting the path of the cloned repo from local


    try {
        // Ensure that the repo has been cloned and files exist
        const filesInRepo = fs.readdirSync(clonePath);
        if (filesInRepo.length === 0) {
            throw new Error('No files found in cloned repository.');
        }

        // Run ESLint after cloning
        try {
            const eslint = new ESLint({
                fix: false,
                overrideConfigFile: path.join(__dirname, '..', 'eslint.config.js'),
            });

            // Fetch JS files to lint
            const jsFiles = getAllJsFiles(clonePath);
            if (jsFiles.length === 0) {
                throw new Error('No JS files found in the repository.');
            }
           
            const reviewResults = {};

            const lintResults = await eslint.lintFiles(jsFiles); // Lint all files at once
            lintResults.forEach(result => {
                reviewResults[result.filePath] = {
                    messages: result.messages,
                    errorCount: result.errorCount,
                    warningCount: result.warningCount,
                };
            });
            res.status(200).json(reviewResults);
        } catch (eslintError) {
            console.error('ESLint error:', eslintError);
            res.status(500).json({ error: 'An error occurred while reviewing the code.' });
        }
    } catch (error) {
        console.error(`Failed to clone repository or process the code: ${error.message || error}`);
        res.status(500).json({ error: `Failed to clone repository or process the code: ${error.message || error}` });
    }
};


// // Function to review the repository's JavaScript files using ESLint
// const reviewRepo = async (req, res) => {
//     const { repoUrl } = req.body;

//     const repoName = path.basename(repoUrl).replace('.git', '');
//     const clonePath = path.resolve(__dirname, '..', 'repos', repoName);

//     try {
//         const eslint = new ESLint({ fix: false });

//         // Get all JavaScript files for linting
//         const jsFiles = getAllJsFiles(clonePath);
//         if (jsFiles.length === 0) {
//             return res.status(404).json({ error: 'No JavaScript files found in the repository.' });
//         }

//         const reviewResults = [];

//         // Lint all files and accumulate results
//         for (const file of jsFiles) {
//             const results = await eslint.lintFiles([file]);
//             results.forEach(result => {
//                 reviewResults.push({
//                     filePath: result.filePath,
//                     messages: result.messages,
//                     errorCount: result.errorCount,
//                     warningCount: result.warningCount,
//                 });
//             });
//         }

//         // Send all results as a single array
//         console.log('Review results:', reviewResults);
//         res.json(reviewResults);
//     } catch (error) {
//         console.error('ESLint error:', error);
//         res.status(500).json({ error: 'An error occurred while reviewing the code.' });
//     }
// };

module.exports = { cloneRepo, review };



