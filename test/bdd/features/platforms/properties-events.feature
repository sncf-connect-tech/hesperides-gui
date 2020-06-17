Feature: Properties events

  Scenario: Get properties events
    Given an existing workingcopy module named "module-a" with version "1.0"
    And an existing platform with this module
    And the platform has these valued properties
      | property-a | a1 |
      | property-b | b  |
    And the platform has these valued properties
      | property-a | a2 |
      | property-c | c  |
    And I open this platform
    When I open the module properties events
    Then the properties events modal title contains "module-a 1.0 (workingcopy)"
    And the properties events modal contains 2 events
    When I click on the properties events first panel title
    Then the properties events first panel has the following added properties
      | property-c | c |
    And the properties events first panel has the following updated properties
      | property-a | a1 | a2 |
    And the properties events first panel has the following removed properties
      | property-b | b |

  Scenario: Search properties events
    Given an existing module
    And an existing platform with this module
    And the platform has these valued properties
      | property-a | a1 |
      | property-b | b1 |
    And the platform has these valued properties
      | property-a | a2 |
      | property-b | b1 |
    And I open this platform
    When I open the module properties events
    Then the properties events modal contains 2 events
    When I search for "property-b" in the properties events
    Then the properties events modal contains 1 event

  Scenario: Expand and collapse all properties events
    Given an existing module
    And an existing platform with this module
    And the platform has these valued properties
      | property-a | a1 |
      | property-b | b1 |
    And the platform has these valued properties
      | property-a | a2 |
      | property-b | b1 |
    And I open this platform
    When I open the module properties events
    And I click on the switch to expand all properties events
    Then the properties events are expanded
    When I click on the switch to collapse all properties events
    Then the properties events are collapsed

  Scenario: Load more properties events
    Given an existing module
    And an existing platform with this module
    And the platform has a property that is updated 20 times
    And I open this platform
    When I open the module properties events
    Then the properties events modal contains 20 events
    And the button to load more properties events is enabled
    And the properties events modal doesn't contain the message that says there are no more events
    When I click on the button to load more properties events
    Then the properties events modal contains 21 events
    And the properties events modal contains the message that says there are no more events
    And the button to load more properties events is disabled

  Scenario: Close properties events modal
    Given an existing module
    And an existing platform with this module
    And I open this platform
    When I open the module properties events
    Then the properties events modal contains the message that says there are no events to display
    When I click on cross to close the properties events modal
    Then the properties events modal is closed
    When I open the module properties events
    And I click on bottom right corner button to close the properties events modal
    Then the properties events modal is closed

  Scenario: Launch diff from properties events
    Given an existing module
    And an existing platform with this module
    And the platform has these valued properties
      | property | 1 |
    And the platform has these valued properties
      | property | 2 |
    And the platform has these valued properties
      | property | 3 |
    And I open this platform
    When I open the module properties events
    Then the button to launch the diff from properties events is disabled
    And all the properties events checkboxes are enabled
    When I check the properties event at index 0
    Then the button to launch the diff from properties events is disabled
    And all the properties events checkboxes are enabled
    When I check the properties event at index 2
    Then the button to launch the diff from properties events is enabled
    And properties event checkbox at index 0 is enabled
    And properties event checkbox at index 1 is disabled
    And properties event checkbox at index 2 is enabled
    When I click on the button to launch the properties events diff
    Then I get a new page with the module properties diff with event timestamps at index 0 and 2

  Scenario: Get my properties events
    Given an existing module
    And an existing platform with this module
    And the platform has these valued properties
      | property | 1 |
    And the platform has these valued properties saved by production user with comment "property: 1 => 2"
      | property | 2 |
    And I open this platform
    When I open the module properties events
    Then the first properties event title contains "/ prod: property: 1 => 2"
    When I click on the switch to display only my properties events
    Then the properties events modal contains 1 event
