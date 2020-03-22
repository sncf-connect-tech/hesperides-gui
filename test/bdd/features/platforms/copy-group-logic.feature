Feature: Copy logic groups

  Scenario: Copy an existing logical group to a new logical group
    Given an existing module named "module-1"
    And an existing platform
    And I update this platform, adding module "module-1" to logical group "GROUP-1"
    And I open this platform
    When I click on the button to copy the logical group "GROUP-1"
    Then the option to copy the logical group to a new one is selected
    When I input the new logical group "GROUP-2#GROUP-2.1"
    And I click on the button to save the copy of this logical group
    Then I get the following success notification: "The platform has been updated"
    And the logical group copy modal is not closed
    When I click on the button to close the modal to copy a logical group
    Then the logical group copy modal is closed
    And the deployed module "module-1" is successfully copied to logical group "GROUP-2.1"

  Scenario: Copy the module of an existing logical group into another existing logical group
    Given an existing module named "module-1"
    And an existing module named "module-2"
    And an existing platform
    And I update this platform, adding module "module-1" to logical group "GROUP-1"
    And I update this platform, adding module "module-2" to logical group "GROUP-2"
    And I open this platform
    When I click on the button to copy the logical group "GROUP-1"
    And I chose the option to select an existing logical group
    And I select the existing logical group "GROUP-2"
    Then I can see the copy summary "The logic group GROUP-1 will be copied into logic group GROUP-2"
    When I click on the button to save the copy of this logical group
    Then I get the following success notification: "The platform has been updated"
    And the deployed module "module-1" is successfully copied to logical group "GROUP-2"

  Scenario: Trying to copy a logical group to an existing one with the same module should not be allowed
    Given an existing module named "module-1"
    And an existing platform
    And I update this platform, adding module "module-1" to logical group "GROUP-1"
    And I update this platform, adding module "module-1" to logical group "GROUP-2"
    And I open this platform
    When I click on the button to copy the logical group "GROUP-1"
    And I chose the option to select an existing logical group
    And I select the existing logical group "GROUP-2"
    And I click on the button to save the copy of this logical group
    Then I get the following notification: "The logic group #GROUP-2 already contains the same module(s)"

  Scenario: Copy the modules of a logical group to a logical group that has the modules but with a different version
    Given an existing module named "module-1" with version "1.0"
    And an existing module named "module-1" with version "2.0"
    And an existing platform
    And I update this platform, adding module "module-1" with version "1.0" to logical group "GROUP-1"
    And I update this platform, adding module "module-1" with version "2.0" to logical group "GROUP-2"
    And I open this platform
    When I click on the button to copy the logical group "GROUP-1"
    And I chose the option to select an existing logical group
    And I select the existing logical group "GROUP-2"
    And I click on the button to save the copy of this logical group and accept the alert
    And the deployed module "module-1" with version "2.0" is successfully copied to logical group "GROUP-2"
