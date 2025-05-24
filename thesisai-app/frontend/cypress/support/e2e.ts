// Cypress E2E support file

// Import commands
import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  return false;
});

// Add custom types
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createDocument(title: string, type: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}