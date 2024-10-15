// jest.config.js

module.exports = {
    testEnvironment: 'jsdom', // Simulates a browser environment
    transform: {
      '^.+\\.jsx?$': 'babel-jest', // Transforms JS and JSX files using Babel
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(d3)/)', // Transforms d3 module despite being in node_modules
    ],
    moduleNameMapper: {
      '\\.(css|scss)$': 'identity-obj-proxy', // Mocks CSS/SCSS imports
    },
  };