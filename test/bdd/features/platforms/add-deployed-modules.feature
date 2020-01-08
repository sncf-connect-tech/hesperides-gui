Feature: Add modules

  Scenario: Add a module to a logic group
    Given an existing module
    And an existing platform
    When I open this platform
    And I add a logic group to this platform
    And I add the existing module to this logic group
    Then I get the following success notification: "The platform has been updated"
    And the module is successfully added to the logic group
