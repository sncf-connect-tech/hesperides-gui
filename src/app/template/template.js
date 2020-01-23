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
angular.module('hesperides.template', [])

    .factory('HesperidesTemplateModal', function (TemplateService, $document, $mdDialog, $timeout, $mdConstant, $rootScope) {
        var hesperidesOverlay = {
            startState() {
                return {
                    inMustache: false,
                };
            },
            token(stream, state) {
                if (stream.match('{{')) { // We found an hesperides token
                    state.inMustache = true; // Remember what we do
                    state.inMustacheInner = true;
                    return 'hesperides';
                }
                if (state.inMustache) {
                    var ch = null;
                    // eslint-disable-next-line no-cond-assign
                    while (ch = stream.next()) { // Read characters through the token
                        if (ch === '}' && stream.next() === '}') { // End of hesperides token
                            if (state.inMustacheInner) {
                                stream.backUp(2);
                                state.inMustacheInner = false;
                                return 'hesperides-token'; // Color for the inner token
                            }
                            stream.eat('}');
                            state.inMustache = false; // Remember to update state
                            state.inMustacheInner = false;
                            return 'hesperides'; // Color for the }}
                        }
                        if (ch === '|') { // Found an inner item limit
                            if (state.inMustacheInner) {
                                stream.backUp(1);
                                state.inMustacheInner = false;
                                return 'hesperides-token'; // Color for the inner token
                            }
                            state.inMustacheInner = true;
                            return 'hesperides'; // Color for the | character
                        }
                    }
                    return 'hesperides-token'; // return the style for syntax highlight even if we reached end of line
                }
                // eslint-disable-next-line no-empty
                while (stream.next() && !stream.match('{{', false)) {} // Skip everything unless we find an hesperides token or reach the end of line
                return null;
            },
        };

        /* Thisis for the initialization, to make sure we have at least the simple Mustache mode selected */
        CodeMirror.defineMode('hesperides', function (config, parserConfig) {
            return CodeMirror.overlayMode(
                CodeMirror.getMode(config, parserConfig.backdrop || ''),
                hesperidesOverlay,
            );
        });

        var defaultScope = {
            codemirrorModes: [
                { name: 'Simple Hesperides', mimetype: '' },
                { name: 'Properties File', mimetype: 'text/x-properties' },
            ],
            codeMirrorOptions: {
                mode: 'hesperides',
                lineNumbers: true,
                lineWrapping: true,
                extraKeys: {
                    // Notes sur le mode plein écran:
                    //   * Le plugin CodeMirror dédié est documenté ici: https://codemirror.net/doc/manual.html#addon_fullscreen
                    //     et le code source est là: https://github.com/codemirror/CodeMirror/tree/master/addon/display
                    //   * Il contient ce CSS: .CodeMirror-fullscreen { position: fixed; ... }
                    //   * En citant la doc web MDN: "position: fixed" = L'élément est positionné relativement au bloc englobant initial formé par la zone d'affichage (viewport), sauf si un des ancêtres a une propriété transform, perspective ou filter qui est différente de none
                    //   * Or l'élément parent <md-dialog> a une propriété "transform"
                    //   * On doit donc changer l'élement .CodeMirror de parent, afin de l'afficher en plein écran,
                    //     d'où cette modification du DOM au sein d'un contrôleur
                    'F11'(cm) {
                        if (cm.getOption('fullScreen')) {
                            // Rapatriement à l'emplacement du DOM initial
                            $document[0].getElementById('template-modal-codemirror-parent').appendChild($document[0].getElementById('template-modal-codemirror'));
                        } else {
                            // Rattachement au body, cf. commentaire explicatif ci-dessus
                            $document.find('body')[0].appendChild($document[0].getElementById('template-modal-codemirror'));
                        }
                        cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                        cm.focus();
                    },
                    'Esc'(cm) {
                        if (cm.getOption('fullScreen')) {
                            // Rapatriement à l'emplacement du DOM initial
                            $document[0].getElementById('template-modal-codemirror-parent').appendChild($document[0].getElementById('template-modal-codemirror'));
                            cm.setOption('fullScreen', false);
                            cm.focus();
                        }
                    },
                },
                onLoad(_editor) {
                    defaultScope.editor = _editor;
                    // This is some trick to avoid a bug. If not refresh, then we have to click on code mirror to see its content
                    $timeout(function () {
                        defaultScope.editor.refresh();
                    }, 500);
                },
            },
            changeCodeMirrorMode(new_mode) {
                var mode_name = `hesperides+${ new_mode }`;
                CodeMirror.defineMode(mode_name, function (config, parserConfig) {
                    return CodeMirror.overlayMode(
                        CodeMirror.getMode(config, parserConfig.backdrop || new_mode),
                        hesperidesOverlay,
                    );
                });
                defaultScope.editor.setOption('mode', mode_name);
            },
        };

        return {
            edit_template(options) {
                var modalScope = $rootScope.$new(true);

                modalScope.template = options.template;

                modalScope.add = options.add;

                modalScope.save = options.onSave;

                modalScope.isReadOnly = options.isReadOnly;

                modalScope.closeTemplateEditor = function () {
                    $mdDialog.cancel();
                };

                defaultScope.codeMirrorOptions.readOnly = Boolean(options.isReadOnly);

                angular.extend(modalScope, defaultScope);

                $mdDialog.show({
                    templateUrl: 'template/template-modal.html',
                    clickOutsideToClose: true,
                    preserveScope: true, // requiered for not freez menu see https://github.com/angular/material/issues/5041
                    scope: modalScope,
                });

                modalScope.saveTemplateAndClose = function (template) {
                    modalScope.save(template).then(function (savedTemplate) {
                        modalScope.template = savedTemplate;
                        $mdDialog.cancel();
                    });
                };

                modalScope.saveTemplate = function (template) {
                    modalScope.save(template).then(function (savedTemplate) {
                        modalScope.template = savedTemplate;
                    });
                };
            },
        };
    },
    )

    .directive('hesperidesTemplateList', function () {
        return {
            restrict: 'E',
            scope: {
                templateEntries: '=',
                add: '&',
                downloadAll: '&',
                download: '&',
                delete: '&',
                edit: '&',
                isReadOnly: '=',
            },
            templateUrl: 'template/template-list.html',
            link(scope) {
                scope.add_template = function () {
                    scope.add()();
                };

                scope.download_all_template = function (templateEntries) {
                    scope.downloadAll()(templateEntries);
                };

                scope.download_template = function (template_entry) {
                    scope.download()(template_entry);
                };

                scope.delete_template = function (name) {
                    scope.delete()(name);
                };

                scope.edit_template = function (name) {
                    scope.edit()(name);
                };
            },
        };
    })

    .factory('Template', function () {
        var Template = function (data) {
            angular.extend(this, {
                name: '',
                filename: '',
                location: '',
                content: '',
                rights: {
                    user: {},
                    group: {},
                },
                version_id: -1,
            }, data);

            this.toHesperidesEntity = function () {
                return {
                    name: this.name,
                    filename: this.filename,
                    location: this.location,
                    content: this.content,
                    version_id: this.version_id,
                    rights: this.rights,
                };
            };
        };

        return Template;
    })

    .factory('TemplateEntry', [
        '$hesperidesHttp', 'Template', function ($http, Template) {
            var TemplateEntry = function (data) {
                angular.extend(this, {
                    name: '',
                    namespace: '',
                    filename: '',
                    location: '',
                    url: '',
                    content: '',
                    mediaType: '',
                }, data);

                this.getTemplate = function (url) {
                    return $http.get(url).then(function (response) {
                        return (new Template(response.data)).toHesperidesEntity();
                    });
                };

                // methods
                this.getContent = function () {
                    return $http.get(this.url).then(function (response) {
                        return response.data.content;
                    }, function (error) {
                        // Errors in here, are syntax error or something like that !
                        // This is processed on the get_files_entries method.
                        return error;
                    });
                };

                this.setMediaType = function () {
                    switch (this.filename.substr(this.filename.lastIndexOf('.') + 1)) {
                    case 'json':
                        this.mediaType = 'application/json';
                        break;
                    case 'xml':
                        this.mediaType = 'application/xml';
                        break;
                    default:
                        this.mediaType = 'text/plain';
                    }
                };
            };

            return TemplateEntry;
        },
    ])

    .factory('TemplateService', [
        '$hesperidesHttp', 'Template', 'TemplateEntry', '$translate', 'notify',
        function ($http, Template, TemplateEntry, $translate, notify) {
            return {
                get(namespace, name) {
                    return $http.get(`rest/templates/${ encodeURIComponent(namespace) }/${ encodeURIComponent(name) }`).then(function (response) {
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TemplateService.get' });
                    });
                },
                save(template) {
                    template = template.toHesperidesEntity();
                    if (template.version_id < 0) {
                        return $http.post(`rest/templates/${ encodeURIComponent(template.namespace) }/${ encodeURIComponent(template.name) }`, template).then(function (response) {
                            $translate('template.event.created').then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                            return new Template(response.data);
                        }, function (error) {
                            if (error.data) {
                                notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TemplateService.save.post' });
                            } else if (error.status === 409) {
                                $translate('template.event.error').then(function (label) {
                                    notify({ classes: [ 'error' ], message: label });
                                });
                            }
                        });
                    }
                    return $http.put(`rest/templates/${ encodeURIComponent(template.namespace) }/${ encodeURIComponent(template.name) }`, template).then(function (response) {
                        $translate('template.event.updated').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TemplateService.save.put' });
                    });
                },
                delete(namespace, name) {
                    return $http.delete(`rest/templates/${ encodeURIComponent(namespace) }/${ encodeURIComponent(name) }`).then(function (response) {
                        $translate('template.event.deleted').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return response;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TemplateService.delete' });
                    });
                },
                all(namespace) {
                    return $http.get(`rest/templates/${ encodeURIComponent(namespace) }`).then(function (response) {
                        return response.data.map(function (data) {
                            return new TemplateEntry(data);
                        }, function (error) {
                            if (error.status === 404) {
                                return [];
                            }
                            var errMsg = (error.data && error.data.message) || error.data || 'Unknown API error in TemplateService.all';
                            notify({ classes: [ 'error' ], message: errMsg });
                            throw new Error(errMsg);
                        });
                    });
                },
            };
        },
    ])

    .directive('fileRights', function () {
        var controller = [
            '$scope', '$translate', function ($scope, $translate) {
                $scope.defaultRightStr = '';
                $scope.appliedRightStr = '';
                $scope.removedRightStr = '';

                $translate('template.rights.default').then(function (label) {
                    $scope.defaultRightStr = label;
                });
                $translate('template.rights.applied').then(function (label) {
                    $scope.appliedRightStr = label;
                });
                $translate('template.rights.removed').then(function (label) {
                    $scope.removedRightStr = label;
                });

                var setValue = function (item, value) {
                    if (!$scope.model) {
                        $scope.model = {};
                    }
                    $scope.model[item.attr] = value;
                };

                var getValue = function (item) {
                    return $scope.model && !_.isUndefined($scope.model[item.attr]) ? $scope.model[item.attr] : null;
                };

                $scope.fileRightsOption = [
                    { text: 'R', attr: 'read' },
                    { text: 'W', attr: 'write' },
                    { text: 'X', attr: 'execute' },
                ];

                $scope.getValue = getValue;

                $scope.getHelp = function (item) {
                    var value = getValue(item);

                    if (_.isNull(value)) {
                        return $scope.defaultRightStr;
                    } else if (value) {
                        return $scope.appliedRightStr;
                    }
                    return $scope.removedRightStr;
                };

                $scope.doClick = function (item) {
                    var value = getValue(item);

                    if (_.isNull(value)) {
                        setValue(item, true);
                    } else if (value) {
                        setValue(item, false);
                    } else {
                        setValue(item, null);
                    }
                };
            },
        ];

        return {
            restrict: 'E',
            scope: {
                model: '=',
                label: '@',
            },
            template: '{{label}} <md-button id="template_right-button-{{item.text}}-{{label}}" ng-repeat="item in fileRightsOption" ' +
                                     'ng-click="doClick(item)" class="md-xxs" ' +
                                     'ng-class="{\'md-raised\': getValue(item) !== null, \'md-warn\': getValue(item) === true, \'md-strike\': getValue(item) === false}">' +
                  '{{item.text}}' +
                  '<md-tooltip>{{getHelp(item)}}</md-tooltip>' +
                  '</md-button>',
            controller,
        };
    });
