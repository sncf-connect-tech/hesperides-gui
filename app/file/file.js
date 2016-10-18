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

var fileModule = angular.module('hesperides.file', ['pascalprecht.translate']);

fileModule.factory('FileEntry', ['$hesperidesHttp', '$translate', function ($http, $translate) {
    var FileEntry = function (data) {
            var me = this;

            this.location = data.location;
            this.url = data.url;
            this.rights = data.rights;
            this.name = "";                                 // the filename, to be displayed on the donwload link
            this.content = "";                              // the content of the file
            this.on_error = false;                          // indicates if there where an error or not !

            // The content loading message
            $translate('file.loading.message').then(function(message){
                me.content = message;
            });

            // methods
            this.getContent = function () {
                return $http.get(me.url).then(function (response) {
                    return response;
                },function (error){

                    // Errors in here, are syntax error or something like that !
                    // This is processed on the get_files_entries method.
                    return error;
                });
            };
    };

    return FileEntry;
}]);

fileModule.factory('FileService', ['$hesperidesHttp', 'Application', 'Platform', 'Properties', 'InstanceModel', 'FileEntry', '$translate', function ($http, Application, Platform, Properties, InstanceModel, FileEntry, $translate) {
    // Convert file right to string
    var files_rights_to_string = function(filesRights) {
        var clearRight = function(right) {
            var setupRight = function(right, letter) {
                var r = "";

                if (right) {
                    r += letter;
                } /*else if (!_.isNull(right) && !right) {
                }*/

                return r;
            };

            var r = "";

            if (_.isString(right)) {
                var a = _.filter(_.toArray(right), function (c) {
                    return c != ' ' & c != '-'
                });

                for (var i = 0; i < a.length; i++) {
                    r += a[i];
                }
            } else if (_.isObject(right)) {
                r += setupRight(right.read, 'r');
                r += setupRight(right.write, 'w');
                r += setupRight(right.execute, 'x');
            }

            return r;
        };

        var newRights;

        if (filesRights) {
            var user = clearRight(filesRights.user);
            var group = clearRight(filesRights.group);

            newRights = 'user: ' + user + ' group:' + group;

            if (user == "" && group == "") {
                newRights = -1;
            }
        } else {
            // cas pour valeur filesRights null
            newRights = -1;
        }

        return newRights;
    };

    // Gets file name
    var get_file_name = function(location) {
        var tabs = location.split("/");
        return tabs[tabs.length - 1];
    };

    return {

        get_files_entries: function (application_name, platform_name, path, module_name, module_version, instance_name, is_working_copy) {
            var url = 'rest/files/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '/' + encodeURIComponent(path) + '/' + encodeURIComponent(module_name) + '/' + encodeURIComponent(module_version) + '/instances/' + encodeURIComponent(instance_name) + '?isWorkingCopy=' + encodeURIComponent(is_working_copy);

            return $http.get(url).then(function (response) {
                return response.data.map(function (data) {
                    var entry = new FileEntry(data);
                    entry.rights = files_rights_to_string(data.rights);

                    if (entry.rights < 0){
                        $translate('template.rights.none').then(function (label) { entry.rights = label; });
                    }

                    entry.getContent().then(function(output) {

                        if ( output.status != 200) {
                            entry.on_error = true;

                            // This is surely a syntax error or something like that.
                            // So we display the content of the message.
                            entry.content = output.message;
                        }else {

                            // There is a king of bug on code mirror when trying to display json objects.
                            // Angular takes this as a javascript object and then we end on error like :
                            //      angular.js:12783 Error: ui-codemirror cannot use an object or an array as a model

                            // To make this fixed, we check if the content is an object like, we stringify and prettify !
                            entry.content = (typeof output.data) === 'object' ? JSON.stringify(output.data, null, 4) : output.data;
                        }
                    });

                    entry.name = get_file_name( data.location );
                    return entry;
                });
            }, function (error) {
               $.notify(error.data.message, "error");
               throw error;
           });
        },
        download_files : function (entries, name){
            // The JSZip Object
            var zip = new JSZip();

            // Adding files to zip
            entries.map(function (entry){
                if ( !entry.on_error ){
                   zip.file(entry.name, entry.content);
                }
            });

            // Generate and save the zip file
            var content = zip.generate({type:"blob"});
            saveAs(content, name + ".zip");

        },
        files_rights_to_string: files_rights_to_string
    };
}]);