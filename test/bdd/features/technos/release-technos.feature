Feature: Release technos

  Scenario: Release a techno
    Given an existing workingcopy techno named "techno-test" with version "1.0" and a template
    When I open this techno
    And I click on the button to create the release of this techno
    Then I am redirected to the released techno page
    And I get the following success notification: "The release techno-test, 1.0 has been created"
    And the existing template is also released
