Feature: Creating modules

  Scenario: Create a new workingcopy module
    When I open the menu for creating new workingcopy modules
    And I submit valid values
    Then I am redirected to the newly created module page
    And I get a the following success notification: "The working copy of the module has been created"
