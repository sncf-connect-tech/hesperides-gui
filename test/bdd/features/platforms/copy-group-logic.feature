Feature: Copy logic groups

  Scenario: Copy a logic group to an existing logic group
    Given an existing template with this content
    """
    {{ property-1 }}
    {{ property-2 }}
    """
    And an existing module named "module-2" with this template
    And an existing module named "module-1" with this template
    And an existing platform
    And I open this platform
    And I add a logic group "LOGIC-1" to this platform
    And I add the existing module named "module-1" to logic group "LOGIC-1"
    And I get the following success notification: "The platform has been updated"
    And I add a logic group "LOGIC-2" to this platform
    And I add the existing module named "module-2" to logic group "LOGIC-2"
    And I get the following success notification: "The platform has been updated"
    When I copy this logic group "LOGIC-1" to the existing logic group "LOGIC-2"
    And I get the following success notification: "The platform has been updated"
    Then  the deployed module "module-1" of logic group "LOGIC-1" are successful copied to logic group "LOGIC-2"

  Scenario:  Copy a logic group to a new logic group
    Given an existing module named "module-1"
    And an existing platform
    And I open this platform
    And I add a logic group "LOGIC-1" to this platform
    And I add the existing module named "module-1" to logic group "LOGIC-1"
    And I get the following success notification: "The platform has been updated"
    When I copy this logic group "LOGIC-1" to a new logic group "LOGIC-GROUP#NEW-LOGIC-GROUP"
    Then the deployed module "module-1" of logic group "LOGIC-1" are successful copied to logic group "NEW-LOGIC-GROUP"

  Scenario: Copy logic group to an existing logic group with same deployed modules should display warning notification
    Given an existing module named "module-1"
    And an existing platform
    And I open this platform
    And I add a logic group "LOGIC-1" to this platform
    And I add the existing module named "module-1" to logic group "LOGIC-1"
    And I get the following success notification: "The platform has been updated"
    And I add a logic group "LOGIC-2" to this platform
    And I add the existing module named "module-1" to logic group "LOGIC-2"
    And I get the following success notification: "The platform has been updated"
    When I copy this logic group "LOGIC-1" to the existing logic group "LOGIC-2"
    Then I get the following "warn" notification: "The logic groups already contains the same modules"
    And I do not get any "success" notification
    And I do not get any "error" notification

  Scenario:  Copy logic group to an existing logic group with same deployed modules names but different versions or releaseType
    Given an existing module named "module-1" with version "1.0"
    And an existing module named "module-1" with version "2.0"
    And an existing platform
    And I open this platform
    And I add a logic group "LOGIC-1" to this platform
    And I add the existing module named "module-1 1.0" to logic group "LOGIC-1"
    And I get the following success notification: "The platform has been updated"
    And I add a logic group "LOGIC-GROUP#LOGIC-2" to this platform
    And I add the existing module named "module-1 2.0" to logic group "LOGIC-2"
    And I get the following success notification: "The platform has been updated"
    When I copy this logic group "LOGIC-1" to the existing logic group "LOGIC-2" with the same module name
    Then the deployed module "module-1" with version "2.0" is successful copied to logic group "LOGIC-2"
