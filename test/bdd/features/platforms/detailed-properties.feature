Feature: Detailed properties

  Scenario: Get the detailed properties of a platform
    Given an existing template with this content
    """
    {{ comment | a comment }}
    {{ required | @required }}
    {{ password | @password }}
    {{ default | @default 12 }}
    {{ pattern | @pattern [a-z] }}
    {{ ref }}
    {{ global }}
    {{ refglobal }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | required  | value         |
      | ref       | {{ default }} |
      | refglobal | {{ global }}  |
      | unused    | value         |
    And the platform has these global properties
      | global | global value |
    And I open this platform
    When I open the detailed properties of this platform
    Then the detailed properties contain the module properties
      | comment   |                              | 💬   | Comment: "a comment"  |
      | required  | value                        | ❗    | Required              |
      | password  |                              | 🔒   | Password              |
      | default   | => 12                        | 🛡   | Default value: 12     |
      | pattern   |                              | (.*) | Pattern: [a-z]        |
      | ref       | {{ default }} => 12          |      |                       |
      | refglobal | {{ global }} => global value | 🌍   | global = global value |
      | unused    | value                        | ❌    | Unused property       |

  Scenario: Get the detailed global properties of a platform
    Given an existing template with this content
    """
    {{ global }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these global properties
      | global          | global value |
      | globalrefglobal | {{ global }} |
    And I open this platform
    When I open the detailed properties of this platform
    And I click on the switch button to display the detailed global properties
    Then the detailed properties contain the global properties
      | global          | global value                 |
      | globalrefglobal | {{ global }} => global value |

  Scenario: Get the detailed properties of a platform with two modules
    Given an existing template with this content
    """
    {{ property-a }}
    """
    And an existing workingcopy module named "module-a" with version "1.0" with this template
    And an existing template with this content
    """
    {{ property-b }}
    """
    And an existing workingcopy module named "module-b" with version "1.0" with this template
    And an existing platform
    And I update this platform, adding module "module-a" to logical group "GROUP-1"
    And I update this platform, adding module "module-b" to logical group "GROUP-2"
    And I open this platform
    When I open the detailed properties of this platform
    Then the detailed properties contain the properties with the following modules
      | property-a | GROUP-1 > module-a 1.0 (workingcopy) |
      | property-b | GROUP-2 > module-b 1.0 (workingcopy) |

  Scenario: Search for a property by name in the detailed properties of a platform
    Given an existing template with this content
    """
    {{ property-a }}
    {{ property-b }}
    {{ property-c }}
    {{ property-d }}
    """
    And an existing module with this template
    And an existing platform with this module
    And I open this platform
    When I open the detailed properties of this platform
    And I search for "property-b" in the detailed properties
    Then only one property is displayed in the detailed properties
    And the detailed properties contain the module properties
      | property-b |  |  |  |

  Scenario: Search for a property by value in the detailed properties of a platform
    Given an existing template with this content
    """
    {{ property-a }}
    {{ property-b }}
    {{ property-c }}
    {{ property-d }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property-a | value-a |
      | property-b | value-b |
      | property-c | value-c |
      | property-d | value-d |
    And I open this platform
    When I open the detailed properties of this platform
    And I search for "value-b" in the detailed properties
    Then only one property is displayed in the detailed properties
    And the detailed properties contain the module properties
      | property-b | value-b |  |  |
