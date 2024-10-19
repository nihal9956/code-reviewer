const fs = require('fs');
const path = require('path');
const getAllJsFiles = (dir) => {
    let results = [];

    // Read the contents of the directory
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        // Check if the current file is a directory
        if (fs.statSync(filePath).isDirectory()) {
            // Recursively call this function for the directory
            results = results.concat(getAllJsFiles(filePath));
        } else if (file.endsWith('.js')) {
            // If it's a .js file, add it to the results
            results.push(filePath);
        }
    });

    return results;
};

module.exports = {
    getAllJsFiles
}