const path = require('path');
const simpleGit = require('simple-git');
const { ESLint } = require('eslint');
const { getAllJsFiles } = require('../Utilities/helper');
const fs = require('fs');

const git = simpleGit();

const review = async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    const repoName = path.basename(repoUrl).replace('.git', ''); // Extracting the repo name
    const clonePath = path.resolve(__dirname, '..', 'repos', repoName); // Getting the path of the cloned repo from local
    const CODE_FOLDER = clonePath;

    try {
        // Clone the repository
        console.log(`Cloning repository: ${repoUrl} into path: ${clonePath}`);
        await git.clone(repoUrl, clonePath);
        console.log('Repository cloned successfully.');

        // Ensure that the repo has been cloned and files exist
        const filesInRepo = fs.readdirSync(CODE_FOLDER);
        if (filesInRepo.length === 0) {
            throw new Error('No files found in cloned repository.');
        }
        console.log('Files found in repository:', filesInRepo);
        console.log('Files found in repository:', filesInRepo);

        // Run ESLint after cloning
        try {
            const eslint = new ESLint({
                fix: false,
                overrideConfigFile: path.join(__dirname, '..', 'eslint.config.js'),
            });

            // Fetch JS files to lint
            const jsFiles = getAllJsFiles(CODE_FOLDER);
            if (jsFiles.length === 0) {
                throw new Error('No JS files found in the repository.');
            }
            console.log('JavaScript files found:', jsFiles);

            const reviewResults = {};

            // Analyze each file with ESLint
            for (const file of jsFiles) {
                const results = await eslint.lintFiles([file]);
                reviewResults[file] = results.map(result => ({
                    filePath: result.filePath,
                    messages: result.messages,
                    errorCount: result.errorCount,
                    warningCount: result.warningCount,
                }));
            }

            // Send the review results as JSON response
            console.log('Review results:', reviewResults);
            res.json(reviewResults);

        } catch (eslintError) {
            console.error('ESLint error:', eslintError);
            res.status(500).json({ error: 'An error occurred while reviewing the code.' });
        }
    } catch (error) {
        console.error(`Failed to clone repository or process the code: ${error.message || error}`);
        res.status(500).json({ error: `Failed to clone repository or process the code: ${error.message || error}` });
    }
};

module.exports = {
    review,
};
