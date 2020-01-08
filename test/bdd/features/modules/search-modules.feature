Feature: Search modules

  Scenario: Search and open a module
    Given an existing module
    When I open the module menu
    And I search and select this module
    Then I am redirected to the selected module page
