module.exports = {
  customSyntax: 'postcss-syntax',
  extends: ['stylelint-config-standard'],
  rules: {
    // Allow Tailwind directives and PostCSS at-rules
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'screen', 'layer']
      }
    ],
    // Relax some rules for Tailwind utility classes if needed
    'selector-class-pattern': null
  }
};
