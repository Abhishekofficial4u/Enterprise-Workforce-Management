# Contributing & Coding Standards

This document describes the engineering practices, coding standards, branch conventions, and Git workflows expected of all developers on the team.

---

## 1. Branch Naming Conventions

Always create a descriptive branch before writing code:

* **Feature Branches**: `feat/` prefix followed by the feature description:
  * Example: `feat/onboarding-wizard`
* **Bug Fixes**: `fix/` prefix:
  * Example: `fix/payroll-unpaid-leaves`
* **Documentation updates**: `docs/` prefix:
  * Example: `docs/api-guide`
* **Refactoring**: `refactor/` prefix:
  * Example: `refactor/auth-middleware`

---

## 2. Commit Message Standards

We enforce descriptive, structured commit messages to facilitate clean git history:

```
[type]: [short summary in active voice]

[optional body details]
```

### Allowed Types
* **`feat`**: A brand new system capability.
* **`fix`**: A code fix resolving a bug.
* **`docs`**: Changes strictly to documentation files.
* **`style`**: Changes that do not affect code logic (formatting, missing semi-colons).
* **`refactor`**: Reorganizing code without changing behavior.
* **`chore`**: Updating packages, configurations, or build pipelines.

### Example Commit
```git
feat: integrate react-organizational-chart in Employee Org View

Replaced custom CSS vertical columns with the react-organizational-chart
library. This handles multiple root nodes by wrapping them in a unified
"Company" root card, resolving rendering issues for unconnected profiles.
```

---

## 3. General Development Workflow

1. **Pull the Latest Changes**: Check out the `main` branch and pull updates:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Spawn a Branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```
3. **Write Code**: Follow naming and linting standards.
4. **Run Local Verifications**:
   * Frontend: Run `npm run build` to verify there are no compilation errors.
   * Backend: Run node syntax tests (`node -c file.js`) or local test runs.
5. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: my change summary"
   git push origin feat/my-new-feature
   ```
6. **Submit a Pull Request (PR)**: Open a PR on GitHub, describe the changes, and request an review from your engineering manager.
