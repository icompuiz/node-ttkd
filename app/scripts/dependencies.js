/**
 * configure RequireJS
 * prefer named modules to long paths, especially for version mgt
 * or 3rd party libraries
 */
requirejs.config({

    paths: {
        'domReady': '../bower_components/requirejs-domready/domReady',
        'angular': '../bower_components/angular/angular',
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router',
        'handlebars': '../bower_components/handlebars/handlebars',
        // 'text': '../bower_components/requirejs-text/text',
        '_': '../bower_components/lodash/dist/lodash',
        'aysnc': '../bower_components/async/lib/async',
        '$': '../bower_components/jquery/dist/jquery',
        'angular-bootstrap':'../bower_components/angular-bootstrap/ui-bootstrap',
        'angular-file-upload':'../bower_components/angular-file-upload/angular-file-upload.min',
        'restangular':'../bower_components/restangular/dist/restangular.min',
        'angular-bootstrap-tmpls': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
        'ngGrid': '../bower_components/ng-grid/ng-grid-2.0.13.min',
        'sigPad': '../bower_components/signature_pad/signature_pad'
      },

    /**
     * for libs that either do not support AMD out of the box, or
     * require some fine tuning to dependency mgt'
     */
      shim: {
        'angular':{
            exports: 'angular'
          },
          'restangular': {
            deps:['angular', '_'],
          },
          'angular-ui-router':{
            deps:['angular']
          },
          'handlebars':{
            exports:'Handlebars'
          },
          '_':{
            exports:'_'
          },
          'angular-bootstrap-tmpls':{
            deps: ['angular']
          },
          'angular-bootstrap':{
            deps:['angular', '$', 'angular-bootstrap-tmpls']
          },
          'angular-file-upload':{
            deps:['angular']
          },
          'ngGrid':{
            deps: ['angular', '$']
          },
          'sigPad':{
            deps: ['$']
          }
        },

        deps: [
        // kick start application... see bootstrap.js
            './bootstrap'
          ]
        });