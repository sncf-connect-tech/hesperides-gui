Feature: Create platforms

  Scenario: Create a new platform
    When I open the application menu
    And I click on the button to create a new platform
    And I submit valid values to create this platform
    Then I am redirected to the newly created platform page
    And I get the following success notification: "The platform has been created"
