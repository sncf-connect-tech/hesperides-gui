Feature: Search modules

  Scenario: Search and open a module
    Given an existing module
    When I open the module menu
    And I search for this module
    And I click on the first element of the list of modules
    Then I am redirected to the selected module page
