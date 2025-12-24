import { config } from '@repo/eslint-config/react';

export default [
  ...config,
  {
    ignores: ['dist/**'],
  },
  {
    rules: {
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            // React Three Fiber 속성들
            'rotation',
            'position',
            'args',
            'intensity',
            'castShadow',
            'shadow-mapSize',
            'transparent',
            'opacity',
            'side',
            'metalness',
            'roughness',
            'emissive',
            'emissiveIntensity',
          ],
        },
      ],
    },
  },
];
