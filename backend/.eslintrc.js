module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintrc.js',
    '**/*.spec.ts',
    '**/*.e2e-spec.ts',
    'test/**/*'
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow unsafe operations in test files
    '@typescript-eslint/no-unsafe-assignment': [
      'warn',
      {
        // Allow in test files
      },
    ],
    '@typescript-eslint/no-unsafe-argument': [
      'warn',
      {
        // Allow in test files
      },
    ],
    '@typescript-eslint/no-unsafe-member-access': [
      'warn',
      {
        // Allow in test files
      },
    ],
    '@typescript-eslint/no-unsafe-call': [
      'warn',
      {
        // Allow in test files
      },
    ],
    '@typescript-eslint/no-unsafe-return': [
      'warn',
      {
        // Allow in test files
      },
    ],
  },
  overrides: [
    {
      // Disable unsafe warnings in test files
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Disable unsafe warnings for Prisma/external library integrations
      files: ['src/positions/positions.service.ts', 'src/marinade/marinade.service.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};