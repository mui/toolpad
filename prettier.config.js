const baseline = require('@mui/monorepo/prettier.config');

baseline.overrides.push({
  files: ['**/*.json'],
  options: {
    trailingComma: 'none',
  },
});

module.exports = baseline;
