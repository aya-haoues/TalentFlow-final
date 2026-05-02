/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsCandidate(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAsCandidate', () => {
  cy.session('candidate-session', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('haouesaya85@gmail.com');
    cy.get('[data-testid="password-input"]').type('Aya123456');
    cy.get('[data-testid="login-button"]').click();

    // Validation de la connexion
    cy.url().should('include', '/candidat/dashboard');
  }, {
    cacheAcrossSpecs: true
  });
});