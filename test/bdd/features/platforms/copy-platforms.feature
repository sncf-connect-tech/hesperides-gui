Feature: Copy platforms

  Scenario: Copy a platform
    Given an existing module
    And an existing platform with this module
    When I open the application menu
    And I click on the button to create a copy of a platform
    And I submit valid values to copy the existing platform
    Then I am redirected to the newly created platform page
    And I get the following success notification: "The platform has been created"
    And the platform's module is also copied
