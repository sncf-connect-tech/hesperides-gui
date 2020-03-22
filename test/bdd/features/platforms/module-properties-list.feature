Feature: Filter properties and display them as a list

  Scenario: Filter only requested properties
    Given an existing module with required and not required properties
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I click on the switch to display nothing but the required properties
    Then only the required properties are displayed

  # Issue 350
  Scenario: Properly display required properties when there are lots of properties
    Given an existing template with 20 properties and one required property
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    Then the property "required-property" is not displayed
    And I click on the switch to display nothing but the required properties
    Then the property "required-property" is displayed

  # Issue 363
  Scenario: Display also deleted properties
    Given an existing module
    And an existing platform with this module
    And the platform has these valued properties
      | property | value |
    When I open this platform
    And I open the deployed module properties
    Then the property "property" is not displayed
    And I click on the switch to also display the deleted properties
    Then the property "property" is displayed

  Scenario: Display a dedicated icon for each properties type
    Given an existing template with this content
     """
    {{ required-property | @required }}
    {{ password-property | @password }}
    {{ default-property | @default toto }}
    {{ pattern-property | @pattern [0-9] }}
    {{ global-property}}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global-property | global-value |
    When I open this platform
    And I open the deployed module properties
    Then the properties are displayed with dedicated icons

  Scenario: Display only the global properties
    Given an existing template with this content
    """
    {{ simple-property }}
    {{ global-property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global-property | global-value |
    When I open this platform
    And I open the deployed module properties
    And I click on the switch to display only the global properties
    Then the property "global-property" is displayed
    And the property "simple-property" is not displayed

  Scenario: Hide the global properties
    Given an existing template with this content
    """
    {{ simple-property }}
    {{ global-property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global-property | global-value |
    When I open this platform
    And I open the deployed module properties
    And I click on the switch to hide the global properties
    Then the property "global-property" is not displayed
    And the property "simple-property" is displayed

  Scenario: Display a tooltip when property is valued by instances
    Given an existing template with this content
    """
    {{ property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property | {{instance-property}} |
    And the deployed module has these instances
      | instance-1 |
      | instance-2 |
    And the instance "instance-1" has these valued properties
      | instance-property | instance-value-1 |
    And the instance "instance-2" has these valued properties
      | instance-property | instance-value-2 |
    And I open this platform
    When I open the deployed module properties
    Then the tooltip of property "property" should contain
      | instance-1 | instance-value-1 |
      | instance-2 | instance-value-2 |

  # Issue 148
  Scenario: Display global properties suggestions when typing mustaches in a property value input
    Given an existing template with this content
    """
    {{ simple-property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global-property | global-value |
    When I open this platform
    And I open the deployed module properties
    And I type the value "foo-{{" for the property "simple-property"
    Then the global properties suggestion list is displayed
    When I select the first suggested global property
    Then the property "simple-property" should have the value "foo-{{ global-property }}"

  # Issue 148
  Scenario: Double autocomplete of global properties in the valuation field should not crash the application
    Given an existing template with this content
    """
    {{ simple-property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global-property | global-value |
    When I open this platform
    And I open the deployed module properties
    And I type the value "foo-{{global-property}}-bar-{{" for the property "simple-property"
    Then the global properties suggestion list is not displayed

  # Issue 380
  Scenario: Display an icon showing that the value of a property is the same as the default value
    Given an existing template with this content
    """
    {{ simple-property-1 | @default 45 }}
    {{ simple-property-2 | @default aa }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | simple-property-1 | simple-value |
      | simple-property-2 | aa           |
    When I open this platform
    And I open the deployed module properties
    Then the module property "simple-property-1" is not marked as having the same value as the default value
    And the module property "simple-property-2" is marked as having the same value as the default value

  # Issue 387
  Scenario: Display an icon indicating that a module property is overridden by a global with the same value
    Given an existing template with this content
     """
    {{ global-property-1 }}
    {{ global-property-2 }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global-property-1 | global-value-1 |
      | global-property-2 | global-value-2 |
    And the platform has these valued properties
      | global-property-1 |                |
      | global-property-2 | global-value-2 |
    When I open this platform
    And I open the deployed module properties
    Then the module property "global-property-1" is not marked as being overridden by a global with the same value
    And the module property "global-property-2" is marked as being overridden by a global with the same value

#  Scenario: Find the default value in the placeholder

#  Scenario: Find the comment in the placeholder

#  Scenario: Find the star when a property is required
