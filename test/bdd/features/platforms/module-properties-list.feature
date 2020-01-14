Feature: Filter properties

  Scenario: Selectively display requested properties
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
    And I click on the switch to display nothing but the required properties
    Then the required property is properly displayed

  # Issue 325
  Scenario: Module properties that are overridden by global properties are crossed
    Given an existing template with this content
    """
      {{ property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property | property-value |
    And the platform has these global properties
      | property | property-value-global |
    When I open this platform
    And I open the deployed module properties
    Then the property "property" contain value "property-value"
    And the property "property" is crossed

  # Issue 325
  Scenario: Module properties that are not global properties are displayed
    Given an existing template with this content
    """
      {{ property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property | property-value |
    When I open this platform
    And I open the deployed module properties
    Then the property "property" contain value "property-value"

  # Issue 325
  Scenario: Module properties that have same value as global properties are not crossed
    Given an existing template with this content
    """
      {{ property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property | property-value-same-as-global |
    And the platform has these global properties
      | property | property-value-same-as-global |
    When I open this platform
    And I open the deployed module properties
    Then the property "property" contain value "property-value-same-as-global"
    And the property "property" is "not" crossed

#  Scenario: Find the default value in the placeholder

#  Scenario: Find the comment in the placeholder

#  Scenario: Find the star when a property is required
