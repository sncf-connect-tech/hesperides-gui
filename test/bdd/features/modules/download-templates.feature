Feature: Download module templates

  Scenario: Download a template file
    Given an existing template with this content
    """
    {{ property }}
    """
    And an existing module with this template
    When I open this module
    And I download the template file for this module template
    Then the template file is downloaded and it has the content of the template

