---
name: service-layer-guidelines
description: Directs the implementation of standalone business logic services, third-party integrations, role-based access control, and environment configs.
---

# Service Layer Guidelines

This skill defines standards for creating and maintaining service modules within `src/services/`, including role-based access control and permission management.

---

## 1. Scope & Responsibilities

The `src/services/` directory is reserved for reusable business logic, external integrations, and app infrastructure helpers:

```text
src/services/
├── app-error.service.js         # Central custom error class
├── schema-validator-service.js   # Zod request validator middleware
├── environment.service.js        # Env variables & runtime configs
├── providers.service.js          # App constants & provider mappings
├── easebuzz-payment.service.js   # Payment gateway integration
└── fcm.service.js               # Firebase Cloud Messaging service
```

---

## 2. Service Design Rules

1. **Separation of Concerns**: Services must NOT depend on Express `req` or `res` objects directly. Pass standard JavaScript parameters and return clean data or throw custom errors.
2. **Custom Error Throwing**: Services should throw `AppError` instances so route handlers can catch and return proper HTTP responses.
3. **Environment Configs**: Always read environment variables via `environment.service.js` instead of raw `process.env`.

---

## 3. Standard Service Template

```javascript
// External dependancies - Start
const axios = require("axios");
// External dependancies - End

// Internal dependancies - Start
const AppError = require("./app-error.service");
const { envs } = require("./environment.service");
// Internal dependancies - End

/**
 * Execute third-party integration logic or complex business rules
 * @param {Object} params
 * @returns {Promise<Object>}
 */
const executeServiceAction = async ({ payload, identifier }) => {
  try {
    if (!payload) {
      throw new AppError(400, "Payload is required for action");
    }

    // Business or API logic
    const result = { success: true, identifier };

    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error.message || "Failed to execute service action");
  }
};

module.exports = {
  executeServiceAction,
};
```

---

## 4. Summary Checklist

* Keeps controllers thin by isolating domain logic.
* Returns pure JavaScript objects or arrays.
* Handles external API failures gracefully using `AppError`.
