'use strict';

angular.module('sw.plugin.base', ['sw.plugins'])
    .factory('base', function ($q, $log) {
        return {
            execute: execute
        };

        function execute (url, swagger) {
            $log.debug('sw:plugin', 'base');

            var deferred = $q.defer();

            if (swagger && swagger.paths) {
                var parts = {};
                var min = Number.MAX_VALUE;

                angular.forEach(swagger.paths, function (path, key) {
                    parts[key] = key.split('/');
                    min = Math.min(min, parts[key].length);
                });

                var paths = Object.keys(swagger.paths);
                var sames = [];

                for (var i = 0; i < min; i++) {
                    var first = parts[paths[0]][i];

                    if (/\{.+\}/.test(first)) {
                        break;
                    }

                    var same = true;

                    for (var j = 1; j < paths.length; j++) {
                        if (parts[paths[j]][i] !== first) {
                            same = false;
                            break;
                        }
                    }

                    if (same) {
                        sames.push(first);
                    } else {
                        break;
                    }
                }

                if (sames.length > 1) {
                    var extracted = sames.join('/').substring(1);

                    $log.debug('sw:plugin:base:extracted', extracted);

                    swagger.basePath = (swagger.basePath || '/') + extracted;

                    angular.forEach(paths, function (path) {
                        swagger.paths['/' + parts[path].slice(sames.length).join('/')] = swagger.paths[path];
                        delete swagger.paths[path];
                    });
                }
            }

            deferred.resolve(true);

            return deferred.promise;
        }
    })
    .run(function (plugins, base) {
        plugins.add(plugins.BEFORE_PARSE, base);
    });