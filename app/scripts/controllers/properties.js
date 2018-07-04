'use strict';
angular.module('semanticwebappApp')
  .controller('PropertiesController', function($scope, $http, ModalService,
    sujeto, query) {
    $scope.showTable = false;
    $scope.inputText = '';
    $scope.sujeto = '';
    $scope.results = {};
    $scope.status = false;
    $scope.$watch('sujeto', function(newValue, oldValue) {
      if (newValue !== oldValue) sujeto.setSujeto(newValue);
    });
    $scope.details = {};
    $scope.message = 'Aun no hemos encontrado nada!';

    $scope.change = function() {
      if ($scope.inputText.length > 0) {
        $scope.query =
          "SELECT distinct ?a FROM <http://jorge.com> WHERE { ?a <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> " +
          "<http://www.w3.org/2002/07/owl/ObjectProperty> filter regex(?a,\"" +
          $scope.inputText + "\")}"
        $scope.status = true;
        $http({
            url: 'http://localhost:8890/sparql',
            headers: {
              'Content-type': 'application/sparql-results+json',
              'Accept': 'application/json'
            },
            method: "GET",
            params: {
              query: $scope.query,
              format: "application/json"
            }
          })
          .then(function(data, status, headers, config) {
            // callback called asynchronously when the response is available
            if (data.data.results.bindings.length > 0) {
              $scope.showTable = true;
              $scope.results = data.data.results.bindings;
            } else {
              $scope.showTable = false;
              $scope.message = 'Ningun resultado fue encontrado! :('
            }

          })
          .catch(function(data, status, headers, config) {

          });
      }
    }

    $scope.showModal = function(subject) {
      sujeto.setSujeto(subject)
      ModalService.showModal({
        templateUrl: "views/modalProperties.html",
        controller: "modelControllerProperties"
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {});
      });

      $scope.showQueries = function() {
        query.setQuery($scope.query);
        ModalService.showModal({
          templateUrl: "views/modalQuery.html",
          controller: "modelControllerQuery"
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {});
        });
      }
    }

  }).controller('modelControllerProperties', function($http, $scope,
    ModalService, sujeto, query) {
    $scope.showTable = false;
    $scope.details = '';
    $scope.sujeto = '<' + sujeto.getSujeto() + '>';
    $scope.query =
      " SELECT distinct ?a ?b  FROM <http://jorge.com> WHERE {   ?a " +
      $scope.sujeto + " ?b }";
    $scope.status = true;
    $http({
        url: 'http://localhost:8890/sparql',
        headers: {
          'Content-type': 'application/sparql-results+json',
          'Accept': 'application/json'
        },
        method: "GET",
        params: {
          query: $scope.query,
          format: "application/json"
        }
      })
      .then(function(data, status, headers, config) {
        if (data.data.results.bindings.length > 0) {
          $scope.details = data.data.results.bindings;
        } else {}

      })
      .catch(function(data, status, headers, config) {

      });

    $scope.showModal = function(subject) {
      sujeto.setSujeto(subject)
      ModalService.showModal({
        templateUrl: "views/modal.html",
        controller: "modelController"
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {});
      });
    }
    $scope.showQueries = function() {
      query.setQuery($scope.query);
      ModalService.showModal({
        templateUrl: "views/modalQuery.html",
        controller: "modelControllerQuery"
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {});
      });
    }

  });
