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

var feedbackModule = angular.module('hesperides.feedback', []);

feedbackModule.controller("FeedbackCtrl", ['$scope', "$translate", function ($scope, $translate) {

    $scope.feedbackRoomName = hesperidesConfiguration.feedbackRoomName;

    // Overrides options of send-feedback plugin
    $scope.feedbackOptions  = {
        postBrowserInfo: false,
        postHTML: false,
        strokeStyle: "green",
        shadowColor: "green",
        html2canvasURL: 'bower_components/html2canvas/build/html2canvas.js',
        ajaxURL: window.location.origin+"/rest/feedback/hipchat",
        // Need to overrides all tpl options to translate the label of the plugin
        tpl: {
            initButton:
            '<div id="feedback-button"></div>' +
            '<button id="feedback-button-contact-us" class="feedback-btn feedback-btn-gray">' +
            $translate.instant('feedback.button') +
            '</button></div>',
            highlighter:
            '<div id="feedback-highlighter"><div class="feedback-logo">' +
            $translate.instant('feedback.logo') +
            '</div><p>' +
            $translate.instant('feedback.highlighter.desc') +
            '</p><button class="feedback-sethighlight feedback-active"><div class="ico"></div><span>' +
            $translate.instant('feedback.highlighter.highlight.ico') +
            '</span></button><label>' +
            $translate.instant('feedback.highlighter.highlight.desc') +
            '</label><button class="feedback-setblackout"><div class="ico"></div><span>' +
            $translate.instant('feedback.highlighter.blackout.ico') +
            '</span></button><label class="lower">' +
            $translate.instant('feedback.highlighter.blackout.desc') +
            '</label><div class="feedback-buttons">' +
            '<button id="feedback-highlighter-next" class="feedback-next-btn feedback-btn-gray">' +
            $translate.instant('feedback.highlighter.next') +
            '</button>' +
            '<button id="feedback-highlighter-back" class="feedback-back-btn feedback-btn-gray">' +
            $translate.instant('feedback.highlighter.back') +
            '</button></div><div class="feedback-wizard-close"></div></div>',
            overview:
            '<div id="feedback-overview"><div class="feedback-logo">' +
            $translate.instant('feedback.logo') +
            '</div><div id="feedback-overview-description"><div id="feedback-overview-description-text"><h3>' +
            $translate.instant('feedback.overview.description') +
            '</h3></div></div><div id="feedback-overview-screenshot"><h3>' +
            $translate.instant('feedback.overview.screenshot') +
            '</h3></div><div class="feedback-buttons">' +
            '<button id="feedback-submit" class="feedback-submit-btn feedback-btn-blue">' +
            $translate.instant('feedback.overview.submit') +
            '</button>' +
            '<button id="feedback-overview-back" class="feedback-back-btn feedback-btn-gray">' +
            $translate.instant('feedback.overview.back') +
            '</button></div>' +
            '<div id="feedback-overview-error">' +
            $translate.instant('feedback.overview.error') +
            '</div><div class="feedback-wizard-close"></div></div>',
            submitSuccess:
            '<div id="feedback-submit-success">' +
            '<div class="feedback-logo">' +
            $translate.instant('feedback.logo') +
            '</div><p>' +
            $translate.instant('feedback.submit.success.desc1') +
            '</p><p>' +
            $translate.instant('feedback.submit.success.desc2') +
            '<b>' +
            $scope.feedbackRoomName +
            '</b>' +
            $translate.instant('feedback.submit.success.desc3') +
            '</p>' +
            '<button id="feedback-submit-success-button-ok" class="feedback-close-btn feedback-btn-blue">' +
            $translate.instant('feedback.submit.success.ok') +
            '</button>' +
            '<div class="feedback-wizard-close"></div></div>',
            submitError:
            '<div id="feedback-submit-error">' +
            '<div class="feedback-logo">' +
            $translate.instant('feedback.logo') +
            '</div><p>' +
            $translate.instant('feedback.submit.error') +
            '</p>' +
            '<button class="feedback-close-btn feedback-btn-blue">' +
            $translate.instant('feedback.submit.error.ok') +
            '</button>' +
            '<div class="feedback-wizard-close"></div></div>'
        },
    };
}]);

