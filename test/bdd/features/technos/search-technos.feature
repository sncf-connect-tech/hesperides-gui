Feature: Search technos

  Scenario: Search and open a techno
    Given an existing techno
    When I open the techno menu
    And I search and select this techno
    Then I am redirected to the selected techno page

  # Issue 347
  Scenario: Search a techno has a '-' in its name
    Given an existing techno named "a-techno"
    When I open the techno menu
    And I search and select this techno
    Then I am redirected to the selected techno page
