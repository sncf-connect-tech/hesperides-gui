Feature: Copy modules

  Scenario: Copy a module
    Given an existing module named "module-test" with version "1.0" and a template
    When I open the module menu
    And I click on the button to create a copy of a module
    And I submit valid values to copy the existing module, setting the version to "2.0"
    Then I am redirected to the newly created module page
    And I get the following success notification: "The working copy module-test, 2.0 has been created"
    And the existing template is also copied
