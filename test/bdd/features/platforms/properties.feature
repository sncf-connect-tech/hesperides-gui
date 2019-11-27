Feature: Filter properties

  Scenario: Selectively display requested properties
    Given an existing module with required and not required properties
    And a platform with this module
    When I open the deployed module properties
    And I click on the switch to display nothing but the required properties
    Then only the required properties are displayed
