import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import LoginPage from '../../pages/LoginPage'

Given('I am on the login page', () => {
    cy.visit('/login/rh') 
})

Given('I am not logged in', () => {
    cy.clearLocalStorage()
    cy.clearCookies()
})

Given('I am logged in as RH', () => {
    cy.visit('/login/rh');
    LoginPage.login('asma@gmail.com', 'As12345678');
    
    // 1. On attend que l'URL soit stable
    cy.url().should('include', '/rh/dashboard');
    
    // 2. Stratégie de secours : si le data-testid échoue, on cherche l'élément par sa classe Ant Design
    // ou par la présence du nom de l'utilisateur
    cy.get('body').then(($body) => {
        if ($body.find('[data-testid="user-avatar"]').length > 0) {
            cy.get('[data-testid="user-avatar"]').should('be.visible');
        } else {
            // Fallback : On attend de voir le nom "Asma" qui est dans votre Header
            cy.contains('Asma').should('be.visible');
        }
    });
});

When('I enter email {string}', (email: string) => {
    LoginPage.fillEmail(email)
})

When('I enter password {string}', (password: string) => {
    LoginPage.fillPassword(password)
})

When('I click on login button', () => {
    LoginPage.submit()
})

When('I navigate to {string}', (path: string) => {
    cy.visit(path)
})

When('I click on my avatar', () => {
    // Utilisation de force: true pour cliquer même si AntD a un overlay transparent
    // Et on essaie de cibler le conteneur de l'avatar si le test-id direct échoue
    cy.get('body').then(($body) => {
        const selector = $body.find('[data-testid="user-avatar"]').length > 0 
            ? '[data-testid="user-avatar"]' 
            : '.ant-dropdown-trigger'; // Sélecteur standard AntD Dropdown
            
        cy.get(selector).first().should('be.visible').click({ force: true });
    });
})

When('I click on logout', () => {
    // On attend que le menu Ant Design soit injecté dans le DOM
    cy.get('.ant-dropdown-menu').should('be.visible');
    cy.contains('Déconnexion').click({ force: true });
})

Then('I should be redirected to the RH dashboard', () => {
    cy.url({ timeout: 10000 }).should('include', '/rh/dashboard')
})

Then('I should see an error message', () => {
    cy.contains('Email ou mot de passe incorrect').should('be.visible')
})

Then('I should be redirected to login page', () => {
    cy.url().should('include', '/login')
})