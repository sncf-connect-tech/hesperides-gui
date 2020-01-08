Feature: Search technos

  Scenario: Search and open a techno
    Given an existing techno
    When I open the techno menu
    And I search and select this techno
    Then I am redirected to the selected techno page
