'use strict';

angular.module('semanticwebappApp')
  .factory('sujeto', function() {
    var sujeto = '';
    return {
      getSujeto: function() {
        return sujeto;
      },
      setSujeto: function(d) {
        sujeto = d;
      }
    };
  })
  .factory('query', function() {
    var query = '';
    return {
      getQuery: function() {
        return query;
      },
      setQuery: function(d) {
        query = d;
      }
    };
  })
  .controller('InstanceController', function($http, $scope, ModalService,
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
      if ($scope.inputText.length > 2) {
        $scope.query =
          "SELECT distinct ?a FROM <http://jorge.com> WHERE {{ " +
          "?a" +
          " <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> <http://localhost:8080/semanticweb/curso/musica/Álbum> } UNION { " +
          "?a" +
          " <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> <http://localhost:8080/semanticweb/curso/musica/Artista> } UNION { " +
          "?a" +
          " <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> <http://localhost:8080/semanticweb/curso/musica/Canción> } UNION { " +
          "?a" +
          " <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> <http://localhost:8080/semanticweb/curso/musica/Sello_Discografico> } UNION { " +
          "?a" +
          " <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> <http://localhost:8080/semanticweb/curso/musica/País> } " +
          " filter regex(?a,\"" + $scope.inputText + "\")} "
        $scope.status = true;

        $http({
            url: 'http://localhost:8890/sparql',
            headers: {
              'Content-type': 'application/sparql-results+json',
              'Accept': 'application/json'
                // 'Access-Control-Allow-Origin': '*',
                // 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
                // 'Access-Control-Max-Age': '3600',
                // 'Access-Control-Allow-Headers': 'x-requested-with'
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

  })
  .controller('modelController', function($http, $scope, ModalService,
    sujeto, query) {
    $scope.details = '';
    $scope.count = ''
    $scope.status = false;
    $scope.sujeto = '<' + sujeto.getSujeto() + '>';
    $scope.query = "SELECT distinct  ?a ?b FROM <http://jorge.com> WHERE { " +
      $scope.sujeto + "  ?a ?b} ";
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
          second();
        } else {}
      })
      .catch(function(data, status, headers, config) {

      });
    var second = function() {
      $http({
          url: 'http://localhost:8890/sparql',
          headers: {
            'Content-type': 'application/sparql-results+json',
            'Accept': 'application/json'
          },
          method: "GET",
          params: {
            query: "SELECT distinct (count(?b) as ?b) FROM <http://jorge.com> WHERE { " +
              $scope.sujeto + "  ?a ?b} ",
            format: "application/json"
          }
        })
        .then(function(data, status, headers, config) {
          if (data.data.results.bindings.length > 0) {
            $scope.count = data.data.results.bindings[0].b.value;
            query.setQuery($scope.query);
          } else {}
        })
        .catch(function(data, status, headers, config) {

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
  })
  .controller('modelControllerQuery', function($scope, ModalService, query) {

    $scope.query = query.getQuery();

  });
