Feature: Global properties diff

  Scenario: Open global properties diff page
    Given an existing platform named "P1"
    And an existing platform named "P2"
    When I open the platform "P1"
    And I open the modal to compare global properties
    And I select the platform to compare "P2"
    And I launch the diff of global properties
    Then I get a new page with the global properties diff

  Scenario: Open global properties stored values diff page
    Given an existing platform named "P1"
    And an existing platform named "P2"
    When I open the platform "P1"
    And I open the modal to compare global properties
    And I select the platform to compare "P2"
    And I select the global properties stored values comparison option
    And I launch the diff of global properties
    Then I get a new page with the global properties stored values diff

  Scenario: Open global properties diff with timestamp page
    Given an existing platform
    When I open this platform
    And I open the modal to compare global properties
    And I select a specific date to compare global properties
    And I launch the diff of global properties
    Then I get a new page with the global properties diff with timestamp

  Scenario: Get global properties final values diff
    Given an existing platform named "P1"
    And the platform has these global properties
      | p1-global        | only-p1      |
      | common-global    | common-value |
      | differing-global | p1-value     |
    And an existing platform named "P2"
    And the platform has these global properties
      | p2-global        | only-p2      |
      | common-global    | common-value |
      | differing-global | p2-value     |
    When I open the diff of global properties
    Then I get the following properties only on left platform
      | p1-global | only-p1 |
    And I get the following common properties
      | common-global | common-value |
    And I get the following differing properties
      | differing-global | p1-value | p2-value |
    And I get the following properties only on right platform
      | p2-global | only-p2 |

#  Scenario: Get global properties stored values diff

#  Scenario: Get detail of global properties final values diff

#  Scenario: Get detail of global properties stored values diff

#  Scenario: Filter diff properties
