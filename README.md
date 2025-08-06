# 🔐 Login Web with IA

A modern web authentication system with intelligent features, built with vanilla JavaScript and Node.js. This project implements secure user authentication with session management, form validation, and comprehensive unit testing.

## 🚀 Project Overview

This is a complete authentication system featuring:
- **Frontend**: Vanilla JavaScript with MaterializeCSS
- **Backend**: Node.js with Express (API proxy)
- **Security**: JWT tokens with 10-minute expiration
- **Storage**: SessionStorage for session data, localStorage for user preferences
- **Testing**: Comprehensive unit tests with Jest

## 🧪 Unit Testing Implementation

The project includes a robust testing suite covering all critical JavaScript classes and functions to ensure reliability and maintainability.

### 🛠️ Testing Stack
- **Jest v29.7.0** - Primary testing framework
- **jsdom** - DOM environment simulation for browser testing
- **Advanced Mocks** - localStorage, sessionStorage, fetch API, DOM elements

### 📁 Test Structure
```
tests/
├── jest.setup.js          # Global mocks configuration
├── setup.js               # General test setup
├── AuthManager.test.js     # Authentication management tests
├── UIUtils.test.js         # Utility functions tests
├── FormValidator.test.js   # Form validation tests
└── AuthAPI.test.js         # API integration tests
```

## 🚀 Running Tests

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm install` | Install all dependencies | First time setup or after package.json changes |
| `npm test` | Run all tests once | CI/CD, general validation |
| `npm run test:watch` | Run tests in watch mode | Active development |
| `npm run test:coverage` | Generate coverage report | Quality analysis |

### ⚡ Quick Start
```bash
# Install dependencies
npm install

# Run tests
npm test
```

## 📊 Test Coverage

### AuthManager (20 tests)
- ✅ Token management (setToken, getToken)
- ✅ Token expiration validation (10-minute timeout)
- ✅ Authentication state checking
- ✅ Session cleanup and logout
- ✅ Route protection and redirects
- ✅ Token expiry information

### UIUtils (17 tests)
- ✅ Email validation (RFC compliant)
- ✅ Password strength validation
- ✅ Name validation (2-50 characters)
- ✅ Date formatting
- ✅ UI message display/hiding
- ✅ Loading state management

### FormValidator (19 tests)
- ✅ Login form validation
- ✅ Registration form validation
- ✅ Multiple error accumulation
- ✅ Integration with UIUtils
- ✅ Edge case handling (null/undefined values)

### AuthAPI (13 tests)
- ✅ HTTP requests with authorization headers
- ✅ Login and registration endpoints
- ✅ Profile retrieval and updates
- ✅ Password change functionality
- ✅ Error handling and network failures

## 🔧 Testing Features

### Mock Configuration
- **localStorage/sessionStorage**: Fully mocked for isolated testing
- **fetch API**: Mocked for HTTP request testing
- **DOM Elements**: Simulated with jsdom
- **MaterializeCSS**: Mocked to prevent UI library dependencies
- **Console**: Silenced during tests for clean output

### Token Expiration Testing
The tests validate the 10-minute token expiration system:
- Valid tokens within timeframe
- Automatic cleanup of expired tokens
- Timestamp validation accuracy

### Validation Testing
Comprehensive validation coverage:
- **Email**: RFC-compliant format validation
- **Password**: Minimum 6 chars with uppercase, lowercase, and number
- **Name**: 2-50 character length validation
- **Forms**: Complete login and registration validation

## 📝 Test Examples

### Email Validation Test
```javascript
test('should validate correct email formats', () => {
  const validEmails = [
    'test@example.com',
    'user.name@domain.co.uk',
    'valid+email@gmail.com'
  ];

  validEmails.forEach(email => {
    expect(UIUtils.validateEmail(email)).toBe(true);
  });
});
```

### Token Expiration Test
```javascript
test('should return false for expired token', () => {
  const tokenData = {
    token: 'expired-token',
    timestamp: Date.now() - (15 * 60 * 1000) // 15 minutes ago
  };
  
  sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
  
  expect(AuthManager.isTokenValid()).toBe(false);
});
```

## ✅ Current Test Results

- **Test Suites**: 4 passed, 4 total (100%)
- **Tests**: 69 passed, 69 total (100%)
- **Coverage**: Comprehensive coverage of all core functionality

## 🎯 Benefits

1. **Reliability**: Ensures code works as expected
2. **Safe Refactoring**: Allows changes without breaking functionality
3. **Living Documentation**: Tests serve as behavior specification
4. **Early Bug Detection**: Catches issues before production
5. **Learning Tool**: Excellent for understanding code behavior

## 🔄 Development Workflow

1. **TDD Approach**: Write tests before implementing features
2. **Watch Mode**: Use `npm run test:watch` during development
3. **Coverage Reports**: Monitor test coverage with `npm run test:coverage`
4. **CI Integration**: All tests must pass before deployment

## 🐛 Debugging Tests

If tests fail:
1. Check mock setup in `tests/jest.setup.js`
2. Verify code changes haven't broken existing functionality
3. Run specific test file: `npm test -- AuthManager.test.js`
4. Use console.log for debugging (remove before commit)

## 📈 Future Enhancements

Potential testing improvements:
- Integration tests between components
- Performance testing
- Accessibility testing
- End-to-end testing with Cypress or Playwright

---

**Happy Testing! 🚀**

*This testing suite ensures the authentication system is robust, secure, and maintainable.*