import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

Given('a candidate with analyzed CV exists', () => {
    cy.log('Candidature avec analyse IA disponible en base')
})

Given('a candidate without AI analysis exists', () => {
    cy.log('Candidature sans analyse IA disponible')
})

When('I open the candidate profile', () => {
    cy.visit('/rh/candidats')
    cy.get('[data-testid="view-profile"]').first().click()
})

When('I go to the Evaluation tab', () => {
    cy.contains('Évaluation').click()
})

Then('the AI score should be displayed between 0 and 100', () => {
    cy.contains('Score Match').should('be.visible')
})

Then('the AI decision should be displayed', () => {
    cy.contains(/Recommandé|Fortement recommandé|À revoir|Non retenu/).should('be.visible')
})

Then('I should see the analysis pending message', () => {
    cy.contains("analyse automatique par l'IA est en cours").should('be.visible')
})