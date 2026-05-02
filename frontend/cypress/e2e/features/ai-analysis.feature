Feature: AI CV Analysis
  As a RH user
  I want to see AI analysis of a CV
  So I can quickly evaluate a candidate

  Scenario: AI score displayed after analysis
    Given I am logged in as RH
    And a candidate with analyzed CV exists
    When I open the candidate profile
    And I go to the Evaluation tab
    Then the AI score should be displayed between 0 and 100
    And the AI decision should be displayed

  Scenario: Candidate without AI analysis
    Given I am logged in as RH
    And a candidate without AI analysis exists
    When I open the Evaluation tab
    Then I should see the analysis pending message