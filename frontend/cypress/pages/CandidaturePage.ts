class CandidaturePage {

  visit(jobId: string) {
    cy.visit(`/jobs/${jobId}/apply`);
  }

  expandAll() {
    cy.get('button[title="Tout ouvrir"]').click();
    cy.get('input[placeholder="Votre nom"]', { timeout: 8000 }).should('be.visible');
  }

  uploadCV(fileName: string) {
    cy.get('input[type="file"]').selectFile(
      `cypress/fixtures/${fileName}`,
      { force: true }
    );
    cy.contains(fileName, { timeout: 4000 }).should('exist');
  }

  fillPersonalInfo() {
    cy.get('input[placeholder="Votre nom"]').clear().type('Aya');
    cy.get('input[placeholder="Votre prénom"]').clear().type('Haoues');
    cy.get('input[placeholder="votre@email.com"]').clear().type('haouesaya85@gmail.com');
    cy.get('input[placeholder="+216 XX XXX XXX"]').clear().type('50123456');
  }

  fillBirthDate() {
    cy.contains('Date de naissance')
      .closest('.ant-form-item')
      .find('.ant-picker input')
      .click()
      .clear()
      .type('01/01/2000');
    cy.get('body').type('{esc}');
  }

  fillGenreAndNationality() {
  // 1. On trouve l'input par son ID, on remonte au conteneur global du Select et on clique
  cy.get('#personal_info_genre', { timeout: 8000 })
    .closest('.ant-select') // .closest() est souvent plus précis que .parents().first()
    .click(); 

  // 2. On attend que la dropdown soit visible et on sélectionne l'option
  // Utiliser document body pour s'assurer qu'on ne cherche pas dans le panel de l'accordéon
  cy.get('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .should('be.visible')
    .contains('Femme')
    .click();

  cy.get('input[placeholder="Ex: Tunisienne"]').clear().type('Tunisienne');
}

fillMotivationAndContract() {
  cy.get('textarea[placeholder*="Qu\'est-ce qui vous attire"]', { timeout: 8000 })
    .should('be.visible')
    .clear()
    .type('J\'admire votre culture d\'entreprise axée sur l\'agilité et l\'apprentissage continu. TalentFlow représente pour moi l\'opportunité idéale de relever des défis techniques stimulants au sein d\'une équipe innovante.');

  // Même logique corrigée pour le type de contrat
  cy.get('#contract_type')
    .closest('.ant-select')
    .click();

  // Dans CandidaturePage.ts
cy.get('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
  .contains('.ant-select-item-option', 'CDI')
  .click({ force: true });
}

  submit() {
    cy.contains('button', 'Postuler').click();
  }

  assertPreFilled() {
    cy.get('input[placeholder="Votre nom"]').should('not.have.value', '');
    cy.get('input[placeholder="votre@email.com"]')
      .should('have.value', 'haouesaya85@gmail.com');
  }

  modifyForm() {
    cy.get('input[placeholder="Votre nom"]', { timeout: 6000 })
      .should('be.visible')
      .clear()
      .type('Modified');
  }

  clickBack() {
    cy.contains("Retour à l'offre").click();
  }
}

export default CandidaturePage;