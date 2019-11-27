Feature: Add module templates

  Scenario: Add a template to an existing module
    Given an existing module
    When I open this module
    And I add a new template to this module
    Then I get the following success notification: "The template has been created"
    And the template is successfully added to the module
