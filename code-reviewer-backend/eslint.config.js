module.exports = [
    {
        // Specify which files this config applies to
        files: ['**/*.js'],
        
        // Use modern language options (equivalent of `env` and `parserOptions`)
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
        },

        // Define your custom rules
        rules: {
            'no-console': 'off',
            'no-unused-vars': 'warn',
            'eqeqeq': 'error',
            // Add any other custom rules here
        },
    }
];
