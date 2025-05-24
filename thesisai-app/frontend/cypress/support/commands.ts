// Custom Cypress Commands

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createDocument', (title: string, type: string) => {
  cy.get('button').contains('New Document').click();
  cy.get('input[placeholder="My Academic Paper"]').type(title);
  cy.get('select').select(type);
  cy.get('button').contains('Create').click();
  cy.url().should('include', '/editor/');
});

Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Logout').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});