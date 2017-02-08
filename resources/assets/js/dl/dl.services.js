/**
 * Created by Amirka on 07.02.2017.
 */

(function(gl){
    var dl = gl.dl || {};
    dl.setServices = function(modules,services){
        var _services = {};
        var module = angular.module('dlServices', modules);
        module.run(services.concat(function(){
            var i = 0, l = services.length;
            for(; i < l; i++)_services[ services[i] ] = arguments[i];
        }));
        var directive = dl.directive = function(name,initialize){
            module.directive(name,function(){
                return {restrict:'A', link: initialize(_services,name)};
            });
        };
        return directive;
    };
})(window);