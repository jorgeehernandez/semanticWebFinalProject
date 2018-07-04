angular.module('semanticwebappApp')
  .factory('countClass', function() {
    var count = '';
    return {
      getCount: function() {
        return count;
      },
      setCount: function(d) {
        count = d;
      }
    };
  })
  .controller('ClassesController', function($http, $scope, ModalService,
    sujeto, countClass, query) {
    $scope.inputText = '';
    $scope.sujeto = '';
    $scope.countClass = ''
    $scope.results = {};
    $scope.status = false;
    $scope.message = 'Aun no hemos encontrado nada!';
    $scope.$watch('sujeto', function(newValue, oldValue) {
      if (newValue !== oldValue) sujeto.setSujeto(newValue);
    });
    $scope.details = {};
    $scope.change = function() {
      $scope.sujeto = "<http://localhost:8080/semanticweb/curso/musica/" +
        $scope.inputText + ">";
      $scope.query = "select distinct ?b from <http://jorge.com> where { " +
        "?a <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> ?b. " +
        "filter regex(?b,\"http://localhost:8080/semanticweb/curso\")" +
        "filter regex(?b,\"" + $scope.inputText + "\") }";
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
          // called asynchronously if an error occurs
          // or server returns response with an error status
        });

      $http({
          url: 'http://localhost:8890/sparql',
          headers: {
            'Content-type': 'application/sparql-results+json',
            'Accept': 'application/json'
          },
          method: "GET",
          params: {
            query: "select distinct (count(?b)as ?b) from <http://jorge.com> where { " +
              "?a <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> ?b. " +
              "filter regex(?b,\"http://localhost:8080/semanticweb/curso\")" +
              "filter regex(?b,\"" + $scope.inputText + "\") }",
            format: "application/json"
          }
        })
        .then(function(data, status, headers, config) {
          if (data.data.results.bindings.length > 0) {
            countClass.setCount(data.data.results.bindings[0].b.value);
          } else {}
        })
        .catch(function(data, status, headers, config) {

        });
    }

    $scope.showModal = function(subject) {
      sujeto.setSujeto(subject)
      ModalService.showModal({
        templateUrl: "views/modalClasses.html",
        controller: "modelControllerClases"
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
  .controller('modelControllerClases', function($http, $scope, ModalService,
    sujeto, countClass, query) {
    $scope.showTable = false;
    $scope.countClass = countClass.getCount();
    $scope.details = '';
    $scope.status = true;
    $scope.sujeto = '<' + sujeto.getSujeto() + '>';
    $scope.query = "select ?a from <http://jorge.com> where { " +
      "?a <http://www.w3.org/1999/02/22-rdf-syntax-ns/type> " +
      $scope.sujeto + " }"
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
