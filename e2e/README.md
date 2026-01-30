# E2E Tests (Playwright)

End-to-end tests for the web client, including the **Business Onboarding Tour**.

## Prerequisites

- **API server** must be running (e.g. from `../server`: `npm run dev`, default port 5000).
- The client will be started automatically by Playwright's `webServer` unless you set `PLAYWRIGHT_BASE_URL` to an already-running app.

## Run tests

```bash
# From client directory
npm run test:e2e

# With UI (interactive)
npm run test:e2e:ui

# Headed (see browser)
npm run test:e2e:headed
```

Or with npx:

```bash
npx playwright test
npx playwright test --ui
npx playwright test --headed
```

## Business Onboarding Tour tests

- **after business signup, onboarding tour appears and can be skipped**  
  Signs up a new business user, waits for redirect to dashboard, asserts the Joyride tour appears, clicks "Skip tour", verifies tour is dismissed and completion is stored, then reloads and verifies the tour does not show again.  
  Requires the API to be running; otherwise the test is skipped.

- **dashboard has tour target elements when logged in**  
  Asserts that when on the business dashboard (logged in), the tour target elements (`data-tour="settings"`, `products`, `payouts`, `dashboard-stats`) are present.  
  Skipped when not logged in (e.g. in isolation).

## Environment

- `PLAYWRIGHT_BASE_URL` – Base URL of the app (default: `http://localhost:5173`).
- `CI` – When set, retries and reduced parallelism are used; `webServer` is not started (use your own server).
