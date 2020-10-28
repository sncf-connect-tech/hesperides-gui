Feature: Save module properties

  Scenario: Save all kind of properties
    Given an existing template with this content
    """
    {{ simple-property }}
    {{ required-property | @required }}
    {{ password-property | @password }}
    {{ default-property | @default toto }}
    {{ pattern-property | @pattern [0-9] }}
    """
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I enter the following module properties
      | simple-property   | simple-value   |
      | required-property | required-value |
      | password-property | @P4$$w0rD      |
      | default-property  | tata           |
      | pattern-property  | 3              |
    And I save the module properties
    Then I get the following success notification: "The properties have been saved"

  Scenario: Try to save a property that doesn't match a defined pattern
    Given an existing template with this content
    """
    {{ pattern-property | @pattern [0-9] }}
    """
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I type the value "12" for the property "pattern-property"
    Then the save button is disabled

  Scenario: Try to save an empty required property
    Given an existing template with this content
    """
    {{ simple-property }}
    {{ required-property | @required }}
    """
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I type the value "other-value" for the property "simple-property"
    Then the save button is enabled
