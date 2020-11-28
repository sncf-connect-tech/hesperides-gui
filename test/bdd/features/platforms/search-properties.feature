Feature: Search properties

  Scenario: Search properties
    Given an existing template with this content
    """
    {{ property-a }}
    {{ property-b }}
    {{ property-c }}
    {{ property-d }}
    """
    And an existing module named "module-1" with this template
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
    When I search properties with name "property"
    Then the properties search result count message is "There are no properties with name 'property'"
    When I search properties with value "value"
    Then the properties search result count message is "There are no properties with value 'value'"
    When I search properties with name "property" and value "value"
    Then the properties search result count message is "There are no properties with name 'property' and value 'value'"
    # Search by name
    When I search properties with name "property-a"
    Then the page url ends with "search-properties?name=property-a"
    And the properties search result count message is "One single property found"
    And the properties search result filter is not displayed
    And the properties search result table contains exactly
      | property-a | value-a | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    # Open module
    When I click on the property's module
    Then a new tab opens directly to this module
    # Search by value
    When I search properties with value "common-value"
    Then the page url ends with "search-properties?value=common-value"
    And the properties search result count message is "2 properties found"
    And the properties search result filter is displayed
    And the properties search result table contains exactly
      | property-c | common-value | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-d | common-value | JAR > module-1 1.0 (workingcopy) | DEV | ABC |
    # Filter results
    When I filter properties search result with "-c"
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

  Scenario: Sort searched properties
    Given an existing template with this content
    """
    {{ property-a }}
    {{ property-b }}
    {{ property-c }}
    """
    And an existing module named "module-1" with this template
    And an existing platform named "DEV" with application name "ABC" with this module within logical group "WEB"
    And the platform has these valued properties
      | property-a | abc-dev-1    |
      | property-b | common-value |
      | property-c | common-value |
    And an existing platform named "REC" with application name "ABC" with this module within logical group "JAR"
    And the platform has these valued properties
      | property-a | abc-rec-1    |
      | property-b | common-value |
      | property-c | common-value |
    And an existing module named "module-2" with this template
    And an existing platform named "DEV" with application name "EFG" with this module within logical group "WEB"
    And the platform has these valued properties
      | property-a | efg-dev-2    |
      | property-b | common-value |
      | property-c | common-value |
    And an existing platform named "REC" with application name "EFG" with this module within logical group "JAR"
    And the platform has these valued properties
      | property-a | efg-rec-2    |
      | property-b | common-value |
      | property-c | common-value |
    When I open the search properties page with parameter "name=property-a"
    # Default order when searching by name
    Then the properties search result table is ordered by values
    And the properties search result table contains exactly
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
    When I click on the search result column title for values
    Then the properties search result table is ordered by descending values
    And the properties search result table contains exactly
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
    When I click on the search result column title for modules
    Then the properties search result table is ordered by modules
    And the properties search result table contains exactly
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
    When I click on the search result column title for modules
    Then the properties search result table is ordered by descending modules
    And the properties search result table contains exactly
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
    When I click on the search result column title for platforms
    Then the properties search result table is ordered by platforms
    And the properties search result table contains exactly
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
    When I click on the search result column title for platforms
    Then the properties search result table is ordered by descending platforms
    And the properties search result table contains exactly
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
    When I click on the search result column title for applications
    Then the properties search result table is ordered by applications
    And the properties search result table contains exactly
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
    When I click on the search result column title for applications
    Then the properties search result table is ordered by descending applications
    And the properties search result table contains exactly
      | property-a | efg-dev-2 | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-a | efg-rec-2 | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-a | abc-dev-1 | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-a | abc-rec-1 | JAR > module-1 1.0 (workingcopy) | REC | ABC |
    When I open the search properties page with parameter "value=common-value"
    # Default order when searching by value
    Then the properties search result table is ordered by names
    And the properties search result table contains exactly
      | property-b | common-value | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-b | common-value | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-b | common-value | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-b | common-value | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-c | common-value | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-c | common-value | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-c | common-value | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-c | common-value | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
    When I click on the search result column title for names
    Then the properties search result table is ordered by descending names
    And the properties search result table contains exactly
      | property-c | common-value | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-c | common-value | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-c | common-value | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-c | common-value | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
      | property-b | common-value | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-b | common-value | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-b | common-value | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-b | common-value | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
    When I open the search properties page with parameter "name=property-b&value=common-value"
    # Default order when searching by name and value
    Then the properties search result table is ordered by modules
    And the properties search result table contains exactly
      | property-b | common-value | JAR > module-1 1.0 (workingcopy) | REC | ABC |
      | property-b | common-value | JAR > module-2 1.0 (workingcopy) | REC | EFG |
      | property-b | common-value | WEB > module-1 1.0 (workingcopy) | DEV | ABC |
      | property-b | common-value | WEB > module-2 1.0 (workingcopy) | DEV | EFG |
