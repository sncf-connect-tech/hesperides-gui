Feature: Platform events

  Scenario: Get platform events
    Given an existing workingcopy module named "module-1" with version "1.0"
    And an existing workingcopy module named "module-1" with version "2.0"
    And an existing platform named "DEV" with application name "APP"
    And I update this platform, adding module "module-1" with version "1.0" to logical group "GROUP1#GROUP2"
    And I update this platform, setting module "module-1" version to "2.0"
    And I update this platform version to "2"
    And I update this platform, removing module "module-1"
    And I open this platform
    When I open the platform events modal
    Then the platform events modal title is "History of platform APP / DEV"
    And the platform events modal contains 5 events
    When I click on the switch to expand all platform events
    Then the changes of the platform event at index 0 contain "Module deleted: GROUP1 / GROUP2 / module-1 2.0 (workingcopy)"
    Then the changes of the platform event at index 1 contain "Platform version updated: 1.0 => 2"
    Then the changes of the platform event at index 2 contain "Module updated: GROUP1 / GROUP2 / module-1 1.0 (workingcopy) => GROUP1 / GROUP2 / module-1 2.0 (workingcopy)"
    Then the changes of the platform event at index 3 contain "Module added: GROUP1 / GROUP2 / module-1 1.0 (workingcopy)"
    Then the changes of the platform event at index 4 contain "Platform creation"

  Scenario: Search platform events
    Given an existing workingcopy module named "module-1"
    And an existing platform
    And I update this platform, adding module "module-1" with version "1.0" to logical group "GROUP-1"
    And I open this platform
    When I open the platform events modal
    Then the platform events modal contains 2 events
    When I search for "module-1" in the platform events
    Then the platform events modal contains 1 event

  Scenario: Expand and collapse all platform events
    Given an existing workingcopy module named "module-1"
    And an existing platform
    And I update this platform, adding module "module-1" with version "1.0" to logical group "GROUP-1"
    And I open this platform
    When I open the platform events modal
    And I click on the switch to expand all platform events
    Then the platform events are expanded
    When I click on the switch to collapse all platform events
    Then the platform events are collapsed

  Scenario: Events with multiple changes
    Given an existing workingcopy module named "module-1" with version "1.0"
    And an existing platform with this module
    And I open this platform
    When I open the platform events modal
    Then the platform events modal contains 1 event
    When I click on the platform events first panel title
    Then the changes of the platform event at index 0 contain "module-1 1.0 (workingcopy)"
    Then the changes of the platform event at index 0 contain "Platform creation"

  Scenario: Load more platform events
    And an existing platform
    And the platform version is updated 20 times
    And I open this platform
    When I open the platform events modal
    Then the platform events modal contains 20 events
    And the button to load more platform events is enabled
    And the platform events modal doesn't contain the message that says there are no more events
    When I click on the button to load more platform events
    Then the platform events modal contains 21 events
    And the platform events modal contains the message that says there are no more events
    And the button to load more platform events is disabled

  Scenario: Close platform events modal
    Given an existing platform
    And I open this platform
    When I open the platform events modal
    When I click on cross to close the platform events modal
    Then the platform events modal is closed
    When I open the platform events modal
    And I click on bottom right corner button to close the platform events modal
    Then the platform events modal is closed

  Scenario: Launch diff from platform events
    Given an existing platform
    And I update this platform version to "2"
    And I update this platform version to "3"
    And I open this platform
    When I open the platform events modal
    Then the button to launch the diff from platform events is disabled
    And all the platform events checkboxes are enabled
    When I check the platform event at index 0
    Then the button to launch the diff from platform events is disabled
    And all the platform events checkboxes are enabled
    When I check the platform event at index 2
    Then the button to launch the diff from platform events is enabled
    And platform event checkbox at index 0 is enabled
    And platform event checkbox at index 1 is disabled
    And platform event checkbox at index 2 is enabled
    When I click on the button to launch the platform events diff
    Then I get a new page with the global properties diff with event timestamps at index 0 and 2

  Scenario: Get my platform events
    Given an existing platform
    And I update this platform version to "2" as production user
    And I open this platform
    When I open the platform events modal
    Then the first platform event title contains "/ prod"
    When I click on the switch to display only my platform events
    Then the platform events modal contains 1 event
