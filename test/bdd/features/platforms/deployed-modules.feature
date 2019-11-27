Feature: Filter deployed modules

  Scenario: Keep deployed modules filter when switching platforms
    Given an existing module named "module-a"
    And an existing module named "module-b"
    And an existing platform named "P1" with those modules in different logical groups
    And an existing platform named "P2" with those modules in different logical groups
    When I open this application
    And I display the platform "P1"
    And I filter deployed modules on "module-a"
    And I display the platform "P2"
    Then the deployed module filter still contains "module-a"
    And there is only one deployed module displayed
