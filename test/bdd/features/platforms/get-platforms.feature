Feature: Get platforms

  Scenario: Get production platform with workingcopy module
    Given an existing workingcopy module
    And an existing production platform with this module
    When I open this platform as a production user
    Then I get a warning message saying that the platform has a workingcopy module
