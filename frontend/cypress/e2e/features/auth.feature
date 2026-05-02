Feature: Authentification RH
  As a RH user
  I want to connect to TalentFlow
  So I can access the dashboard

  Background:
    # On précise qu'on est sur la page de login spécifique aux RH
    Given I am on the login page

  Scenario: Login with valid credentials
    When I enter email "asma@gmail.com"
    And I enter password "As12345678"
    And I click on login button
    Then I should be redirected to the RH dashboard

  Scenario: Login with wrong password
    When I enter email "asma@gmail.com"
    And I enter password "wrongpassword"
    And I click on login button
    # Le message attendu sera "Email ou mot de passe incorrect" (défini dans vos steps)
    Then I should see an error message

  Scenario: Access protected route without login
    Given I am not logged in
    When I navigate to "/rh/dashboard"
    Then I should be redirected to login page

  Scenario: Logout
    # Ce step doit d'abord faire un login auto ou via l'UI sur /login/rh
    Given I am logged in as RH
    When I click on my avatar
    And I click on logout
    Then I should be redirected to login page