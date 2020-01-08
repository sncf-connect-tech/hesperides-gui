Feature: Add instances

  Scenario: Add an instance to a deployed module
    Given an existing module
    And an existing platform with this module
    When I open this platform
    And I add an instance to this module
    Then I get the following success notification: "The platform has been updated"
    And the instance is successfully to the module
