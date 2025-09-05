module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable warnings for production build
    'no-unused-vars': 'off',
    'no-useless-escape': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'default-case': 'off'
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        // Keep some rules for development
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      }
    }
  ]
};