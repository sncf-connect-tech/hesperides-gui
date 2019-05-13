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

angular.module('hesperides.file', [ 'pascalprecht.translate' ])

    .factory('FileEntry', [
        '$hesperidesHttp', '$translate', function ($http, $translate) {
            var FileEntry = function (data) {
                var file = this;

                this.location = data.location;
                this.url = data.url;
                this.rights = data.rights;
                this.name = ''; // the filename, to be displayed on the donwload link
                this.content = ''; // the content of the file
                this.on_error = false; // indicates if there where an error or not !

                // The content loading message
                $translate('file.loading.message').then(function (message) {
                    file.content = message;
                });

                // methods
                this.getContent = function () {
                    return $http.get(file.url).then(function (response) {
                        return response;
                    }, function (error) {
                        // Errors in here, are syntax error or something like that !
                        // This is processed on the get_files_entries method.
                        return error;
                    });
                };
            };

            return FileEntry;
        },
    ])

    .factory('FileService', [
        '$hesperidesHttp', 'Application', 'Platform', 'Properties', 'InstanceModel', 'FileEntry', '$translate', 'notify',
        function ($http, Application, Platform, Properties, InstanceModel, FileEntry, $translate, notify) {
            // Convert file right to string
            var files_rights_to_string = function (filesRights) {
                var clearRight = function (rights) {
                    var perms = '';
                    if (_.isString(rights)) {
                        perms += _.filter(_.toArray(rights), (right) => right !== ' ' && right !== '-').join('');
                    } else if (_.isObject(rights)) {
                        perms += rights.read ? 'r' : '';
                        perms += rights.write ? 'w' : '';
                        perms += rights.execute ? 'x' : '';
                    }
                    return perms;
                };
                var newRights = -1; // cas pour valeur filesRights null
                if (filesRights) {
                    var user = clearRight(filesRights.user);
                    var group = clearRight(filesRights.group);
                    if (user && group) {
                        newRights = `user: ${ user } group:${ group }`;
                    }
                }
                return newRights;
            };

            // Gets file name
            var get_file_name = function (location) {
                return _.last(location.split('/'));
            };

            return {

                get_files_entries(application_name, platform_name, path, module_name, module_version, instance_name, is_working_copy, simulate) {
                    var url = `rest/files/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }` +
                        `/${ encodeURIComponent(path) }/${ encodeURIComponent(module_name) }/${ encodeURIComponent(module_version) }/instances/${ encodeURIComponent(instance_name) }` +
                        `?isWorkingCopy=${ encodeURIComponent(is_working_copy) }&simulate=${ encodeURIComponent(simulate) }`;

                    return $http.get(url).then(function (response) {
                        response.data = _.sortBy(response.data, [ 'location' ]);

                        return response.data.map(function (data) {
                            var entry = new FileEntry(data);
                            entry.rights = files_rights_to_string(data.rights);

                            if (entry.rights < 0) {
                                $translate('template.rights.none').then(function (label) {
                                    entry.rights = label;
                                });
                            }

                            entry.getContent(simulate).then(function (output) {
                                if (output.status === 200) {
                                // There is a kind of bug on code mirror when trying to display json objects.
                                // Angular takes this as a javascript object and then we end on error like :
                                //      angular.js:12783 Error: ui-codemirror cannot use an object or an array as a model

                                    // To make this fixed, we check if the content is an object like, we stringify and prettify !
                                    entry.content = _.isObject(output.data) ? JSON.stringify(output.data, null, 4) : output.data;
                                } else {
                                    entry.on_error = true;

                                    // This is surely a syntax error or something like that.
                                    // So we display the content of the message.
                                    entry.content = output.message;
                                }
                            });

                            entry.name = get_file_name(data.location);
                            return entry;
                        });
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in FileService.get_files_entries' });
                        throw error;
                    });
                },
                download_files(entries, name) {
                // The JSZip Object
                    var zip = new JSZip();

                    // Adding files to zip
                    entries.forEach(function (entry) {
                        if (!entry.on_error) {
                            zip.file(entry.name, entry.content);
                        }
                    });

                    // Generate and save the zip file
                    var content = zip.generate({ type: 'blob' });
                    saveAs(content, `${ name }.zip`); // exported by JSZip
                },
                files_rights_to_string,
            };
        },
    ]);
