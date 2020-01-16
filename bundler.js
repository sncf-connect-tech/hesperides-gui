// Note: l'ordonnancement des listes ci-dessous est important
const buildify = require('buildify');

exports.generateAppBundles = function () {
    console.log('Generating app bundles:')
    buildify().concat([
        'src/app/utils.js',
        'src/app/hesperides/hesperides.js',

        'src/app/application/application.js',
        'src/app/datepicker/datepicker.js',
        'src/app/diff/diff.js',
        'src/app/event/event.js',
        'src/app/file/file.js',
        'src/app/local_changes/localChanges.js', // doit venir avant les fichier suivants
        'src/app/local_changes/localChangeFactory.js',
        'src/app/local_changes/localChangesControllers.js',
        'src/app/local_changes/localChangesServices.js',
        'src/app/menu/menu.js',
        'src/app/model/model.js',
        'src/app/module/module.js',
        'src/app/properties/properties.js', // doit venir le fichier ci-dessous
        'src/app/properties/iterable-properties-container.js',
        'src/app/shared/components.js',
        'src/app/techno/techno.js',
        'src/app/template/template.js',
        'src/app/user/user.js',
      ]).save('src/app/app.js');
    buildify().concat([
        'src/app/hesperides.css',
        'src/app/welcome_screen.css',
        'src/app/datepicker/datepicker.css',
        'src/app/diff/diff.css',
        'src/app/menu/menu.css',
        'src/app/module/module.css',
        'src/app/properties/iterable-properties-container.css',
        'src/app/properties/properties.css',
        'src/app/local_changes/localChanges.css',
        'src/app/sc-date-time/sc-date-time.css',
        'src/app/user/user.css',
      ]).save('src/app/app.css');
};

exports.generateVendorBundles = function () {
    console.log('Generating vendor bundles:')
    buildify().concat([
        'node_modules/angular/angular.js', // Doit être chargé avant les libs ci-dessous :
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-i18n/angular-locale_fr-fr.js',
        'node_modules/angular-material/angular-material.js',
        'node_modules/angular-resource/angular-resource.js',
        'node_modules/angular-route/angular-route.js',
        'node_modules/angular-translate/dist/angular-translate.js', // Doit être chargé avant les libs ci-dessous :
        'node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'node_modules/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
        'node_modules/angular-translate-storage-local/angular-translate-storage-local.js',
        'node_modules/angular-wizard/dist/angular-wizard.js',
        'node_modules/@cgross/angular-notify/dist/angular-notify.js',
        'node_modules/x2js/x2js.js', // Nécessaire pour la lib ci-dessous :
        'node_modules/angular-xeditable/dist/js/xeditable.js',
        'node_modules/angular-xml/angular-xml.js',
        'node_modules/angular-vs-repeat/dist/angular-vs-repeat.js',
        'node_modules/arrive/minified/arrive.min.js',
        'node_modules/downloadjs/download.min.js',
        'node_modules/html2canvas/dist/html2canvas.js',
        'node_modules/js-yaml/dist/js-yaml.js',
        'node_modules/moment/min/moment.min.js',
        // Codemirror doit être chargé avant ses addons & angular-ui-codemirror :
        'node_modules/codemirror/lib/codemirror.js',
        'node_modules/codemirror/addon/display/autorefresh.js',
        'node_modules/codemirror/addon/display/fullscreen.js',
        'node_modules/codemirror/addon/mode/overlay.js',
        'node_modules/codemirror/mode/properties/properties.js',
        'node_modules/codemirror/mode/yaml/yaml.js',
        'node_modules/angular-ui-codemirror/src/ui-codemirror.js',
        'node_modules/jszip/dist/jszip.min.js',
        'node_modules/jszip/vendor/FileSaver.js',
        'node_modules/lodash/lodash.js',
        'node_modules/sc-date-time/sc-date-time.js',
        'node_modules/store.js/store.js',
        'node_modules/@sentry/browser/build/bundle.min.js',
        'node_modules/@sentry/integrations/build/angular.min.js',
        'node_modules/diff/dist/diff.js',
      ]).save('src/app/vendor.js')
      .uglify().save('src/app/vendor.min.js');
    buildify().concat([
        'node_modules/angular-material/angular-material.css',
        'node_modules/angular-wizard/dist/angular-wizard.css',
        'node_modules/angular-xeditable/dist/css/xeditable.css',
        'node_modules/@cgross/angular-notify/dist/angular-notify.css',
        'node_modules/codemirror/addon/display/fullscreen.css',
        'node_modules/codemirror/lib/codemirror.css',
        'node_modules/font-awesome/css/font-awesome.min.css',
      ]).save('src/app/vendor.css');
};

if (require.main === module) { // means we are executed as a script, not loaded as a lib
    exports.generateVendorBundles();
    exports.generateAppBundles();
}
