Feature: Navigate between pages

  Scenario: Directly display the properties of a deployed module from an URL
    Given an existing workingcopy module
    And an existing production platform with this module
    When I open an URL pointing to this deployed module
    Then the properties of this deployed module are displayed
