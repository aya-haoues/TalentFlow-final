class LoginPage {
    // Naviguer vers la page de login RH par défaut
    visit() {
        cy.visit('/login/rh');
    }

    // Méthode pour remplir l'email
    fillEmail(email: string) {
        cy.get('[data-testid="email-input"]')
            .should('be.visible')
            .clear()
            .type(email);
    }

    // Méthode pour remplir le mot de passe
    fillPassword(password: string) {
        cy.get('[data-testid="password-input"]')
            .should('be.visible')
            .clear()
            .type(password);
    }

    // Méthode pour cliquer sur le bouton de soumission
    submit() {
        cy.get('[data-testid="login-button"]').should('be.enabled').click();
    }

    // Méthode combinée pour le login rapide
    login(email: string, pass: string) {
        this.fillEmail(email);
        this.fillPassword(pass);
        this.submit();
    }
}

// On exporte une instance de la classe
export default new LoginPage();