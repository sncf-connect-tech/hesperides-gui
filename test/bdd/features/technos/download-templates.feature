Feature: Download techno templates

  Scenario: Download a template file
    Given an existing template with this content
    """
    {{ property }}
    """
    And an existing techno with this template
    When I open this techno
    And I download the template file for this techno template
    Then the template file is downloaded and it has the content of the template

