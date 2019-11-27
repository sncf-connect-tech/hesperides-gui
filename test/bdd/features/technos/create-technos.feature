Feature: Creating technos

  Scenario: Create a new techno
    When I open the menu for creating a new techno
    And I submit valid techno values
    And I add a new template to this techno
    Then I get the following success notification: "The template has been created"
    And the template is successfully added to the techno

