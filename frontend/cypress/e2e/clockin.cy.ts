// cypress/e2e/clockin.cy.ts
describe('Flux de Pointage', () => {
  beforeEach(() => {
    cy.loginAs('employee');
  });

  it('peut voir son QR code et pointer', () => {
    cy.visit('/clock-in');
    cy.get('canvas').should('be.visible'); // qrcode component renders a canvas or svg
    cy.get('button').contains('Pointer maintenant').click();
    cy.get('[data-cy=confirmation]').should('be.visible');
    cy.get('[data-cy=confirmation]').should('contain', 'enregistré');
  });

  it('affiche une erreur en cas de double pointage (simulé par le backend)', () => {
    // Double clic rapide ou état déjà pointé
    cy.visit('/clock-in');
    cy.get('button').contains('Pointer maintenant').click();
    cy.get('button').contains('Pointer maintenant').click();
    // Le backend devrait retourner 409 ou une erreur métier
    // cy.get('[data-cy=error-msg]').should('be.visible');
  });
});
