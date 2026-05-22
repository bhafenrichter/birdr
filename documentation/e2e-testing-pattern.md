# E2E Testing Pattern with Maestro

## Overview

This document outlines the end-to-end testing strategy using [Maestro](https://maestro.mobile.dev), a mobile UI testing framework for React Native and native apps. Maestro provides a simple YAML-based syntax for writing tests that run on iOS and Android simulators/devices without requiring complex setup or flaky selectors.

> **Note:** This pattern is framework-agnostic. Examples use generic placeholder names and structures. Replace bundle IDs (e.g., `com.example.app`), feature names, and test flows with your app-specific values.

**Key Benefits:**
- ✅ **Zero flakiness** - Maestro intelligently waits for elements
- ✅ **No boilerplate** - Simple YAML syntax vs verbose code
- ✅ **Fast execution** - Runs tests in parallel
- ✅ **Real device testing** - Works on simulators and physical devices
- ✅ **Built-in commands** - Random data generation, gestures, assertions
- ✅ **CI/CD ready** - Easy command-line execution

---

## Architecture

### Recommended Test Structure

```
e2e/
├── launch-app.yaml              # Simple app launch test
└── maestro/
    ├── README.md                # Comprehensive test documentation
    ├── config.yaml              # Suite configuration with continueOnFailure
    ├── tests-flow.yaml          # Complete test suite orchestrator
    ├── pre-auth-suite.yaml      # Pre-authentication tests only
    ├── post-auth-suite.yaml     # Post-authentication tests only
    ├── .maestro/
    │   └── screenshots/         # Test screenshots (gitignored)
    ├── pre-auth/                # Authentication setup tests
    │   ├── create-account.yaml
    │   └── login.yaml
    └── post-auth/               # Authenticated user tests
        ├── onboarding.yaml
        ├── feature-a/
        │   ├── create-item.yaml
        │   ├── edit-item.yaml
        │   └── delete-item.yaml
        ├── feature-b/
        │   └── workflow.yaml
        └── settings/
            └── update-profile.yaml
```

### Organizing Tests by Feature

Group tests logically based on your app's features:

| Category | Directory | Purpose | Examples |
|----------|-----------|---------|----------|
| **Pre-Auth** | `pre-auth/` | Account creation, login flows | Registration, login, password reset |
| **Onboarding** | `post-auth/` | First-time user setup | Tutorial, profile completion |
| **Feature-Specific** | `post-auth/feature-name/` | CRUD operations for features | Create, read, update, delete workflows |
| **Settings** | `post-auth/settings/` | App configuration | Profile, preferences, notifications |
| **Subscription** | `post-auth/subscription/` | Paywall flows, purchases | Trial expiration, upgrades, cancellation |

---

## Core Patterns

### 1. Basic Test File Structure

Every Maestro test file follows this structure:

```yaml
appId: com.hoftware.nest  # Your app's bundle ID
name: "Optional Test Name"
---
# Test commands go here
- launchApp
- tapOn: "Button Text"
- assertVisible: "Expected Element"
```

**Key Points:**
- `appId` must match your app's bundle identifier (iOS) or package name (Android)
- Commands are executed sequentially
- Tests fail immediately if any assertion fails (unless `continueOnFailure: true`)

---

### 2. Expo Development Server Detection (Expo Apps Only)

**CRITICAL for Expo:** If using Expo, all tests must handle dev mode detection to work in development builds.

```yaml
appId: com.yourcompany.yourapp  # Replace with your app's bundle ID
---
- launchApp:
    clearState: true  # Optional: clear app data for fresh state

# Handle Expo development server selection (iOS localhost / Android emulator)
- runFlow:
    when:
      visible: Development servers
    commands:
      # iOS Simulator: localhost:8081
      - runFlow:
          when:
            visible: http://localhost:8081
          commands:
            - tapOn: http://localhost:8081
            - tapOn: Continue
            - tapOn:
                point: 50%,10%  # Tap to dismiss any overlay
      
      # Android Emulator: 10.0.2.2:8081
      - runFlow:
          when:
            visible: http://10.0.2.2:8081
          commands:
            - tapOn: http://10.0.2.2:8081
            - tapOn: Continue
            - tapOn:
                point: 50%,10%

# Continue with actual test steps...
- tapOn: "Get Started"  # Replace with your app's flow
```

**Why This Matters (Expo Apps):**
- Development builds show a server selection screen on first launch
- Production builds skip this screen entirely
- Without this conditional flow, tests fail in dev mode

**Note:** If you're not using Expo, skip this pattern entirely.

---

### 3. Running Nested Flows

Maestro supports composable tests by running flows within flows:

```yaml
# Basic flow import
- runFlow: ../pre-auth/login.yaml

# Flow with environment variables
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: e2e-test@gmail.com
      PASSWORD: Capontap1!

# Conditional flow execution
- runFlow:
    when:
      notVisible: Test Budget
    file: create-budget.yaml
```

**Use Cases:**
- **Setup dependencies:** Run login flow before testing authenticated features
- **Test data creation:** Create budget before testing budget edits
- **Conditional setup:** Only create data if it doesn't exist

---

### 4. User Input Patterns

#### Text Input
```yaml
# Tap on field, then type
- tapOn:
    text: Email
    index: 1  # Use index if multiple matches exist
- inputText: user@example.com

# Input with testID selector
- tapOn:
    id: password
- inputText: SecurePass123!

# Random email generation (built-in Maestro command)
- tapOn:
    text: Email
    index: 1
- inputRandomEmail

# Erase existing text before typing
- tapOn: Budget per month
- eraseText
- inputText: 900

# Hide keyboard after input
- tapOn:
    id: password
- inputText: Capontap1!!
- hideKeyboard
```

#### Gestures
```yaml
# Tap on element by text
- tapOn: Login

# Tap by testID
- tapOn:
    id: add-budget-button

# Tap by point (percentage of screen)
- tapOn:
    point: 50%,30%
    retryTapIfNoChange: true

# Double tap
- doubleTapOn:
    point: 0%,0%

# Swipe
- swipe:
    start: 50%, 90%
    end: 50%, 85%
```

---

### 5. Assertions

Maestro provides several assertion commands:

```yaml
# Assert element is visible
- assertVisible: Home
- assertVisible: Test Budget
- assertVisible: Budget deleted successfully

# Assert element is NOT visible
- assertNotVisible: Error

# Wait for animations to complete
- waitForAnimationToEnd:
    timeout: 5000  # milliseconds

# Wait for element to appear with timeout
- tapOn:
    text: "Create your Account"
    waitToSettleTimeoutMs: 500
```

**Best Practices:**
- Use `assertVisible` to verify successful navigation or state changes
- Add `waitForAnimationToEnd` after actions that trigger animations
- Use `retryTapIfNoChange: true` for elements that may not respond immediately

---

### 6. Environment Variables

Tests can accept environment variables for flexible test data:

```yaml
# In login.yaml
appId: com.hoftware.nest
---
- tapOn: Login with Email
- tapOn:
    text: Email
    index: 1
- inputText: ${EMAIL || "apple.test@icloud.com"}  # Default if not provided
- tapOn:
    text: Password
    index: 1
- inputText: ${PASSWORD || "appletest123"}
- tapOn: Login
- assertVisible: Home
```

```yaml
# In another test that uses login.yaml
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: e2e-test@gmail.com
      PASSWORD: Capontap1!
```

**Use Cases:**
- Different test accounts (normal user, expired trial, admin)
- Dynamic test data
- Environment-specific configurations

---

### 7. Test Data Management

#### Dedicated Test Accounts

Create and maintain dedicated test accounts in your backend:

```yaml
# Standard test account
EMAIL: test@example.com
PASSWORD: testpassword123

# Test account with expired trial (if applicable)
EMAIL: expired-trial@example.com
PASSWORD: testpassword123

# Admin test account (if applicable)
EMAIL: admin@example.com
PASSWORD: adminpassword123
```

**Account Maintenance Strategies:**

1. **Manual Creation:**
   - Create accounts manually via your app or backend admin panel
   - Keep credentials in test files (they're not sensitive in test environments)
   - Reset account state manually when needed
   - Consider using `clearState: true` to simulate fresh installs

2. **Seeded Data:**
   - Create seed scripts to populate test accounts in your database
   - Run seed scripts before test execution
   - Ensures consistent test data across environments

3. **Dynamic Creation:**
   - Use `inputRandomEmail` in create-account flow for unique accounts
   - Clean up test accounts periodically via backend scripts
   - Useful for avoiding test data pollution

#### State Management Strategies

```yaml
# Strategy 1: Clear app state for fresh start
- launchApp:
    clearState: true  # Deletes all app data, simulates new install

# Strategy 2: Conditional setup (only create if missing)
- runFlow:
    when:
      notVisible: Test Budget
    file: create-budget.yaml

# Strategy 3: Setup + cleanup pattern
- runFlow: create-budget.yaml
# ... test budget functionality
- tapOn: Delete budget
- tapOn: Delete
```

---

## Implementation Guide

### Step 1: Install Maestro

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### Step 2: Create Test Suite Configuration

Create `e2e/maestro/config.yaml`:

```yaml
# Maestro Test Suite Configuration
# This configuration runs all pre-auth and post-auth test flows

# Define which flows to include in the test suite
flows:
  - "pre-auth/*"           # Include all pre-auth flows
  - "post-auth/*"          # Include all top-level post-auth flows
  - "post-auth/**"         # Include all nested post-auth flows recursively

# Define execution order - pre-auth tests should run before post-auth tests
executionOrder:
  continueOnFailure: true  # Continue execution even if a test fails
  flowsOrder:
    # Pre-auth tests (authentication setup)
    - "create-account"
    - "login"
    
    # Post-auth tests (authenticated user flows)
    - "onboarding"
    
    # Feature-specific tests (customize based on your app)
    - "create-item"
    - "edit-item"
    - "delete-item"
    
    # Settings tests
    - "update-profile"
    
    # Subscription/paywall tests (if applicable)
    - "paywall-flow"

# Optional: Define tags for different test categories
tags:
  auth: ["create-account", "login"]
  core: ["create-item", "edit-item", "delete-item"]
  settings: ["update-profile"]
  subscription: ["paywall-flow"]
  onboarding: ["onboarding"]
```

**Key Configuration Options:**
- `continueOnFailure: true` - Tests continue even if one fails (recommended for full suite runs)
- `flowsOrder` - Explicit test execution order (customize for your features)
- `tags` - Group tests by feature for selective execution

---

### Step 3: Create Reusable Pre-Auth Flows

#### Create Account Flow

`e2e/maestro/pre-auth/create-account.yaml`:

```yaml
appId: com.yourcompany.yourapp  # Replace with your bundle ID
---
- launchApp:
    clearState: true

# [EXPO ONLY] Handle Expo dev mode - remove if not using Expo
- runFlow:
    when:
      visible: Development servers
    commands:
      - runFlow:
          when:
            visible: http://localhost:8081
          commands:
            - tapOn: http://localhost:8081
            - tapOn: Continue
            - tapOn:
                point: 50%,10%
      - runFlow:
          when:
            visible: http://10.0.2.2:8081
          commands:
            - tapOn: http://10.0.2.2:8081
            - tapOn: Continue
            - tapOn:
                point: 50%,10%

# Navigate to account creation (customize for your app)
- tapOn: "Get Started"
- tapOn: "Sign Up"

# Fill out registration form (customize field names and IDs)
- tapOn:
    id: name-input  # Use testID when possible
- inputText: "Test User"

- tapOn:
    id: email-input
- inputRandomEmail  # Built-in Maestro command for unique emails

- tapOn:
    id: password-input
- inputText: "TestPassword123!"
- hideKeyboard

- tapOn:
    id: confirm-password-input
- inputText: "TestPassword123!"

# Submit and wait for account creation
- tapOn:
    id: submit-button  # Use testID
    waitToSettleTimeoutMs: 500
- waitForAnimationToEnd:
    timeout: 5000

# Handle potential retry
- tapOn:
    id: submit-button
    retryTapIfNoChange: true

# Verify successful account creation (customize assertion)
- assertVisible: "Welcome"
```

#### Login Flow

`e2e/maestro/pre-auth/login.yaml`:

```yaml
appId: com.yourcompany.yourapp  # Replace with your bundle ID
---
- launchApp:
    clearState: true

# [EXPO ONLY] Handle Expo dev mode - remove if not using Expo
- runFlow:
    when:
      visible: Development servers
    commands:
      - runFlow:
          when:
            visible: http://localhost:8081
          commands:
            - tapOn: http://localhost:8081
            - tapOn: Continue
            - tapOn:
                point: 50%,10%
      - runFlow:
          when:
            visible: http://10.0.2.2:8081
          commands:
            - tapOn: http://10.0.2.2:8081
            - tapOn: Continue
            - tapOn:
                point: 50%,10%

# Navigate to login (customize for your app)
- tapOn: "Get Started"
- tapOn: "Login"

# Enter credentials (use env vars with defaults)
- tapOn:
    id: email-input  # Use testID when possible
- inputText: ${EMAIL || "test@example.com"}

- tapOn:
    id: password-input
- inputText: ${PASSWORD || "testpassword"}

- waitForAnimationToEnd:
    timeout: 1000

- tapOn:
    id: login-button

# Verify successful login (customize assertion)
- assertVisible: "Home"
```

---

### Step 4: Create Post-Auth Feature Tests

#### Create Item Test (Generic CRUD Example)

`e2e/maestro/post-auth/feature-a/create-item.yaml`:

```yaml
appId: com.yourcompany.yourapp  # Replace with your bundle ID
---
# Run login flow with specific test account
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: test@example.com
      PASSWORD: testpassword

# Navigate to feature (customize for your app)
- tapOn:
    id: feature-tab  # Use testID

# Create new item
- tapOn:
    id: add-item-button

- tapOn:
    id: item-name-input
- inputText: "Test Item"

- tapOn:
    id: item-value-input
- inputText: "100"

- tapOn:
    id: submit-button

# Verify item was created
- assertVisible: "Test Item"
```

#### Edit Item Test

`e2e/maestro/post-auth/feature-a/edit-item.yaml`:

```yaml
appId: com.yourcompany.yourapp
---
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: test@example.com
      PASSWORD: testpassword

- tapOn:
    id: feature-tab

# Create item if it doesn't exist (conditional setup)
- runFlow:
    when:
      notVisible: "Test Item"
    file: create-item.yaml

# Edit existing item
- tapOn: "Test Item"
- tapOn:
    id: edit-button

- tapOn:
    id: item-value-input
- eraseText
- inputText: "200"

- tapOn:
    id: save-button

# Verify update
- assertVisible: "Test Item"
- assertVisible: "200"
```

#### Delete Item Test

`e2e/maestro/post-auth/feature-a/delete-item.yaml`:

```yaml
appId: com.yourcompany.yourapp
---
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: test@example.com
      PASSWORD: testpassword

- tapOn:
    id: feature-tab

# Ensure item exists before deletion
- runFlow:
    when:
      notVisible: "Test Item"
    file: create-item.yaml

# Delete item
- tapOn: "Test Item"
- tapOn:
    id: delete-button
- tapOn:
    id: confirm-delete-button

# Verify deletion
- assertVisible: "Item deleted successfully"
```

#### Subscription Paywall Test (Optional)

`e2e/maestro/post-auth/subscription/paywall-flow.yaml`:

```yaml
appId: com.yourcompany.yourapp
---
# Use account with expired trial (if applicable)
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: expired-trial@example.com
      PASSWORD: testpassword

# Verify paywall appears
- assertVisible: "Upgrade to Premium"
```

---

### Step 5: Create Suite Orchestrators

#### Complete Test Suite

`e2e/maestro/tests-flow.yaml`:

```yaml
# Maestro Test Suite Flow
# Run with: maestro test tests-flow.yaml
# WARNING: Stops on first failure (use directory-based testing for continueOnFailure)

appId: com.yourcompany.yourapp  # Replace with your bundle ID
name: "Complete App Test Suite"
---

# Pre-Authentication Tests
- runFlow:
    file: pre-auth/create-account.yaml

- runFlow:
    file: pre-auth/login.yaml

# Post-Authentication Tests
- runFlow:
    file: post-auth/onboarding.yaml

# Feature A Tests (customize for your features)
- runFlow:
    file: post-auth/feature-a/create-item.yaml

- runFlow:
    file: post-auth/feature-a/edit-item.yaml

- runFlow:
    file: post-auth/feature-a/delete-item.yaml

# Feature B Tests (add your own features)
- runFlow:
    file: post-auth/feature-b/workflow.yaml

# Settings Tests
- runFlow:
    file: post-auth/settings/update-profile.yaml

# Subscription/Paywall Tests (optional)
- runFlow:
    file: post-auth/subscription/paywall-flow.yaml
```

#### Pre-Auth Suite

`e2e/maestro/pre-auth-suite.yaml`:

```yaml
# Pre-Authentication Test Suite
# Run with: maestro test pre-auth-suite.yaml

appId: com.yourcompany.yourapp  # Replace with your bundle ID
name: "Pre-Authentication Test Suite"
---

- runFlow:
    file: pre-auth/create-account.yaml

- runFlow:
    file: pre-auth/login.yaml
```

#### Post-Auth Suite

`e2e/maestro/post-auth-suite.yaml`:

```yaml
# Post-Authentication Test Suite
# Run with: maestro test post-auth-suite.yaml

appId: com.yourcompany.yourapp  # Replace with your bundle ID
name: "Post-Authentication Test Suite"
---

# Core flows
- runFlow:
    file: post-auth/onboarding.yaml

# Feature-specific flows (customize for your app)
- runFlow:
    file: post-auth/feature-a/create-item.yaml

- runFlow:
    file: post-auth/feature-a/edit-item.yaml

- runFlow:
    file: post-auth/feature-a/delete-item.yaml

# Settings flows
- runFlow:
    file: post-auth/settings/update-profile.yaml

# Subscription flows (if applicable)
- runFlow:
    file: post-auth/subscription/paywall-flow.yaml
```

---

### Step 6: Add NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "test": "maestro test e2e/maestro"
  }
}
```

---

### Step 7: Update .gitignore

Add to `.gitignore`:

```gitignore
# Maestro
e2e/maestro/.maestro/screenshots/
.maestro/
```

---

## Running Tests

### Full Test Suite (Recommended)

Run all tests using directory-based approach (respects `config.yaml` settings):

```bash
# Via NPM script
npm test

# Direct command
maestro test e2e/maestro/

# Maestro Cloud execution
maestro cloud e2e/maestro/
```

**Why This is Recommended:**
- ✅ Uses `continueOnFailure: true` from config.yaml
- ✅ If a test fails, remaining tests still run
- ✅ Final report shows all results
- ✅ Best for CI/CD pipelines

---

### Run Specific Test Suites

```bash
# Pre-authentication tests only
maestro test e2e/maestro/pre-auth-suite.yaml

# Post-authentication tests only
maestro test e2e/maestro/post-auth-suite.yaml

# Complete suite (WARNING: stops on first failure)
maestro test e2e/maestro/tests-flow.yaml
```

---

### Run Tests by Directory

```bash
# All pre-auth tests
maestro test e2e/maestro/pre-auth/

# All post-auth tests
maestro test e2e/maestro/post-auth/

# Specific category
maestro test e2e/maestro/post-auth/budgets/
maestro test e2e/maestro/post-auth/transactions/
maestro test e2e/maestro/post-auth/subscription/
```

---

### Run Individual Tests

```bash
# Single test
maestro test e2e/maestro/pre-auth/login.yaml

# Multiple specific tests
maestro test e2e/maestro/pre-auth/login.yaml e2e/maestro/post-auth/budgets/create-budget.yaml
```

---

### Generate Reports

```bash
# JUnit XML (for CI/CD integration)
maestro test --format junit e2e/maestro/

# HTML report
maestro test --format html e2e/maestro/

# Custom output file
maestro test --format junit --output test-results.xml e2e/maestro/
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH
      
      - name: Setup iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15"
      
      - name: Install app on simulator
        run: |
          npx expo prebuild --platform ios
          xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build
          xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/YourApp.app
      
      - name: Run E2E tests
        run: npm test
      
      - name: Generate test report
        if: always()
        run: maestro test --format junit --output test-results.xml e2e/maestro/
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: maestro-test-results
          path: test-results.xml
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: maestro-screenshots
          path: e2e/maestro/.maestro/screenshots/

  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH
      
      - name: Setup Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 30
          target: google_apis
          arch: x86_64
          script: |
            npx expo prebuild --platform android
            ./gradlew assembleDebug
            adb install android/app/build/outputs/apk/debug/app-debug.apk
            npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: maestro-test-results-android
          path: test-results.xml
```

---

### Maestro Cloud Execution

For parallel execution across multiple devices:

```bash
# Upload tests to Maestro Cloud
maestro cloud e2e/maestro/

# Specify devices
maestro cloud --device-locale en_US --os-version 16 e2e/maestro/

# Run specific flow
maestro cloud e2e/maestro/tests-flow.yaml
```

**Benefits:**
- Run tests on real devices
- Parallel execution across multiple devices/OS versions
- Automatic screenshots and recordings
- Test on devices you don't own

---

## Best Practices

### 1. testID Integration

**All components should have testID props** for reliable element selection:

```typescript
// ✅ Good: Component with testID
<Button testID="add-budget-button" onPress={handleAdd}>
  Add Budget
</Button>

// ✅ Test using testID
- tapOn:
    id: add-budget-button
```

```typescript
// ❌ Bad: No testID, relying on text only
<Button onPress={handleAdd}>Add Budget</Button>

// ❌ Test breaks if text changes
- tapOn: Add Budget
```

**Why testIDs Matter:**
- Text can change (localization, copy updates)
- testIDs are stable selectors
- Faster element lookup
- Works even if text is dynamic

---

### 2. Test Independence

Each test should run independently and not rely on state from other tests:

```yaml
# ✅ Good: Test creates its own setup
- runFlow:
    file: ../../pre-auth/login.yaml
    env:
      EMAIL: e2e-test@gmail.com
      PASSWORD: Capontap1!

- runFlow:
    when:
      notVisible: Test Budget
    file: create-budget.yaml

# ❌ Bad: Assumes budget exists from previous test
- tapOn: Test Budget  # Fails if previous test didn't run
```

**Strategies:**
- Use `clearState: true` for fresh app state
- Create necessary data conditionally with `when: notVisible`
- Clean up data after test (delete created items)

---

### 3. Wait Strategies

Maestro automatically waits for elements, but sometimes you need explicit waits:

```yaml
# Wait for animations
- waitForAnimationToEnd:
    timeout: 5000

# Wait for element to settle before tapping
- tapOn:
    text: Submit
    waitToSettleTimeoutMs: 500

# Retry tap if no change detected
- tapOn:
    point: 50%,30%
    retryTapIfNoChange: true
```

**When to Use:**
- After navigation transitions
- After modal animations
- Before tapping elements that might not respond immediately

---

### 4. Conditional Flows

Use `when` conditions to make tests more robust:

```yaml
# Only run setup if needed
- runFlow:
    when:
      notVisible: Test Budget
    file: create-budget.yaml

# Handle optional modals
- runFlow:
    when:
      visible: Tutorial
    commands:
      - tapOn: Skip Tutorial

# Retry actions
- runFlow:
    when:
      visible: Submit Button
    commands:
      - tapOn: Submit Button
```

---

### 5. Descriptive File Names

Name test files based on what they test:

```
✅ create-budget.yaml
✅ edit-budget.yaml
✅ paywall-on-login.yaml
✅ automatic-import.yaml

❌ test1.yaml
❌ budget.yaml
❌ flow.yaml
```

---

### 6. Organize by Feature

Group related tests in directories:

```
post-auth/
├── budgets/           # All budget-related tests
│   ├── create-budget.yaml
│   ├── edit-budget.yaml
│   ├── delete-budget.yaml
│   └── suggest-budget.yaml
├── transactions/      # All transaction-related tests
└── subscription/      # All subscription-related tests
```

---

### 7. Environment Variables for Flexibility

Use environment variables for reusable flows:

```yaml
# login.yaml - accepts EMAIL and PASSWORD
- inputText: ${EMAIL || "default@example.com"}
- inputText: ${PASSWORD || "defaultpass"}

# test1.yaml - uses test account
- runFlow:
    file: login.yaml
    env:
      EMAIL: test@example.com
      PASSWORD: testpass

# test2.yaml - uses admin account
- runFlow:
    file: login.yaml
    env:
      EMAIL: admin@example.com
      PASSWORD: adminpass
```

---

### 8. Screenshot Documentation

Maestro automatically captures screenshots in `.maestro/screenshots/`:

- Screenshots are taken on failures
- Screenshots are taken on assertions
- Use for debugging flaky tests
- Add to .gitignore (large files)

```bash
# View screenshots after test run
ls -la e2e/maestro/.maestro/screenshots/
```

---

### 9. Handling Flaky Tests

If tests are flaky, use these techniques:

```yaml
# 1. Add explicit waits
- waitForAnimationToEnd:
    timeout: 5000

# 2. Use retryTapIfNoChange
- tapOn:
    id: submit-button
    retryTapIfNoChange: true

# 3. Use conditional flows for unreliable elements
- runFlow:
    when:
      visible: Loading
    commands:
      - waitForAnimationToEnd:
          timeout: 10000

# 4. Clear state for consistent starting point
- launchApp:
    clearState: true
```

---

### 10. Performance Considerations

- **Parallel execution:** Run category-based suites in parallel
- **Selective testing:** Run only affected tests during development
- **Cloud execution:** Use Maestro Cloud for multi-device testing
- **Local testing:** Use simulators for faster iteration

```bash
# Fast feedback during development
maestro test e2e/maestro/post-auth/budgets/create-budget.yaml

# Full suite before merging
npm test
```

---

## Common Maestro Commands

### Element Interaction

```yaml
# Tap
- tapOn: "Button Text"
- tapOn:
    id: button-id
- tapOn:
    text: "Login"
    index: 2  # Second match
- tapOn:
    point: 50%,30%

# Double tap
- doubleTapOn: "Element"

# Long press
- longPressOn: "Element"

# Swipe
- swipe:
    start: 50%, 90%
    end: 50%, 10%
    duration: 3000  # milliseconds

# Scroll
- scroll

# Scroll until visible
- scrollUntilVisible:
    element: "Target Element"
    direction: DOWN
```

---

### Input

```yaml
# Text input
- inputText: "Hello World"

# Random inputs
- inputRandomEmail
- inputRandomNumber
- inputRandomText

# Erase text
- eraseText

# Hide keyboard
- hideKeyboard
```

---

### Assertions

```yaml
# Visibility
- assertVisible: "Element"
- assertNotVisible: "Element"

# True/false
- assertTrue: ${condition}

# Wait
- waitForAnimationToEnd:
    timeout: 5000
```

---

### App Control

```yaml
# Launch app
- launchApp
- launchApp:
    clearState: true
    stopApp: true

# Clear state
- clearState

# Clear keychain (iOS)
- clearKeychain

# Take screenshot
- takeScreenshot: screenshot-name

# Back button (Android)
- pressKey: back
```

---

### Flow Control

```yaml
# Run nested flow
- runFlow: path/to/flow.yaml
- runFlow:
    file: path/to/flow.yaml
    env:
      VAR: value

# Conditional execution
- runFlow:
    when:
      visible: "Element"
    commands:
      - tapOn: "Element"

# Repeat
- repeat:
    times: 5
    commands:
      - tapOn: "Next"
```

---

## Troubleshooting

### Test Fails to Find Element

**Problem:** `Element not found: "Login"`

**Solutions:**
1. Check if element is actually visible (use Maestro Studio for debugging)
2. Add wait for animation: `waitForAnimationToEnd`
3. Use testID instead of text: `tapOn: { id: login-button }`
4. Check for typos in text/ID
5. Use `index` if multiple matches exist

---

### Tests Pass Locally, Fail in CI

**Problem:** Tests work on your machine but fail in CI/CD

**Solutions:**
1. Ensure dev server detection flow is present
2. Increase timeout values for slower CI environments
3. Add explicit waits after animations
4. Use `clearState: true` for consistent starting state
5. Check simulator/emulator configuration matches local setup

---

### Expo Dev Server Issues

**Problem:** Test hangs on "Development servers" screen

**Solutions:**
1. Verify dev server detection flow is correct
2. Check for typos in server URLs (localhost:8081 vs 10.0.2.2:8081)
3. Ensure conditional flows use correct `when: visible` conditions
4. Test on production build to skip dev server selection

---

### Flaky Tests

**Problem:** Tests sometimes pass, sometimes fail

**Solutions:**
1. Add `retryTapIfNoChange: true` to unreliable taps
2. Increase `waitForAnimationToEnd` timeouts
3. Use `clearState: true` for consistent state
4. Add conditional flows for optional elements
5. Use testIDs instead of text selectors
6. Check for race conditions (network requests, animations)

---

### App Crashes During Test

**Problem:** App crashes mid-test

**Solutions:**
1. Check app logs for crash reason
2. Verify test account has valid data
3. Ensure backend is accessible (not localhost for device testing)
4. Add error boundaries in app code
5. Test on production build to isolate dev-only issues

---

## Maestro Studio (Visual Debugger)

Launch Maestro Studio for interactive test development:

```bash
maestro studio
```

**Features:**
- Visual element inspector
- Real-time test execution
- Element selector validation
- Screenshot comparison
- Step-by-step debugging

**Use Cases:**
- Finding correct element selectors
- Debugging failing tests
- Exploring app hierarchy
- Validating testIDs

---

## Advanced Patterns

### Page Object Pattern

Create reusable page flows:

```yaml
# pages/login-page.yaml
appId: com.hoftware.nest
---
# Reusable login page actions
- tapOn: Login with Email
- tapOn:
    text: Email
    index: 1
- inputText: ${EMAIL}
- tapOn:
    text: Password
    index: 1
- inputText: ${PASSWORD}
- tapOn: Login
```

```yaml
# tests/my-test.yaml
- runFlow:
    file: ../pages/login-page.yaml
    env:
      EMAIL: test@example.com
      PASSWORD: testpass
```

---

### Setup/Teardown Pattern

```yaml
# tests/budget-test.yaml
appId: com.hoftware.nest
---
# Setup
- runFlow: ../setup/login.yaml
- runFlow: ../setup/create-test-data.yaml

# Test
- tapOn: Test Budget
- assertVisible: $500.00

# Teardown
- runFlow: ../teardown/delete-test-data.yaml
- runFlow: ../teardown/logout.yaml
```

---

### Data-Driven Testing

```yaml
# tests/login-multiple-accounts.yaml
appId: com.hoftware.nest
---
# Test account 1
- runFlow:
    file: login.yaml
    env:
      EMAIL: user1@example.com
      PASSWORD: pass1

- assertVisible: Home
- runFlow: logout.yaml

# Test account 2
- runFlow:
    file: login.yaml
    env:
      EMAIL: user2@example.com
      PASSWORD: pass2

- assertVisible: Home
- runFlow: logout.yaml
```

---

## Integration with Component Design System

**CRITICAL:** All interactive components should have `testID` props for reliable element selection.

This integrates directly with your atomic design system → See `atomic-design-pattern.md`

```typescript
// ✅ Component with testID
<Button
  testID="add-item-button"
  onPress={handleAdd}
>
  Add Item
</Button>

// ✅ Input with testID
<TextInput
  testID="email-input"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>

// ✅ Pressable with testID
<Pressable testID="profile-tab" onPress={navigateToProfile}>
  <Text>Profile</Text>
</Pressable>
```

```yaml
# Maestro test using testIDs
- tapOn:
    id: add-item-button

- tapOn:
    id: email-input
- inputText: "test@example.com"

- tapOn:
    id: profile-tab
```

**Why testIDs Matter:**
- ✅ **Stable selectors** - Don't break when text/styling changes
- ✅ **Faster element lookup** - More efficient than text matching
- ✅ **Localization-proof** - Works regardless of language
- ✅ **Required for E2E** - Essential for Maestro, Detox, Appium
- ✅ **Better debugging** - Easier to identify which element failed

**Best Practices for testIDs:**
```typescript
// Use kebab-case
testID="submit-button"  // ✅ Good
testID="submitButton"   // ❌ Avoid camelCase
testID="submit_button"  // ❌ Avoid snake_case

// Be descriptive
testID="save-profile-button"  // ✅ Good
testID="btn1"                 // ❌ Too vague

// Use consistent naming
testID="create-item-button"   // ✅ Good
testID="edit-item-button"     // ✅ Consistent pattern
testID="delete-item-button"   // ✅ Consistent pattern
```

---

## Summary

Maestro E2E testing provides:

✅ **Simple YAML syntax** - No boilerplate, easy to read/write
✅ **Reliable selectors** - testID integration with atomic design system
✅ **Flexible test organization** - Suite configurations, directory-based execution
✅ **Conditional flows** - Handle optional screens, setup dependencies
✅ **Environment variables** - Reusable flows with different test data
✅ **CI/CD ready** - Command-line execution, JUnit reports, cloud execution
✅ **Visual debugging** - Maestro Studio for interactive development
✅ **Automatic waits** - No manual sleep/wait configuration
✅ **Cross-platform** - Same tests run on iOS and Android
✅ **Real device testing** - Maestro Cloud for device farm execution

**Key Commands:**
```bash
# Full test suite (recommended)
npm test

# Specific suite
maestro test e2e/maestro/pre-auth-suite.yaml

# Category tests
maestro test e2e/maestro/post-auth/budgets/

# Single test
maestro test e2e/maestro/pre-auth/login.yaml

# Generate report
maestro test --format junit e2e/maestro/

# Cloud execution
maestro cloud e2e/maestro/

# Visual debugger
maestro studio
```

This testing pattern ensures your React Native app has comprehensive E2E test coverage, catching regressions before they reach production while maintaining test reliability and developer productivity.
