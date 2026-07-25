# User Story Template

As a [type of user], I want to [do something], so that [benefit/goal].

**Acceptance Criteria:**
1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]

**Priority:** High / Medium / Low
**Story Points:** 1, 2, 3, 5, 8, 13 (Fibonacci scale)

---

## Example (fully completed)

As a user, I want to register for an account using my email and password, so that I can list items I no longer need and browse items shared by others.

**Acceptance Criteria:**
1. Given a new user visits the registration page, when they submit a valid email, first name, last name, and password, then a new account is created in the database.
2. Given an existing email is submitted, when the user tries to register, then the system returns an error message indicating the email is already in use.
3. Given a successful registration, when the account is created, then the password is stored securely as a hash (never as plain text).
4. Given a successful registration, when the account is created, then the user receives a session/token to remain authenticated.

**Priority:** High
**Story Points:** 5
