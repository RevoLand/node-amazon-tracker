module.exports = {
  env: {
    'node': true,
    'es6': true,
    'jest': true
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'sourceType': 'module',
    'ecmaVersion': 2021
  },
  rules: {
    // https://eslint.org/docs/rules/indent
    'indent': [
      'warn',
      2,
      {
        'ignoreComments': true,
        'offsetTernaryExpressions': false,
        'flatTernaryExpressions': true,
        'ObjectExpression': 1,
        'ArrayExpression': 1,
        'CallExpression': { 'arguments': 'first' },
        'FunctionExpression': { 'body': 1, 'parameters': 2 },
        'FunctionDeclaration': { 'body': 1, 'parameters': 2 },
        'MemberExpression': 1,
        'SwitchCase': 1
      }
    ],
    'curly': 'error', // https://eslint.org/docs/rules/curly
    'no-new-wrappers': 'error', // https://eslint.org/docs/rules/no-new-wrappers
    'block-scoped-var': 'error', // https://eslint.org/docs/rules/block-scoped-var
    '@typescript-eslint/no-shadow': 'warn', // https://eslint.org/docs/rules/no-shadow
    'no-else-return': 'warn', // https://eslint.org/docs/rules/no-else-return
    'no-return-await': 'error', // https://eslint.org/docs/rules/no-return-await
    'no-self-compare': 'error', // https://eslint.org/docs/rules/no-self-compare
    'no-useless-concat': 'error', // https://eslint.org/docs/rules/no-useless-concat
    'no-use-before-define': 'error', // https://eslint.org/docs/rules/no-use-before-define

    /* Styling */
    'array-bracket-spacing': ['error', 'never'], // https://eslint.org/docs/rules/array-bracket-spacing
    'array-bracket-newline': ['error', 'consistent'], // https://eslint.org/docs/rules/array-bracket-newline
    'array-element-newline': ['error', 'consistent'], // https://eslint.org/docs/rules/array-element-newline
    'block-spacing': 'error', // https://eslint.org/docs/rules/block-spacing
    'brace-style': ['error', '1tbs', { allowSingleLine: true }], // https://eslint.org/docs/rules/brace-style
    'comma-spacing': ['error', { before: false, after: true }], // https://eslint.org/docs/rules/comma-spacing
    'comma-style': ['error', 'last'], // https://eslint.org/docs/rules/comma-style
    'func-call-spacing': 'error', // https://eslint.org/docs/rules/func-call-spacing
    'function-call-argument-newline': ['error', 'consistent'], // https://eslint.org/docs/rules/function-call-argument-newline
    'function-paren-newline': ['error', 'consistent'], // https://eslint.org/docs/rules/function-paren-newline
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true, 'mode': 'strict' }], // https://eslint.org/docs/rules/key-spacing
    'keyword-spacing': ['error', { 'before': true, 'after': true }], // https://eslint.org/docs/rules/keyword-spacing
    'lines-around-comment': ['error'], // https://eslint.org/docs/rules/lines-around-comment
    'lines-between-class-members': ['error'], // https://eslint.org/docs/rules/lines-between-class-members
    'multiline-ternary': ['error', 'always-multiline'], // https://eslint.org/docs/rules/multiline-ternary
    'newline-per-chained-call': ['error', { 'ignoreChainWithDepth': 3 }], // https://eslint.org/docs/rules/newline-per-chained-call
    'no-lonely-if': ['warn'], // https://eslint.org/docs/rules/no-lonely-if
    'no-mixed-operators': ['error'], // https://eslint.org/docs/rules/no-mixed-operators
    'no-multiple-empty-lines': ['error', { 'max': 2 }], // https://eslint.org/docs/rules/no-multiple-empty-lines
    'no-unneeded-ternary': ['error'], // https://eslint.org/docs/rules/no-unneeded-ternaryno-unneeded-ternary
    'object-curly-spacing': ['error', 'always'], // https://eslint.org/docs/rules/object-curly-spacing
    'operator-linebreak': ['error', 'after'], // https://eslint.org/docs/rules/operator-linebreak
    'semi-spacing': ['error'], // https://eslint.org/docs/rules/semi-spacing
    'semi-style': ['error'], // https://eslint.org/docs/rules/semi-style
    'space-before-blocks': ['error'], // https://eslint.org/docs/rules/space-before-blocks
    'space-in-parens': ['error', 'never'], // ??? https://eslint.org/docs/rules/space-in-parens
    'space-infix-ops': ['error'], // https://eslint.org/docs/rules/space-infix-ops
    'space-before-function-paren': ['error', { 'anonymous': 'never', 'named': 'never', 'asyncArrow': 'always' }], // https://eslint.org/docs/rules/space-before-function-paren
    'switch-colon-spacing': ['error'], // https://eslint.org/docs/rules/switch-colon-spacing
    'spaced-comment': ['error', 'always'], // https://eslint.org/docs/rules/spaced-comment
    'arrow-spacing': ['error'], // https://eslint.org/docs/rules/arrow-spacing
    'no-duplicate-imports': ['error'], // https://eslint.org/docs/rules/no-duplicate-imports
    'template-curly-spacing': ['error'], // https://eslint.org/docs/rules/template-curly-spacing
    'no-nested-ternary': ['warn'], // ??? https://eslint.org/docs/rules/no-nested-ternary
    'quotes': ['error', 'single'], // ??? https://eslint.org/docs/rules/quotes
    'jsx-quotes': ['error', 'prefer-single'], // ??? https://eslint.org/docs/rules/jsx-quotes
  }
}
