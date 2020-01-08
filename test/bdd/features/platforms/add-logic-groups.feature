Feature: Add logic groups

  Scenario: Add a logic group to a logic group
    Given an existing module
    And an existing platform
    When I open this platform
    And I add a logic group to this platform
    When I add a logic group to this logic group
    Then the logic group is successfully added

  Scenario: Add several logic groups at once
    Given an existing module
    And an existing platform
    When I open this platform
    And I add several logic groups at once to this platform
    Then the logic groups are successfully added
