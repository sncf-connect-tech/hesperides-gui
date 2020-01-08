Feature: Save iterable properties

  Scenario: Save iterable properties
    Given an existing template with this content
    """
    {{#loop}}
    {{ simple-property }}
    {{ required-property | @required }}
    {{ password-property | @password }}
    {{ default-property | @default toto }}
    {{ pattern-property | @pattern [0-9] }}
    {{/loop}}
    """
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I open the iterable properties
    And I add a new block with the title "first" for the iterable property "loop"
    And I enter the following values for the first block of the iterable property "loop"
      | simple-property   | simple-value   |
      | required-property | required-value |
      | password-property | @P4$$w0rD      |
      | default-property  | tata           |
      | pattern-property  | 3              |
    And I save the module properties
    Then I get the following success notification: "The properties have been saved"

  Scenario: Try to save an iterable property that doesn't match a defined pattern
    Given an existing template with this content
    """
    {{#loop}}
    {{ pattern-property | @pattern [0-9] }}
    {{/loop}}
    """
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I open the iterable properties
    And I add a new block with the title "first" for the iterable property "loop"
    And I enter the following values for the first block of the iterable property "loop"
      | pattern-property | 12 |
    Then the save button is disabled

  Scenario: Try to save an empty required property
    Given an existing template with this content
    """
    {{#loop}}
    {{ simple-property }}
    {{ required-property | @required }}
    {{/loop}}
    """
    And an existing module with this template
    And an existing platform with this module
    When I open this platform
    And I open the deployed module properties
    And I open the iterable properties
    And I add a new block with the title "first" for the iterable property "loop"
    And I enter the following values for the first block of the iterable property "loop"
      | simple-property | other-value |
    Then the save button is disabled

  Scenario: Remove an existing block
    Given an existing template with this content
    """
    {{#loop}}
    {{ simple-property }}
    {{/loop}}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these iterable properties
      | loop | first-block  | simple-property | first-value  |
      | loop | second-block | simple-property | second-value |
    When I open this platform
    And I open the deployed module properties
    And I open the iterable properties
    And I remove the first block of the iterable property "loop"
    Then this block does not appear anymore
    And I save the module properties
    Then this block does not appear anymore

#  Scenario: Add multiple blocks
