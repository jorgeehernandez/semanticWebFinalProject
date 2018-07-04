'use strict';

/**
 * @ngdoc function
 * @name semanticwebappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the semanticwebappApp
 */
angular.module('semanticwebappApp')
  .controller('ExplorerController', function($scope, $http, sujeto,
    ModalService) {
    $scope.showTable = false;
    $scope.showD3 = false;
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
        $scope.queriesText = $scope.inputText.split(' ');
        var queryText;
        $scope.i = 0;
        for (queryText in $scope.queriesText) {
          if ($scope.queriesText[queryText].length > 0) {
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
              " filter regex(?a,\"" + $scope.queriesText[queryText] +
              "\")} ";
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
                  var str = data.config.params.query;
                  var search = str.substring(str.lastIndexOf('?a,"') + 4,
                    str.lastIndexOf('")}'));
                  data.data.results.bindings.search = search;
                  $scope.results[$scope.i] = data.data.results.bindings;
                  $scope.i++;
                } else {
                  $scope.showTable = false;
                  $scope.i++;
                  $scope.message = 'Ningun resultado fue encontrado! :('
                }

              })
              .catch(function(data, status, headers, config) {});
          }
        }
      }
    }

    $scope.showGraph = function(subject) {
      $scope.sujeto = subject;
      sujeto.setSujeto(subject)
      $scope.showD3 = true;
    }

  })
  .directive('d3graph', ['$http', function($http) {

    var directive = {};
    directive.restrict = 'A';
    directive.replace = false;
    directive.link = function(scope, elements, attr) {

      var sujeto = scope[attr.data];
      scope.$watchCollection('sujeto', function(newVal, oldVal) {
        sujeto = newVal;
        load_data(sujeto);
      });

      var w = 960,
        h = 800,
        i = 0,
        barHeight = 20,
        barWidth = w * .8,
        duration = 400,
        root;

      var tree = d3.layout.tree()
        .size([h, 100]);

      var diagonal = d3.svg.diagonal()
        .projection(function(d) {
          return [d.y, d.x];
        });

      var vis = d3.select(elements[0]).append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(20,30)");

      function load_data(sujeto) {

        var sujeto = '<' + sujeto + '>';
        var query =
          "SELECT distinct  ?a ?b FROM <http://jorge.com> WHERE { " +
          sujeto + "  ?a ?b} ";

        $http({
            url: 'http://localhost:8890/sparql',
            headers: {
              'Content-type': 'application/sparql-results+json',
              'Accept': 'application/json'
            },
            method: "GET",
            params: {
              query: query,
              format: "application/json"
            }
          })
          .then(function(data, status, headers, config) {
            if (data.data.results.bindings.length > 0) {
              var results = data.data.results.bindings;
              console.log(results)
              getData(results);

            } else {}
          })
          .catch(function(data, status, headers, config) {

          });
      }

      function getData(results) {
        var i = 0;
        var object_type = null
        var object_properties = {
          "name": "Properties",
          "children": []
        };
        for (i; i < results.length; i++) {
          var a = results[i].a.value;
          var b = results[i].b.value;

          if (a == "http://www.w3.org/1999/02/22-rdf-syntax-ns/type") {
            if (object_type) {
              object_type.children.push({
                "name": b
              })
            } else {
              object_type = {
                "name": a,
                "children": [{
                  "name": b
                }]
              }
            }
          } else {
            if (object_properties.children.length > 0) {
              var j = 0;
              for (j; j < object_properties.children.length; j++) {
                if (object_properties.children[j].name == a) {
                  object_properties.children[j].children.push({
                    "name": b
                  });
                  break;
                } else {
                  var o = {
                    "name": a,
                    "children": [{
                      "name": b
                    }]
                  };
                  object_properties.children.push(o)
                  break;
                }
              }
            } else {
              var o = {
                "name": a,
                "children": [{
                  "name": b
                }]
              }
              object_properties.children.push(o)
              console.log(o)
            }
          }
        }
        var data_ = {
          "name": sujeto,
          "children": []
        }
        data_.children.push(object_properties)
        data_.children.push(object_type)
        data_.x0 = 0;
        data_.y0 = 0;
        update(root = data_);
        click(root);

      }
      // d3.json("scripts/test.json", function(json) {
      //   json.x0 = 0;
      //   json.y0 = 0;
      //   update(root = json);
      //   click(root);
      // });

      function update(source) {

        // Compute the flattened node list. TODO use d3.layout.hierarchy.
        var nodes = tree.nodes(root);
        var height = Math.max(500, nodes.length * barHeight);

        d3.select("svg").transition()
          .duration(duration)
          .attr("height", height + 20);

        d3.select(self.frameElement).transition()
          .duration(duration)
          .style("height", height + 50 + "px");

        // Compute the "layout".
        nodes.forEach(function(n, i) {
          n.x = i * barHeight;
        });

        // Update the nodesâ€¦
        var node = vis.selectAll("g.node")
          .data(nodes, function(d) {
            return d.id || (d.id = ++i);
          });

        var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
          })
          .style("opacity", 1e-6);

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("rect")
          .attr("y", -barHeight / 2)
          .attr("height", barHeight)
          .attr("width", barWidth)
          .style("fill", color)
          .on("click", click);

        nodeEnter.append("text")
          .attr("dy", 3.5)
          .attr("dx", 5.5)
          .text(function(d) {
            return d.name;
          });

        // Transition nodes to their new position.
        nodeEnter.transition()
          .duration(duration)
          .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
          })
          .style("opacity", 1);

        node.transition()
          .duration(duration)
          .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
          })
          .style("opacity", 1)
          .select("rect")
          .style("fill", color);

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
          })
          .style("opacity", 1e-6)
          .remove();

        // Update the linksâ€¦
        var link = vis.selectAll("path.link")
          .data(tree.links(nodes), function(d) {
            return d.target.id;
          });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var o = {
              x: source.x0,
              y: source.y0
            };
            return diagonal({
              source: o,
              target: o
            });
          })
          .transition()
          .duration(duration)
          .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
          .duration(duration)
          .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = {
              x: source.x,
              y: source.y
            };
            return diagonal({
              source: o,
              target: o
            });
          })
          .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      // Toggle children on click.
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }

      function color(d) {
        return d._children ? "#3182bd" : d.children ? "#c6dbef" :
          "#fd8d3c";
      }
    }

    return directive;
  }]);
