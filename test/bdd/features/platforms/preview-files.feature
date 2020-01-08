Feature: Preview files

  Scenario: Preview a module file with valued properties
    Given an existing template with this content
    """
    {{ property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property | property-value |
    When I open this platform
    And I open the preview file modal of this module
    And I open the file preview of this template
    Then the file preview of this template should contain
    """
    property-value
    """

  Scenario: Download a single module file
    Given an existing template with this content
    """
    {{ property }}
    """
    And an existing module with this template
    And an existing platform with this module
    And the platform has these valued properties
      | property | property-value |
    When I open this platform
    And I open the preview file modal of this module
    And I download the file of this template
    Then the file of this template should contain
    """
    property-value
    """

#  Scenario: Download multiple module files at once

#  Scenario: Preview an instance file with valued properties

#  Scenario: Download a single instance file

#  Scenario: Download multiple instance files at once
