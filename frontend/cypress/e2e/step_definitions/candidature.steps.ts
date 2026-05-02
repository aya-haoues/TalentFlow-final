
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import CandidaturePage from "../../pages/CandidaturePage";

const page = new CandidaturePage();

// ─────────────────────────────────────────────
// GIVEN
// ─────────────────────────────────────────────

Given("the candidate is logged in", () => {
  cy.loginAsCandidate();
});

Given(
  "the candidate is on the application page for job {string}",
  (jobId: string) => {
    cy.intercept("GET", `**/jobs/${jobId}`, {
      statusCode: 200,
      body: {
        success: true,
        data: { id: jobId, titre: "Développeur Fullstack" },
      },
    }).as("getJob");

    cy.visit(`/jobs/${jobId}/apply`);
    cy.wait("@getJob");
    cy.contains("Développeur Fullstack", { timeout: 6000 }).should("exist");
  }
);

// ─────────────────────────────────────────────
// WHEN
// ─────────────────────────────────────────────

When("they expand all panels", () => {
  page.expandAll();
});

When("they upload their PDF CV", () => {
  page.uploadCV("cv.pdf");
});

When("they fill in personal information", () => {
  page.fillPersonalInfo();
});

When("they fill in the birth date", () => {
  page.fillBirthDate();
});

When("they fill in genre and nationality", () => {
  page.fillGenreAndNationality();
});

When("they fill in motivation and contract type", () => {
  page.fillMotivationAndContract();
});

When("they submit the application successfully", () => {
  cy.intercept("POST", "**/applications", {
    statusCode: 201,
    body: { success: true, message: "Candidature envoyée avec succès !" },
  }).as("submitSuccess");

  page.submit();
  cy.wait("@submitSuccess");
});

When("they try to submit without a CV", () => {
  page.submit();
});

When("they submit and get an already applied error", () => {
  cy.intercept("POST", "**/applications", {
    statusCode: 422,
    body: {
      success: false,
      message: "Vous avez déjà postulé à cette offre.",
    },
  }).as("submitDuplicate");

  page.submit();
  cy.wait("@submitDuplicate");
});

When("they click the back button after making changes", () => {
  page.modifyForm();
  page.clickBack();
});

// ─────────────────────────────────────────────
// THEN
// ─────────────────────────────────────────────

Then("the application is submitted successfully", () => {
  cy.contains("Candidature envoyée", { timeout: 8000 }).should("exist");
});

Then("they are redirected to their dashboard", () => {
  // Remplacer "OK" par le texte visible sur ton bouton
  cy.contains("Voir mon tableau de bord").click();
  
  // Vérification de l'URL après le clic
  cy.url({ timeout: 8000 }).should("include", "/candidat/dashboard");
});

Then("the job title is displayed in the header", () => {
  cy.contains("Développeur Fullstack").should("be.visible");
});

Then("the form is pre-filled with profile data", () => {
  page.assertPreFilled();
});

Then("all panels are open", () => {
  cy.get(".ant-collapse-item-active").should("have.length.at.least", 1);
});


Then("a confirmation modal appears before leaving", () => {
  // Ant Design anime la modal — on attend le contenu, pas la visibilité du parent
  cy.contains("Quitter la page ?", { timeout: 6000 }).should("exist");
  cy.contains("Vos modifications ne seront pas sauvegardées.").should("exist");
});

Then("a CV validation error is displayed", () => {
  cy.contains("Veuillez joindre votre CV", { timeout: 4000 }).should("exist");
});

Then("an already applied error is displayed", () => {
  cy.contains("déjà postulé", { timeout: 4000 }).should("exist");
});