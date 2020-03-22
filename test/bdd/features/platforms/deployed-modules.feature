Feature: Filter deployed modules

  Scenario: Keep deployed modules filter when switching platforms
    Given an existing module named "module-a"
    And an existing module named "module-b"
    And an existing platform named "P1"
    And I update this platform, adding module "module-a" to logical group "GROUP-1"
    And I update this platform, adding module "module-b" to logical group "GROUP-2"
    And an existing platform named "P2"
    And I update this platform, adding module "module-a" to logical group "GROUP-1"
    And I update this platform, adding module "module-b" to logical group "GROUP-2"
    When I open this application
    And I click on the platform "P1"
    And I filter deployed modules on "module-a"
    And I click on the platform "P2"
    Then the deployed module filter still contains "module-a"
    And there is only one deployed module displayed
