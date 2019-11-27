Feature: Search technos

  Scenario: Search and open a techno
    Given an existing techno
    When I open the techno menu
    And I search for this techno
    And I click on the first element of the list of technos
    Then I am redirected to the selected techno page
