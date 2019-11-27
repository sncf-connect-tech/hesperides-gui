Feature: Delete techno templates

  Scenario: Delete a template
    Given an existing techno with a template
    When I open this techno
    And I delete a template of this techno
    Then I get the following success notification: "The template has been deleted"
    And the template is successfully deleted from the techno
