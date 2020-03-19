Feature: Search modules

  Scenario: Search and open a module
    Given an existing module
    When I open the module menu
    And I search and select this module
    And I am redirected to the selected module page
    And I reopen the module menu
    And I search and select this module
    Then I am redirected to the selected module page
