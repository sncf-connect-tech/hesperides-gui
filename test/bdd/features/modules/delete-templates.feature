Feature: Delete module templates

  Scenario: Delete a template
    Given an existing module with a template
    When I open this module
    And I delete a template of this module
    Then I get the following success notification: "The template has been deleted"
    And the template is successfully deleted from the module
