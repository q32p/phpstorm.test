/**
 * Created by Amirka on 07.02.2017.
 */
(function(gl){
    var dl = gl.dl,
        scopePatched = dl.scopePatched = function($scope){
            $scope.$dr = function(){
                var $scope = this;
                return function(){$scope.$digest();};
            };
            $scope.$xr = function(exp){
                var $scope = this;
                return function(){return $scope.$eval(exp);};
            };
            $scope.$collapse = function(options){
                var scope = this, collapse = objectval(options), promise,
                    end = function(){
                        collapse.transition = false;
                        scope.$digest();
                    };
                collapse.toggle = function(){
                    promise && promise();
                    collapse.transition = true;
                    var delay = collapse.delay;
                    promise = [ end ].go((collapse.active = !collapse.active) ? (delay && delay.show || 300) : (delay && delay.hide || 10) );
                };
                collapse.getHeight = function(){
                    return collapse.active ? (collapse.transition ? collapse.$outerHeight() : 'auto') : (collapse.transition ? collapse.$outerHeight() : 0);
                };
                collapse.active = function(){
                    var delay = collapse.delay;
                    collapse.active || (
                        promise && promise(),
                            collapse.active = true,
                            collapse.transition = true,
                            promise = [ end ].go(delay && delay.show || 300)
                    );
                };
                collapse.close = function(){
                    var delay = collapse.delay;
                    collapse.active && (
                        promise && promise(),
                            collapse.active = false,
                            collapse.transition = true,
                            promise = [ end ].go(delay && delay.hide || 10)
                    );
                };
                return collapse;
            };
            $scope.$scroll = (function(){
                var _box = $('body,html'), scrollOptions = {scrollTop:0}, speed = 600,
                    _w = [function(){_box.animate(scrollOptions,speed);}];
                return function(options) {
                    var top = intval((options = objectval(options)).top);
                    if(options.selector){
                        var _to = $(options.selector);
                        if(_to.length < 1)return;
                        var position = _to.offset();
                        speed = intval(options.speed,600);
                        top += position.top;
                    }
                    scrollOptions.scrollTop = top;
                    _w.go(options.delay);
                    return false;
                };
            })();
            return $scope;
        };
    var angular = gl.angular, module = angular.module('dlScope', []);
    module.run(['$rootScope', function($rootScope){
        scopePatched($rootScope);
        var
            win = $rootScope.win = {width:0,height:0,top:0,left:0},
            digest = $rootScope.$dr(),
            digestNext = [ digest ].goer(500,3),
            digestFall = function(){digestNext.cancel(); digest(); digestNext()};
        $window.bn('resize',function(){
            win.devicePixelRatio = floatval(window.devicePixelRatio);
            win.width = $window.width();
            win.height = $window.height();
            digestFall();
        }).execute();
        $window.bn('scroll',function(){
            var
                top = win.top = $window.scrollTop(),
                left = win.left = $window.scrollLeft();
            digest();
        }).execute();

        //[function(){ $window.scroll(); $window.resize(); }].go(500,4);

    }]);


})(window);