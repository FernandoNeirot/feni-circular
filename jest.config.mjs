import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/*.test.[jt]s?(x)",
    "**/*.spec.[jt]s?(x)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    // Tests de API se ejecutan con jest.api.config.mjs (entorno node)
    "app/api/.*/__tests__/.*\\.integration\\.test\\.[jt]sx?$",
  ],
  collectCoverageFrom: [
    "app/admin/**/*.{ts,tsx}",
    "shared/serverActions/**/*.ts",
    "features/admin/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/shared/(.*)$": "<rootDir>/shared/$1",
    "^@/features/(.*)$": "<rootDir>/features/$1",
  },
};

export default createJestConfig(config);
