Feature: Remove technos from modules

  Scenario: Remove a techno from a module
    Given an existing techno
    And an existing module with this techno
    When I open this module
    And I remove this techno from this module
    Then I get the following notification: "The working copy of the module has been updated"
    And the techno is successfully removed from the module
