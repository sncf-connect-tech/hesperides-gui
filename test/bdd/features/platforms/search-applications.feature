Feature: Search applications

  Scenario: Search and open an application
    Given an existing application
    When I open the application menu
    And I search and select this application
    And I am redirected to the selected application page
    And I reopen the application menu
    And I search and select this application
    Then I am redirected to the selected application page
