Feature: About menu

  Scenario: Check about modal
    When I open the menu to display information about the application
    Then I should see the modal with information about the release
    And I should be able to close the modal "about"
