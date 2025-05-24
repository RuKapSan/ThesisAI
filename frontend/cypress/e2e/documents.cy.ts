describe('Document Management', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: 'mock-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'STUDENT'
          },
          isAuthenticated: true
        }
      }));
    });

    // Mock API responses
    cy.intercept('GET', '**/documents', {
      statusCode: 200,
      body: []
    }).as('getDocuments');
  });

  it('should display empty state when no documents exist', () => {
    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    cy.contains('No documents yet').should('be.visible');
    cy.contains('Create your first document').should('be.visible');
  });

  it('should create a new document', () => {
    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    cy.intercept('POST', '**/documents', {
      statusCode: 200,
      body: {
        id: 'doc-123',
        title: 'My Thesis',
        content: '# My Thesis\n\n',
        type: 'THESIS',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('createDocument');

    cy.intercept('GET', '**/documents/doc-123', {
      statusCode: 200,
      body: {
        id: 'doc-123',
        title: 'My Thesis',
        content: '# My Thesis\n\n',
        type: 'THESIS',
        userId: 'user-123',
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getDocument');
    
    cy.get('button').contains('New Document').click();
    cy.get('input[placeholder="My Academic Paper"]').type('My Thesis');
    cy.get('select').select('THESIS');
    cy.get('button').contains('Create').click();
    
    cy.wait('@createDocument');
    cy.url().should('include', '/editor/doc-123');
  });

  it('should display list of documents', () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Research Paper',
        type: 'COURSEWORK',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'doc-2',
        title: 'Final Thesis',
        type: 'THESIS',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    cy.intercept('GET', '**/documents', {
      statusCode: 200,
      body: mockDocuments
    }).as('getDocumentsWithData');

    cy.visit('/dashboard');
    cy.wait('@getDocumentsWithData');
    
    cy.contains('Research Paper').should('be.visible');
    cy.contains('COURSEWORK').should('be.visible');
    cy.contains('Final Thesis').should('be.visible');
    cy.contains('THESIS').should('be.visible');
  });

  it('should navigate to document editor', () => {
    cy.intercept('GET', '**/documents', {
      statusCode: 200,
      body: [{
        id: 'doc-1',
        title: 'Test Document',
        type: 'ESSAY',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }]
    }).as('getDocuments');

    cy.intercept('GET', '**/documents/doc-1', {
      statusCode: 200,
      body: {
        id: 'doc-1',
        title: 'Test Document',
        content: '# Test Document\n\nContent here',
        type: 'ESSAY',
        userId: 'user-123',
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getDocument');

    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    cy.contains('Test Document').parent().parent().find('a').contains('Edit').click();
    
    cy.wait('@getDocument');
    cy.url().should('include', '/editor/doc-1');
    cy.contains('Test Document').should('be.visible');
  });

  it('should delete a document', () => {
    cy.intercept('GET', '**/documents', {
      statusCode: 200,
      body: [{
        id: 'doc-to-delete',
        title: 'Document to Delete',
        type: 'REPORT',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }]
    }).as('getDocuments');

    cy.intercept('DELETE', '**/documents/doc-to-delete', {
      statusCode: 200,
      body: { message: 'Document deleted successfully' }
    }).as('deleteDocument');

    cy.intercept('GET', '**/documents', {
      statusCode: 200,
      body: []
    }).as('getDocumentsAfterDelete');

    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    // Stub window.confirm
    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(true);
    });
    
    cy.contains('Document to Delete').parent().parent().find('button[class*="btn-secondary"]').click();
    
    cy.wait('@deleteDocument');
    cy.wait('@getDocumentsAfterDelete');
    
    cy.contains('No documents yet').should('be.visible');
  });

  it('should cancel document deletion', () => {
    cy.intercept('GET', '**/documents', {
      statusCode: 200,
      body: [{
        id: 'doc-1',
        title: 'Keep This Document',
        type: 'ARTICLE',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }]
    }).as('getDocuments');

    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    // Stub window.confirm to return false
    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(false);
    });
    
    cy.contains('Keep This Document').parent().parent().find('button[class*="btn-secondary"]').click();
    
    // Document should still be visible
    cy.contains('Keep This Document').should('be.visible');
  });

  it('should handle document creation errors', () => {
    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    cy.intercept('POST', '**/documents', {
      statusCode: 500,
      body: { error: 'Failed to create document' }
    }).as('createDocumentError');
    
    cy.get('button').contains('New Document').click();
    cy.get('input[placeholder="My Academic Paper"]').type('Failed Document');
    cy.get('select').select('ESSAY');
    cy.get('button').contains('Create').click();
    
    cy.wait('@createDocumentError');
    cy.contains('Failed to create document').should('be.visible');
  });

  it('should close new document modal on cancel', () => {
    cy.visit('/dashboard');
    cy.wait('@getDocuments');
    
    cy.get('button').contains('New Document').click();
    cy.contains('New Document').should('be.visible');
    
    cy.get('button').contains('Cancel').click();
    cy.contains('New Document').should('not.exist');
  });
});