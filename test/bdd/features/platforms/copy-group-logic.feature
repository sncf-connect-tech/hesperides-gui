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
    When I copy this logic group "LOGIC-1" to a new logic group "NEW-LOGIC-GROUP"
    Then the deployed module "module-1" of logic group "LOGIC-1" are successful copied to logic group "NEW-LOGIC-GROUP"

   Scenario: Copy logic group to an existing logic group with same deployed modules should do nothing
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
     Then I do not get any "success" notification
