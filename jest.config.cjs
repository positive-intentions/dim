const isWasm = process.env.DIM_IMPL === 'wasm';

module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '\\.(css|less|scss)$': 'identity-obj-proxy',
    },
    collectCoverage: !isWasm,
    coverageReporters: ['lcov', 'text'],
    transform: {
        "^.+\\.(ts|tsx|js|jsx|mjs)$": "babel-jest"
      },
    transformIgnorePatterns: [
      '/node_modules/'
    ],
    collectCoverageFrom: ['src/stories/components/*.{js,jsx,ts,tsx}', 'src/core/**/*.{js,jsx,ts,tsx}'],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "json", "node"],
    testMatch: isWasm
      ? [
          // Runtime-level suites; store/crypto/fs suites don't touch the
          // renderer so they are only run once, in JS mode.
          "<rootDir>/src/core/renderer/renderer.test.js",
          "<rootDir>/src/core/element/define.test.js",
          "<rootDir>/src/core/transitions/*.test.js",
          "<rootDir>/src/stories/Dim.test.js",
          "<rootDir>/src/stories/tutorial/tutorial.test.js",
          "<rootDir>/src/wasm/**/*.test.js",
        ]
      : [
          "**/__tests__/**/*.[jt]s?(x)",
          "**/?(*.)+(spec|test).[jt]s?(x)"
        ],
    testPathIgnorePatterns: isWasm
      ? ["/node_modules/", "/Frontend/"]
      : ["/node_modules/", "/Frontend/", "<rootDir>/src/wasm/"],
    ...(isWasm ? { resolver: '<rootDir>/scripts/jest-wasm-resolver.cjs' } : {}),
  };
