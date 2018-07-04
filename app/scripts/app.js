'use strict';

/**
 * @ngdoc overview
 * @name semanticwebappApp
 * @description
 * # semanticwebappApp
 *
 * Main module of the application.
 */
angular
  .module('semanticwebappApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularModalService',
    'angularUtils.directives.dirPagination'
  ])
  .config(function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/instance_navegator', {
        templateUrl: 'views/instance.html',
        controller: 'InstanceController',
        controllerAs: 'intance'
      })
      .when('/classes_navegator', {
        templateUrl: 'views/classes.html',
        controller: 'ClassesController',
        controllerAs: 'classes'
      }).when('/properties_navegator', {
        templateUrl: 'views/properties.html',
        controller: 'PropertiesController',
        controllerAs: 'properties'
      }).when('/explorer', {
        templateUrl: 'views/explorer.html',
        controller: 'ExplorerController',
        controllerAs: 'explorer'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
