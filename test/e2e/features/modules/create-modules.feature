Feature: Creating modules

  Scenario: Create a new workingcopy module
    When I open the menu for creating new workingcopy modules
    And I submit valid values
    Then I am redirected to the newly created module page
    And a message inform me of its successful creation
