Feature: Add technos to modules

  Scenario: Add a techno to an existing module
    Given an existing techno
    And an existing module
    When I open this module
    And I add this techno to this module
    Then I get the following notification: "The working copy of the module has been updated"
    And the techno is successfully added to the module
