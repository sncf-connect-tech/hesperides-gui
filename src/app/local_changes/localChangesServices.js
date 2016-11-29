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

var localChangesModule = angular.module('hesperides.localChanges');

localChangesModule.service('LocalChanges', ['LocalChangesDAO', 'LocalChangesUtils', function(LocalChangesDAO, LocalChangesUtils) {

    var localChangesDAO = new LocalChangesDAO();

    return {
        hasLocalChanges : function (application_name, platform, properties_path) {
            return localChangesDAO.hasLocalChanges(application_name, platform, properties_path);
        },
        getLocalChanges: function (application_name, platform, properties_path) {
            return localChangesDAO.getLocalChanges(LocalChangesUtils.buildFullPath(application_name, platform, properties_path));
        },
        addLocalChange: function (application_name, platform, properties_path, properties_name, properties_value) {
            localChangesDAO.addLocalChange(application_name, platform, properties_path, properties_name, properties_value);
        },
        hasLocalChanges: function (application_name, platform, properties_path) {
            return localChangesDAO.hasLocalChanges(application_name, platform, properties_path);
        },
        clearLocalChanges: function (opts) {
            localChangesDAO.clearLocalChanges(opts);
        },
        mergeWithLocalPropertiesImpl(local_properties, properties, merge) {
            _.each(properties.key_value_properties, function (key_value) {
                key_value.inLocal = false;
                key_value.syncWithRemote = false;
                var existing_local_property = _.find(local_properties, function (kvp) {
                    return key_value.name === kvp.properties_name;
                });
                if (!_.isUndefined(existing_local_property)) {
                    key_value.inLocal = true;
                    if (key_value.filtrable_value == existing_local_property.properties_value) {
                        key_value.syncWithRemote = true;
                    }
                    if (merge) {
                        key_value.value = existing_local_property.properties_value;
                    }
                }
            });
            return properties;
        },
        mergeWithLocalProperties: function (application_name, platform, properties_path, properties) {
            return this.mergeWithLocalPropertiesImpl(this.getLocalChanges(application_name, platform, properties_path), properties, true);
        },
        tagWithLocalProperties: function (application_name, platform, properties_path, properties) {
            return this.mergeWithLocalPropertiesImpl(this.getLocalChanges(application_name, platform, properties_path), properties, false);
        },
        hasSyncedChanges: function (properties) {
            if (properties == undefined || properties.key_value_properties == undefined)
                return false;
            return _.filter(properties.key_value_properties, {'syncWithRemote': true}).length > 0;
        },
        areFullySynced: function (application_name, platform, properties_path, properties) {
            if (properties == undefined || properties.key_value_properties == undefined)
                return false;
            return this.getLocalChanges(application_name, platform, properties_path).length > 0 && this.getLocalChanges(application_name, platform, properties_path).length - _.filter(properties.key_value_properties, {'syncWithRemote': true}).length == 0;
        },
        platformLocalChanges : function (platform) {
            var properties_paths = _.map(platform.modules, function (module) { return LocalChangesUtils.buildFullPath(platform.application_name, platform.name, module.properties_path); });
            return _.filter(properties_paths, function (properties_path) { return localChangesDAO.getLocalChanges(properties_path).length > 0; });
        },
        platformLocalChangesCount : function (platform) {
            return this.platformLocalChanges(platform).length;
        }
    }
}]);

localChangesModule.service('LocalChangesUtils', [function() {

    return {
        buildFullPath: function (application_name, platform, properties_path) {
            return '[' + application_name + '-' + platform + ']' + properties_path;
        },
        extractPropertiesPath: function (full_path) {
            return full_path.split(']')[1];
        },
        extractApplicationName: function (full_path) {
            return full_path.split('-')[0].replace('[', '');
        },
        extractPlatformName: function (full_path) {
            return full_path.split(']')[0].split('-')[1];
        }
    };
}]);

localChangesModule.service('LocalChangesDAO', ['LocalChange', 'LocalChangesUtils', function(LocalChange, LocalChangesUtils) {

    var local_storage_key = 'local_changes';
    var local_changes;

    function LocalChangesDAO() {
        get();
    };

    function get() {
        local_changes = store.get(local_storage_key);
        if (local_changes == undefined) {
            local_changes = {};
        }

        var has_removed = false;
        for (var key in local_changes) {
            if (local_changes.hasOwnProperty(key)) {
                _.remove(local_changes[key], function (elem) {
                    if (!has_removed && (getCurrentVersionID() - elem.version_id > hesperidesConfiguration.localChangesTTL)) {
                        has_removed = true;
                    }

                    return (getCurrentVersionID() - elem.version_id > hesperidesConfiguration.localChangesTTL);
                });

            }
        }
        save();
    };

    function save() {
        store.set(local_storage_key, local_changes);
    }

    function getCurrentVersionID() {
        return store.get('current_platform_versionID');
    }

    LocalChangesDAO.prototype = {
        getLocalChanges: function (full_path) {
            get();
            if (local_changes[full_path] && local_changes[full_path].length) {
                return local_changes[full_path].map(function (elem) {
                    return new LocalChange(elem);
                });
            }
            return [];
        },
        localChangeExist: function (full_path, properties_name) {
            return _.filter(this.getLocalChanges(full_path), c => c.properties_name == properties_name).length > 0 ? true : false;
        },
        addLocalChange: function (application_name, platform, properties_path, properties_name, properties_value) {
            var full_path = LocalChangesUtils.buildFullPath(application_name, platform, properties_path);
            var local_changes_buffer = this.getLocalChanges(full_path);

            if (this.localChangeExist(full_path, properties_name) == false) {
                local_changes_buffer.push(new LocalChange({
                    "properties_name"  : properties_name,
                    "properties_value" : properties_value,
                    "version_id" : getCurrentVersionID()
                }));
            } else {
                _.map(local_changes_buffer, function (elem) {
                    if (elem.properties_name == properties_name) {
                        elem.properties_value = properties_value;
                        elem.version_id = getCurrentVersionID();
                    }
                });
            }

            local_changes[full_path] = local_changes_buffer;
            save();
        },
        hasLocalChanges: function (application_name, platform, properties_path) {
            return this.getLocalChanges(LocalChangesUtils.buildFullPath(application_name, platform, properties_path)).length > 0 ? true : false;
        },
        clearLocalChanges: function (opts) {
            if ('application_name' in opts && 'platform' in opts && 'properties_path' in opts) {
                local_changes[LocalChangesUtils.buildFullPath(opts['application_name'], opts['platform'], opts['properties_path'])] = [];
            } else {
                local_changes = {};
            }
            save();
        }
    };
    return LocalChangesDAO;
}]);
