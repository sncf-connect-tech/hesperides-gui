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
var templateModule = angular.module('hesperides.template', []);

templateModule.factory('HesperidesTemplateModal', ['TemplateService', '$mdDialog', '$timeout', '$mdConstant', '$rootScope', function (TemplateService, $mdDialog, $timeout, $mdConstant, $rootScope) {

    var hesperidesOverlay = {
        startState: function() {
            return {
                inMustache: false
            }
        },
        token: function(stream, state) {
            var ch;
            if (stream.match("{{")){ //We found an hesperides token
                state.inMustache = true; //Remember what we do
                state.inMustacheInner = true;
                return "hesperides";
            }
            if(state.inMustache) {
                while ((ch = stream.next()) != null) { //Read characters through the token
                    if (ch == "}" && stream.next() == "}") { //End of hesperides token
                        if(state.inMustacheInner){
                            stream.backUp(2);
                            state.inMustacheInner = false;
                            return "hesperides-token"; //Color for the inner token
                        } else {
                            stream.eat("}");
                            state.inMustache = false; //Remember to update state
                            state.inMustacheInner = false;
                            return "hesperides"; //Color for the }}
                        }
                    }
                    if(ch == "|"){ //Found an inner item limit
                        if(state.inMustacheInner){
                            stream.backUp(1);
                            state.inMustacheInner = false;
                            return "hesperides-token"; //Color for the inner token
                        } else {
                            state.inMustacheInner = true;
                            return "hesperides"; //Color for the | character
                        }
                    }
                }
                return "hesperides-token"; //return the style for syntax highlight even if we reached end of line
            }
            while (stream.next() != null && !stream.match("{{", false)) {} //Skip everything unless we find an hesperides token or reach the end of line
            return null;
        }
    };

    /* Thisis for the initialization, to make sure we have at least the simple Mustache mode selected */
    CodeMirror.defineMode("hesperides", function(config, parserConfig) {
        return CodeMirror.overlayMode(
            CodeMirror.getMode(config, parserConfig.backdrop || ""),
            hesperidesOverlay
        );
    });

    var defaultScope = {
        codemirrorFullscreenStatus: false,
        codemirrorModes: [
            { name: "Simple Hesperides", mimetype: ""},
            { name: "Properties File", mimetype:"text/x-properties"}
        ],
        codeMirrorOptions: {
            mode: 'hesperides',
            lineNumbers: false, // there is a bug on line numbers, so keep it h
            lineWrapping : true,
            extraKeys: {
                'F11': function (cm) {
                    $('body').append($('#templateContent')); //Change the parent of codemirror because if not, fullscreen is restricted to the modal
                    $('#templateContent').children().css("z-index", 100000);
                    cm.setOption('fullScreen', true);
                    cm.focus();
                    defaultScope.codemirrorFullscreenStatus = true;
                },
                'Esc': function (cm) {
                    $('#templateContentParent').append($('#templateContent'));
                    if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                    cm.focus();
                }
            },
            onLoad: function(_editor){
                defaultScope.editor = _editor;
                //This is some trick to avoid a bug. If not refresh, then we have to click on code mirror to see its content
                $timeout(function(){
                    defaultScope.editor.refresh();
                }, 500);
            }
        },
        changeCodeMirrorMode: function(new_mode){
            var mode_name = "hesperides+"+new_mode;
            CodeMirror.defineMode(mode_name, function(config, parserConfig) {
                return CodeMirror.overlayMode(
                    CodeMirror.getMode(config, parserConfig.backdrop || new_mode),
                    hesperidesOverlay
                );
            });
            defaultScope.editor.setOption("mode", mode_name);
        }
    };

    return {
        edit_template: function (options) {

            var modalScope = $rootScope.$new(true);

            modalScope.template = options.template;

            modalScope.add = options.add;

            modalScope.save = options.onSave;

            modalScope.isReadOnly = options.isReadOnly;

            modalScope.$closeDialog = function() {
                $mdDialog.cancel();
            };

            modalScope.$checkIfCodeMirrorInFullScreen = function($event) {
                if ($event.keyCode === $mdConstant.KEY_CODE.ESCAPE && defaultScope.codemirrorFullscreenStatus) {
                    $event.stopPropagation();
                    defaultScope.codemirrorFullscreenStatus = false;
                }
            };

            defaultScope.codeMirrorOptions.readOnly = options.isReadOnly ? true : false;

            angular.extend(modalScope, defaultScope);

            $mdDialog.show({
                templateUrl: 'template/template-modal.html',
                clickOutsideToClose:true,
                preserveScope: true, // requiered for not freez menu see https://github.com/angular/material/issues/5041
                scope:modalScope
            });

            modalScope.$close = function(template) {
                modalScope.save(template).then(function(savedTemplate){
                    modalScope.template = savedTemplate;
                }).catch(function() {
                    // Do nothing to prevent closing window if error with annotation
                });

                $mdDialog.cancel();
            };

            modalScope.$save = function(template){
                modalScope.save(template).then(function(savedTemplate){
                    modalScope.template = savedTemplate;
                });
            };
        }
    };

}]);

templateModule.directive('hesperidesTemplateList', function () {
    return {
        restrict: 'E',
        scope: {
            templateEntries: '=',
            add: '&',
            delete: '&',
            edit: '&',
            isReadOnly: '='
        },
        templateUrl: "template/template-list.html",
        link: function (scope) {

            scope.add_template = function () {
                scope.add()();
            };

            scope.delete_template = function (name) {
                scope.delete()(name);
            };

            scope.edit_template = function (name) {
                scope.edit()(name);
            };

        }
    };
});

templateModule.factory('Template', function () {

    var Template = function (data) {

        angular.extend(this, {
            name: "",
            filename: "",
            location: "",
            content: "",
            rights: {
              user:{},
              group:{}
            },
            version_id: -1
        }, data);

        this.toHesperidesEntity = function(){
          return {
              name: this.name,
              filename: this.filename,
              location: this.location,
              content: this.content,
              version_id: this.version_id,
              rights: this.rights
          }
        };

    };

    return Template;

});

templateModule.factory('TemplateEntry', ['$hesperidesHttp', 'Template',function ($http, Template) {

    var TemplateEntry = function (data) {
        angular.extend(this, {
            name: "",
            namespace: "",
            filename: "",
            location: ""
        }, data);

    this.getRights = function (url) {
            return $http.get(url).then(function (response) {
                return (new Template(response.data)).toHesperidesEntity();
            });
        };
    };

    return TemplateEntry;
}]);

templateModule.factory('TemplateService', ['$hesperidesHttp', 'Template', 'TemplateEntry', '$translate', function ($http, Template, TemplateEntry, $translate) {

    return {
        get: function (namespace, name) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
            });
        },
        save: function (template) {
            template = template.toHesperidesEntity();
            if (template.version_id < 0) {
                return $http.post('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $translate('template.event.created').then(function(label) {
                        $.notify(label, "success");
                    });
                    return new Template(response.data);
                }, function (error) {
                    if (error.status === 409) {
                        $translate('template.event.error').then(function(label) {
                            $.notify(label, "error");
                        })
                    } else {
                        $.notify(error.data.message, "error");
                    }
                });
            } else {
                return $http.put('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $translate('template.event.updated').then(function(label) {
                        $.notify(label, "success");
                    });
                    return new Template(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                });
            }
        },
        delete: function (namespace, name) {
            return $http.delete('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                $translate('template.event.deleted').then(function(label) {
                    $.notify(label, "success");
                });
                return response;
            }, function (error) {
                $.notify(error.data.message, "error");
            });
        },
        all: function (namespace) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace)).then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data.message, "error");
                    } else {
                        return [];
                    }
                });
            });
        }
    }

}]);

templateModule.directive('fileRights', function () {
    var controller = ['$scope', '$translate', function ($scope, $translate) {


            $scope.defaultRightStr = "";
            $scope.appliedRightStr = "";
            $scope.removedRightStr = "";

            $translate('template.rights.default').then(function (label) { $scope.defaultRightStr = label; });
            $translate('template.rights.applied').then(function (label) { $scope.appliedRightStr = label; });
            $translate('template.rights.removed').then(function (label) { $scope.removedRightStr = label; });

            var setValue = function(item, value) {
                if (_.isUndefined($scope.model)) {
                    $scope.model = {};
                }

                $scope.model[item.attr] = value;
            };

            var getValue = function(item) {
                return !_.isUndefined($scope.model) && !_.isUndefined($scope.model[item.attr]) ? $scope.model[item.attr] : null;
            };

            $scope.fileRightsOption = [
                {text: "R", attr: 'read'},
                {text: "W", attr: 'write'},
                {text: "X", attr: 'execute'}];

            $scope.getValue = getValue;

            $scope.getHelp = function(item) {
                var str;
                var value = getValue(item);

                if (_.isNull(value)) {
                    return $scope.defaultRightStr;
                } else if (value === true) {
                    return $scope.appliedRightStr;
                } else {
                    return $scope.removedRightStr;
                }
            };

            $scope.doClick = function(item) {
                var value = getValue(item);

                if (_.isNull(value)) {
                    setValue(item, true);
                } else if (value === true) {
                    setValue(item, false);
                } else {
                    setValue(item, null);
                }
            };
        }];

    return {
        restrict: 'E',
        scope: {
            model: '=',
            label: '@'
        },
        template: '{{label}} <md-button id="template_right-button-{{item.text}}-{{label}}" ng-repeat="item in fileRightsOption" class="md-xxs" ng-class="{\'md-raised\': getValue(item) !== null, \'md-warn\': getValue(item) === true, \'md-strike\': getValue(item) === false}" ng-click="doClick(item)">' +
                  '{{item.text}}' +
                  '<md-tooltip>{{getHelp(item)}}</md-tooltip>' +
                  '</md-button>',
        controller: controller
    };


});
