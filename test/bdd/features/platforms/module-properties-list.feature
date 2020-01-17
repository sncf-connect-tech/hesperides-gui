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
      | property-1 | {{instance-property-1}} |
      | property-2 | {{instance-property-2}} |
    And the platform has these instance properties
      | instance-property-1 | instance-valu-1 |
      | instance-property-2 | instance-valu-2 |
    When I open this platform
    And I open the deployed module properties
    And I move mouse pointer to the tooltip icon info on property that valued by instance properties
    Then The tooltip shoul appears and it should contained internationalized message

#  Scenario: Find the default value in the placeholder

#  Scenario: Find the comment in the placeholder

#  Scenario: Find the star when a property is required
