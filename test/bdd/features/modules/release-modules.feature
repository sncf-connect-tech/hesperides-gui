Feature: Release modules

  Scenario: Release a module
    Given an existing workingcopy module named "module-test" with version "1.0" and a template
    When I open this module
    And I click on the button to create the release of this module
    And I submit the module release version
    Then I am redirected to the released module page
    And I get the following success notification: "The release module-test, 1.0 has been created"
    And the existing template is also released
