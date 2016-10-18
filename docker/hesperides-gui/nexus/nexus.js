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
var nexusModule = angular.module('hesperides.nexus', ['xml']);

nexusModule.factory('NexusService', ['$hesperidesHttp', 'x2js', '$translate', function ($http, x2js, $translate) {
    return {

        /**
         * Récupère la liste des versions des notes de livraison dans Nexus.
         *
         * @param application_name nom de l'application
         * @returns la liste des versions des ndl
         */
        getNdlVersions: function (application_name) {
            return $http.get('/nexus-api/service/local/lucene/search',
                {
                    "params": {
                        "g": "com.vsct." + application_name.toLowerCase(),
                        "a": "delivery-notes"
                    }
                })
                .then(function (response) {

                    if (!_.isUndefined(x2js.xml_str2json(response.data).searchNGResponse)){
                        var artifacts = x2js.xml_str2json(response.data).searchNGResponse.data.artifact;

                        if (artifacts.constructor !== Array) {
                            artifacts = [artifacts];
                        }

                        return _.pluck(artifacts, 'version');
                    }else{
                        return [];
                    }

                }, function (error) {
                    // l'erreur n'est pas bloquante
                    return [];
                });
        },

        /**
         * Récupère la note de livraison dans Nexus.
         *
         * @param application_name nom de l'application
         * @param application_version version de l'application
         * @returns la ndl au format json
         */
        getNdl: function (application_name, application_version) {
            return $http.get('/nexus-api/service/local/artifact/maven/content',
                {
                    "params": {
                        "r": "public",
                        "g": "com.vsct." + application_name.toLowerCase(),
                        "a": "delivery-notes",
                        "v": application_version,
                        "e": "json"
                    }
                })
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    $translate('nexus.event.error', {error:error.statusText}).then(function(label) {
                        $.notify(label, "error");                        
                    });
                    throw error;
                });
        }

    };
}]);