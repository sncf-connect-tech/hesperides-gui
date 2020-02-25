Feature: Module properties diff

  Scenario: Open module properties diff page
    Given an existing module
    And an existing platform named "P1" with this module
    And an existing platform named "P2" with this module
    When I open the platform "P1"
    And I open the modal to compare this module properties
    And I select the platform to compare "P2"
    And I click on the NEXT button
    And I launch the diff of module properties
    Then I get a new page with the module properties diff between platform "P1" and platform "P2"

  Scenario: Open module properties stored values diff page
    Given an existing module
    And an existing platform named "P1" with this module
    And an existing platform named "P2" with this module
    When I open the platform "P1"
    And I open the modal to compare this module properties
    And I select the platform to compare "P2"
    And I select the module properties stored values comparison option
    And I click on the NEXT button
    And I launch the diff of module properties
    Then I get a new page with the module properties stored values diff between platform "P1" and platform "P2"

  Scenario: Open module properties diff with timestamp page
    Given an existing module
    And an existing platform with this module
    When I open this platform
    And I open the modal to compare this module properties
    And I select a specific date to compare this module properties
    And I click on the NEXT button
    Then I get the following notification: "Inexistant platform at this time for timestamp"

  Scenario: Select another module to compare with
    Given an existing module named "a"
    And an existing module named "b"
    And an existing platform with those modules
    When I open this platform
    And I open the modal to compare the module "a" properties
    And I click on the NEXT button
    And I choose module "b" to compare with the selected module
    And I launch the diff of module properties
    Then I get a new page with the module properties diff between module "a" and module "b"

  Scenario: Option to hide the deleted properties in the diff
    Given an existing template with this content
    """
    {{ property }}
    """
    And an existing module with this template
    And an existing platform named "P1" with this module
    And an existing platform named "P2" with this module
    And the platform has these valued properties
      | property | value |
    And I open this module
    And I delete a template of this module
    When I open the platform "P1"
    And I open the modal to compare this module properties
    And I select the platform to compare "P2"
    And I select the module properties stored values comparison option
    And I click on the NEXT button
    And I launch the diff of module properties
    And I click on the switch to hide deleted properties
    Then The deleted properties are successfully hidden
