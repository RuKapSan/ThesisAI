describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display home page with login and signup options', () => {
    cy.contains('ThesisAI').should('be.visible');
    cy.contains('Write Better Academic Papers with AI').should('be.visible');
    cy.get('a').contains('Login').should('be.visible');
    cy.get('a').contains('Get Started').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.get('a').contains('Get Started').click();
    cy.url().should('include', '/register');
    cy.contains('Create Account').should('be.visible');
  });

  it('should register a new user successfully', () => {
    cy.visit('/register');
    
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    
    cy.get('input[type="text"]').type('Test User');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    
    cy.intercept('POST', '**/auth/register', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          id: 'user-123',
          email: email,
          name: 'Test User',
          role: 'STUDENT'
        }
      }
    }).as('register');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@register');
    cy.url().should('include', '/dashboard');
    cy.contains('Hello, Test User').should('be.visible');
  });

  it('should show error for mismatched passwords', () => {
    cy.visit('/register');
    
    cy.get('input[type="text"]').type('Test User');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('differentpassword');
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.visit('/login');
    
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'STUDENT'
        }
      }
    }).as('login');
    
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
    cy.contains('My Documents').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid credentials'
      }
    }).as('loginError');
    
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginError');
    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    // First login
    cy.visit('/login');
    
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'STUDENT'
        }
      }
    }).as('login');
    
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login');
    
    // Then logout
    cy.get('button').contains('Logout').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Write Better Academic Papers with AI').should('be.visible');
  });

  it('should persist authentication across page reloads', () => {
    cy.visit('/login');
    
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'STUDENT'
        }
      }
    }).as('login');
    
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
    
    // Reload page
    cy.reload();
    
    // Should still be on dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('My Documents').should('be.visible');
  });
});