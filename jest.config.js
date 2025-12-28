const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/**/*.test.ts"],
      testPathIgnorePatterns: ["<rootDir>/tests/integration/"],
      testEnvironment: "jsdom",
      transform: {
        ...tsJestTransformCfg,
      },
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      testEnvironment: "jsdom",
      // Increase timeout for slow tests
      testTimeout: 60000,
      transform: {
        ...tsJestTransformCfg,
      },
    },
  ],
};
