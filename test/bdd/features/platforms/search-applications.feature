Feature: Search applications

  Scenario: Search and open an application
    Given an existing application
    When I open the application menu
    And I search for this application
    And I click on the first element of the list of applications
    Then I am redirected to the selected application page
