import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      ".agents/**",
      ".claude/**",
      ".claude-flow/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
];

export default eslintConfig;
