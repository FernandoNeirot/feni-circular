/** Config para tests de API routes: usa entorno node (Request/Response en Node 18+) */
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = {
  displayName: "api",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/app/api/**/__tests__/**/*.integration.test.[jt]s?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/shared/(.*)$": "<rootDir>/shared/$1",
    "^@/features/(.*)$": "<rootDir>/features/$1",
  },
};

export default createJestConfig(config);
