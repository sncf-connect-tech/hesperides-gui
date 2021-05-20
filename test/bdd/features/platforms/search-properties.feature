Feature: Search properties

  Scenario: Search properties
    Given an existing module named "module-1"
    And an existing platform named "DEV" with application name "ABC" with this module within logical group "JAR"
    And the platform has these valued properties
      | property-a | value-a      |
      | property-b | value-b      |
      | property-c | common-value |
      | property-d | common-value |
    # Landing page
    When I click on the search properties menu button
    Then the properties search form is empty
    And the properties search result count message is not present
    And the properties search result filter is not present
    And the properties search result table is not present
    # Empty results
    When I search properties with name "unknown-property"
    Then the properties search result count message is "There are no properties with name 'unknown-property'"
    When I search properties with value "unknown-value"
    Then the properties search result count message is "There are no properties with value 'unknown-value'"
    When I search properties with name "unknown-property" and value "unknown-value"
    Then the properties search result count message is "There are no properties with name 'unknown-property' and value 'unknown-value'"
    # Search by name
    When I search properties with name "property-a"
    Then the page url ends with "search-properties?name=property-a"
    And the properties search result count message is "1 displayed property of 1 found"
    And the properties search result filter is not displayed
    And the properties search result table contains exactly
      | property-a | value-a | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    # Open module
    When I click on the property's module
    Then a new tab opens directly to this module
    # Search by value
    When I search properties with value "common-value"
    Then the page url ends with "search-properties?value=common-value"
    And the properties search result count message is "2 displayed properties of 2 found"
    And the properties search result filter is displayed
    And the properties search result table contains exactly
      | property-c | common-value | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-d | common-value | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    # Filter results
    When I filter properties search result with "-c"
    Then the properties search result count message is "1 displayed property of 2 found"
    And the properties search result table contains exactly
      | property-c | common-value | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    # Search by name and value
    When I search properties with name "property-b" and value "value-b"
    Then the page url ends with "search-properties?name=property-b&value=value-b"
    And the properties search result table contains exactly
      | property-b | value-b | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    # Search by url parameters
    When I open the search properties page with parameter "name=property-a"
    And the properties search result table contains exactly
      | property-a | value-a | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    When I open the search properties page with parameter "value=value-b"
    And the properties search result table contains exactly
      | property-b | value-b | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    When I open the search properties page with parameter "name=property-c&value=common-value"
    And the properties search result table contains exactly
      | property-c | common-value | JAR > module-1 1.0 (workingcopy) | DEV | ABC |

  Scenario: Display a limited number of properties
    Given an existing module named "module-1"
    And an existing platform named "DEV" with application name "ABC" with this module within logical group "JAR"
    And the platform has these valued properties
      | property-01 | value-01 |
      | property-02 | value-02 |
      | property-03 | value-03 |
      | property-04 | value-04 |
      | property-05 | value-05 |
      | property-06 | value-06 |
      | property-07 | value-07 |
      | property-08 | value-08 |
    When I open the search properties page with parameter "name=property&limit=3"
    Then the properties search result table contains exactly
      | property-01 | value-01 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-02 | value-02 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-03 | value-03 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    When I click on the button to display more properties
    Then the properties search result table contains exactly
      | property-01 | value-01 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-02 | value-02 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-03 | value-03 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-04 | value-04 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-05 | value-05 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-06 | value-06 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    When I click on the button to display more properties
    Then the properties search result table contains exactly
      | property-01 | value-01 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-02 | value-02 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-03 | value-03 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-04 | value-04 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-05 | value-05 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-06 | value-06 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-07 | value-07 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-08 | value-08 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    And the button to display more properties is not present anymore

  Scenario: Filter properties
    Given an existing module named "module-1"
    And an existing platform named "DEV" with application name "ABC" with this module within logical group "JAR"
    And the platform has these valued properties
      | property-01 | value-01 |
      | property-02 | value-02 |
      | property-03 | value-03 |
      | property-04 | value-04 |
    When I open the search properties page with parameter "name=property&limit=3"
    And I filter the search results with "04"
    Then the properties search result table contains exactly
      | property-04 | value-04 | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    And the button to display more properties is not present anymore
