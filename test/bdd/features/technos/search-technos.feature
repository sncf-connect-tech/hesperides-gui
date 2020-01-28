Feature: Search technos

  Scenario: Search and open a techno
    Given an existing techno
    When I open the techno menu
    And I search and select this techno in the menu
    Then I am redirected to the selected techno page

  # Issue 347
  Scenario: Search a techno has a '-' in its name
    Given an existing techno named "a-techno"
    When I open the techno menu
    And I search and select this techno in the menu
    Then I am redirected to the selected techno page

  # Issue 123
  Scenario: Indicating technos that are working-copy in the search results on the module page
    Given an existing techno named "a-techno"
    And an existing module
    When I open this module
    And I search and select this techno on the module page
    Then I get the following success notification: "The working copy of the module has been updated"
    And the first techno of this module is "a-techno 1.0 (working-copy)"
