/*
 * This file is part of the Hesperides distribution.
 * (https://github.com/voyages-sncf-technologies/hesperides)
 * Copyright (c) 2016 VSCT.
 *
 * Hesperides is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * Hesperides is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var hesperidesKarmaUtils = {
    /**
     * This is for mocking angular-translate via pascalprecht.translate.
     * Should find a best way to do that, but keep it like this for now
     */
    mockTranslator() {
        var translationMock = {
            'FOO': 'bar',
            'BAR': 'foo',
        };

        beforeEach(module('pascalprecht.translate', function ($translateProvider) {
            $translateProvider
                .translations('en', translationMock)
                .translations('en', {
                    'FOO': 'bar',
                    'BAR': 'foo',
                })
                .preferredLanguage('en');
        }));
    },

    /**
     * This is for injecting the 'hesperides' module in the browser.
     * As most of the hesperides modules depends on it for the 'hesperidesHttp' module.
     */
    loadHesperides() {
        beforeEach(module('hesperides'));
    },
};

// We call these now !
hesperidesKarmaUtils.mockTranslator();
hesperidesKarmaUtils.loadHesperides();
