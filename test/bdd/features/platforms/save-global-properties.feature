Feature: Save global properties

  Scenario: Save a global property
    Given an existing platform
    When I open this platform
    And I click on the button to edit global properties
    And I enter the following global properties
      | global-property   | global-value   |
    And I save the global properties
    Then I get the following success notification: "The properties have been saved"
