Feature: Create platforms

  Scenario: Create a new platform
    When I open the application menu
    And I click on the button to create a new platform
    And I submit valid values to create this platform
    Then I am redirected to the newly created platform page
    And I get the following success notification: "The platform has been created"

  Scenario: Creating a production platform is not allowed to a lambda user
    When I open the application menu
    And I click on the button to create a new platform
    Then the switch to create a production platform should be disabled

  Scenario: Creating a production platform from another one is not allowed to a lambda user
    When I open the application menu
    And I click on the button to create a new platform from another one
    Then the switch to create a production platform from another one should be disabled

  Scenario: Defining an existing platform as production platform is not allowed to a lambda user
    And an existing platform
    When I open this platform
    Then the switch to define the platform as a production should be disabled
