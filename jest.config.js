module.exports = {
  preset: 'ts-jest',
  "transform": {
    ".+\\.(css|styl|less|sass|scss)$": "jest-css-modules-transform"
  },
  "testEnvironment": "jsdom",
};