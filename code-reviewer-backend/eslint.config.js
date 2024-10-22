module.exports = [
    {
        // Specify which files this config applies to
        files: ['**/*.js'],

        // Use modern language options
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
        },

        // Define your custom rules
        rules: {
            // Basic best practices
            'no-console': 'off', // Allow console logs (useful for debugging, but could turn 'warn' for production)
            'no-unused-vars': 'warn', // Warn for unused variables
            'eqeqeq': 'error', // Enforce strict equality

            // Advanced rules for clean and performant code
            'no-var': 'error', // Disallow `var`, prefer `let` or `const`
            'prefer-const': 'error', // Prefer `const` when a variable is not reassigned
            'no-const-assign': 'error', // Disallow reassignment of `const` variables
            'prefer-arrow-callback': 'error', // Prefer arrow functions as callbacks
            'no-magic-numbers': ['warn', { 'ignore': [0, 1], 'enforceConst': true }], // Avoid magic numbers in your code
            'complexity': ['warn', { 'max': 10 }], // Warn when code complexity exceeds 10
            'max-depth': ['warn', 4], // Warn when blocks are nested more than 4 levels deep
            'max-len': ['error', { 'code': 100 }], // Enforce a max line length of 100 characters
            'no-nested-ternary': 'error', // Disallow nested ternary operators
            'no-restricted-syntax': [
                'error',
                'ForInStatement',
                'WithStatement',
            ], // Disallow certain syntax (e.g., `for-in` and `with`)

            // Code formatting and readability
            'indent': ['error', 2, { 'SwitchCase': 1 }], // Enforce 2-space indentation, with special handling for switch cases
            'semi': ['error', 'always'], // Require semicolons at the end of statements
            'quotes': ['error', 'single', { 'avoidEscape': true }], // Enforce single quotes, allow escape for avoiding double quotes
            'comma-dangle': ['error', 'always-multiline'], // Require trailing commas in multiline objects and arrays
            'object-curly-spacing': ['error', 'always'], // Enforce consistent spacing inside braces

            // Help avoid errors and potential bugs
            'no-implicit-globals': 'error', // Disallow variables and functions in the global scope
            'no-prototype-builtins': 'error', // Avoid calling built-in methods directly on object prototypes
            'consistent-return': 'error', // Require consistent return statements (with or without a value)
            'no-await-in-loop': 'error', // Disallow `await` in loops, as it may cause performance issues
            'no-unsafe-optional-chaining': 'error', // Disallow using optional chaining (`?.`) in an unsafe way
            'no-shadow': ['error', { 'hoist': 'all' }], // Disallow variable declarations from shadowing variables in the outer scope

            // Performance improvements and memory management
            'no-loop-func': 'error', // Disallow functions inside loops to prevent unexpected behavior
            'no-new': 'error', // Disallow `new` for side effects (only allow it when assigning to a variable)
            'prefer-spread': 'error', // Prefer the use of the spread operator (`...`) over `apply()`
            'prefer-rest-params': 'error', // Use rest parameters (`...args`) instead of `arguments`

            // ECMAScript 6+ features
            'no-useless-constructor': 'error', // Disallow unnecessary constructors in classes
            'no-duplicate-imports': 'error', // Disallow importing the same module more than once
            'no-useless-rename': 'error', // Disallow renaming import, export, and destructured assignments to the same name
        },
    }
];
