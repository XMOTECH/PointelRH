// cypress/e2e/auth.cy.ts
describe('Authentification', () => {
  it('login manager → redirect dashboard', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('admin@test.com');
    cy.get('[data-cy=password]').type('password');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Tableau de bord');
  });

  it('login employe → redirect clock-in', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('amadou@pointel.sn');
    cy.get('[data-cy=password]').type('password');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/clock-in');
    cy.get('p').should('contain', 'Mon QR code de pointage');
  });

  it('token expire → redirect login', () => {
    // Simuler un accès sans token
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});
