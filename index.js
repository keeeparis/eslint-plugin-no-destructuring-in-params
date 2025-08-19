// index.js
module.exports = {
  rules: {
    'no-destructuring-in-params': require('./rules/no-destructuring-in-params'),
  },
  configs: {
    recommended: {
      rules: {
        '@keeeparis/no-destructuring-in-params': 'error',
      },
    },
  },
}

