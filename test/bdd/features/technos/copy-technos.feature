Feature: Copy technos

  Scenario: Copy a techno
    Given an existing techno with version "1.0"
    When I open the techno menu
    And I click on the button to create a copy of a techno
    And I submit valid values to copy the existing techno, setting the version to "2.0"
    Then I get the following success notification: "The working copy has been created"
    And the existing template is also copied
