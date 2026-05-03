Feature: Job application submission
  As a logged-in candidate on TalentFlow
  I want to apply for a job offer
  In order to submit my application to the HR team

  Background:
    Given the candidate is logged in

  @SCRUM-28
  Scenario: Successful submission of a complete application
    Given the candidate is on the application page for job "job-test-id-123"
    When they expand all panels
    And they upload their PDF CV
    And they fill in personal information
    And they fill in the birth date
    And they fill in genre and nationality
    And they fill in motivation and contract type
    And they submit the application successfully
    Then the application is submitted successfully
    And they are redirected to their dashboard

  @SCRUM-29
  Scenario: Job title is displayed in the header
    Given the candidate is on the application page for job "job-test-id-123"
    Then the job title is displayed in the header

  @SCRUM-30
  Scenario: The form is pre-filled with user profile data
    Given the candidate is on the application page for job "job-test-id-123"
    When they expand all panels
    Then the form is pre-filled with profile data

  @SCRUM-31
  Scenario: Opening and closing all panels
    Given the candidate is on the application page for job "job-test-id-123"
    When they expand all panels
    Then all panels are open
    When they click the back button after making changes
    Then a confirmation modal appears before leaving

  @SCRUM-32
  Scenario: Validation error when CV is missing
    Given the candidate is on the application page for job "job-test-id-123"
    When they expand all panels
    And they fill in personal information
    And they fill in the birth date
    And they fill in genre and nationality
    And they fill in motivation and contract type
    And they try to submit without a CV
    Then a CV validation error is displayed

  @SCRUM-33
  Scenario: Warning message if the candidate has already applied
    Given the candidate is on the application page for job "job-test-id-123"
    When they expand all panels
    And they upload their PDF CV
    And they fill in personal information
    And they fill in the birth date
    And they fill in genre and nationality
    And they fill in motivation and contract type
    And they submit and get an already applied error
    Then an already applied error is displayed