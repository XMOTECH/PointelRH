// cypress/support/commands.ts
Cypress.Commands.add('loginAs', (role: 'manager' | 'employee') => {
  const credentials = {
    manager:  { email: 'admin@test.com',   password: 'password' },
    employee: { email: 'amadou@pointel.sn', password: 'password' },
  };

  const { email, password } = credentials[role];

  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password })
    .then(({ body }) => {
      window.sessionStorage.setItem('access_token', body.access_token);
    });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'manager' | 'employee'): Chainable<void>;
    }
  }
}

export {};
