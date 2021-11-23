module.exports = {
    root: true,
    env: {
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
        "brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
        "comma-spacing": "error",
        "comma-style": "error",
        "curly": ["error", "multi-or-nest", "consistent"],
        "dot-location": ["error", "property"],
        "handle-callback-err": "off",
        "indent": ["error"],
        "no-empty-function": "error",
        "no-floating-decimal": "error",
        "no-inline-comments": "error",
        "no-lonely-if": "error",
        "no-multi-spaces": "error",
        "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1, "maxBOF": 0 }],
        "no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
        "no-trailing-spaces": ["error"],
        "no-unused-vars": ["warn"],
        "no-var": "error",
        "object-curly-spacing": ["error", "always"],
        "prefer-const": "error",
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "space-before-blocks": "error",
        "space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
        }],
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": "error",
        "yoda": "error"
    }
};
