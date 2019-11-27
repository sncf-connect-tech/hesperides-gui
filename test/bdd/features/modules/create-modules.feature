Feature: Create modules

  Scenario: Create a new workingcopy module
    When I open the module menu
    And I click on the button to create a new module
    And I submit valid values to create this module
    Then I am redirected to the newly created module page
    And I get the following success notification: "The working copy of the module has been created"
