module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    // setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    moduleNameMapper: {
      '\\.(css|less|scss)$': 'identity-obj-proxy',
      '^lit$': '<rootDir>/node_modules/lit',
      '^lit/(.*)$': '<rootDir>/node_modules/lit/$1',
    },
    collectCoverage: true,
    coverageReporters: ['lcov', 'text'],
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "babel-jest"
      },
    transformIgnorePatterns: [
      'node_modules/(?!(lit|@lit|lit-element|lit-html)/)'
    ],
    collectCoverageFrom: ['src/stories/components/*.{js,jsx,ts,tsx}', 'src/core/*.{js,jsx,ts,tsx}'],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    testPathIgnorePatterns: [
      "/node_modules/",
      "/Frontend/"
    ],
  };