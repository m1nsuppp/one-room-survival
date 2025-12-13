import { config } from '@repo/eslint-config/react';

export default [
  ...config,
  {
    rules: {
      'react/no-unknown-property': [
        'error',
        { ignore: ['rotation', 'position', 'args', 'intensity'] },
      ],
    },
  },
];
