/**
 * Created by Amirka on 07.02.2017.
 */

/*!
 additional.js || Absalyamov Amir Nailevich | 2016-12-09T05:08:00+03:00 | mr.amirka@ya.ru, vk.com\mr.amirka, dartlie.ru
 */
(function(gl) {
    'use strict';

    var $ = gl.jQuery,
        $window = gl.$window = $(window), $html, $body,
        $document = gl.$document = $(document);


    dl.require('document')(function () {
        $html = gl.$html = $('html');
        $body = gl.$body = $('body');
        /*
         CSS Browser Selector v0.4.0 (Nov 02, 2010)
         Rafael Lima (http://rafael.adm.br)
         http://rafael.adm.br/css_browser_selector
         License: http://creativecommons.org/licenses/by/2.5/
         Contributors: http://rafael.adm.br/css_browser_selector#contributors

         CSS Browser Selector v1.2015-12-30 DL
         Edited by Amir Absalayamov 2015-12-30T05:32:00+03:00 (vk.com/mr.amirka , dartline.ru)
         */
        var
            browserClass = function (u) {
                var ua = u.toLowerCase(), is = function (t) {
                    return ua.indexOf(t) > -1
                }, g = 'gecko', w = 'webkit', s = 'safari', o = 'opera', m = 'mobile';
                return [(!(/opera|webtv/i.test(ua)) && /msie\s(\d)/.test(ua)) ? ('ie ie' + RegExp.$1) : is('firefox/2') ? g + ' ff2' : is('firefox/3.5') ? g + ' ff3 ff3_5' : is('firefox/3.6') ? g + ' ff3 ff3_6' : is('firefox/3') ? g + ' ff3' : is('gecko/') ? g : is('opera') ? o + (/version\/(\d+)/.test(ua) ? ' ' + o + RegExp.$1 : (/opera(\s|\/)(\d+)/.test(ua) ? ' ' + o + RegExp.$2 : '')) : is('konqueror') ? 'konqueror' : is('blackberry') ? m + ' blackberry' : is('android') ? m + ' android' : is('chrome') ? w + ' chrome' : is('iron') ? w + ' iron' : is('applewebkit/') ? w + ' ' + s + (/version\/(\d+)/.test(ua) ? ' ' + s + RegExp.$1 : '') : is('mozilla/') ? g : '', is('j2me') ? m + ' j2me' : is('iphone') ? m + ' iphone' : is('ipod') ? m + ' ipod' : is('ipad') ? m + ' ipad' : is('mac') ? 'mac' : is('darwin') ? 'mac' : is('webtv') ? 'webtv' : is('win') ? 'win' + (is('windows nt 6.0') ? ' vista' : '') : is('freebsd') ? 'freebsd' : (is('x11') || is('linux')) ? 'linux' : '', 'js'].join(' ');
            },
            _class = browserClass(navigator.userAgent);
        [$html, $body].forEach(function ($item) {
            $item.removeClass('no-js');
            $item.addClass(_class);
        });
    });


    var
        _target = dl.target = function (e, d, t) {
            return isObject(e) ? ( (t = e.target) ? t : ( (t = e.toElement) ? t : _target(e.originalEvent, d)) ) : ( d ? _target(d) : t );
        },
        _one = function (e, d) {
            var _e = _extend({}, e, 1);
            _e.target = _target(e, d);
            _e.clientX = e.clientX || e.pageX || 0;
            _e.clientY = e.clientY || e.pageY || 0;
            d && (_e.defaultEvent = d);
            return _e;
        },
        _touch = dl.touch = function (c) {
            return function (e) {
                var self = this, touches = e.changedTouches, touch, args;
                if (!touches && e.originalEvent) touches = e.originalEvent.changedTouches;
                if (touches && touches.length > 0) {
                    var r, i = 0, l = touches.length;
                    for (; i < l; i++) {
                        args = dl.arrayCopy(arguments);
                        (touch = args[0] = _one(touches[i], e)).type || (touch.type = e.type);

                        (c.apply(self, args) === false) && (r = false);
                    }
                    return r;
                }
                args = dl.arrayCopy(arguments);
                args[0] = _one(e);
                return c.apply(self, args);
            };
        };

    /* fix for jQuery powered by Absalyamov Amir 2016-11-06 : event of remove, image naturalWidth,
     less, browserClass
     */

    (function ($) {

        $.browser || ($.browser = {}); //fix for old plugins with new jQuery version

        $.fn.remove = (function () {
            var x = $.fn.remove, h = $.fn.html, y = $.fn.empty,
                e = new $.Event('remove'), _each = function () {
                    r($(this));
                },
                r = function (o) {
                    o.children().each(_each);
                    o.triggerHandler(e);
                    return o;
                };
            $.fn.html = function () {
                return h.apply(arguments.length ? r(this) : this, arguments);
            };
            $.fn.empty = function () {
                return y.apply(r(this), arguments);
            };
            return function () {
                return x.apply(r(this), arguments);
            };
        })();
        $.fn.naturalWidth = (function () {
            var i = new Image(), img = function (u) {
                var i = new Image();
                i.src = u;
                return i;
            };
            if (i.naturalWidth) {
                $.fn.naturalHeight = function () {
                    var s = this[0];
                    return s ? s.naturalHeight : 0;
                };
                return function () {
                    var s = this[0];
                    return s ? s.naturalWidth : 0;
                };
            }
            $.fn.naturalHeight = function () {
                return img(this.attr('src')).height;
            };
            return function () {
                return img(this.attr('src')).width;
            };
        })();
        $.fn.bn = function (event, callback) {
            var
                self = this,
                args = arguments,
                promise = function () {
                    self.unbind.apply(self, args);
                };
            promise.execute = callback;
            self.bind.apply(self, args);
            return promise;
        };
        $.fn.bnClass = function () {
            var s = this, a = arguments;
            s.addClass.apply(s, a);
            return function () {
                s.removeClass.apply(s, a);
            };
        };

        $.fn.triggerMaker = function () {
            var s = this, a = arguments;
            return function () {
                s.trigger.apply(s, arguments)
            };
        };

        $.fn.inviewport = function ($container, threshold) {
            $container || ($container = $window);
            threshold || (threshold = 0);

            var element = this, top = 0, left = 0, p;
            $container[0] === window ? (top += $container.scrollTop(), left += $container.scrollLeft()) :
                (top += (p = $container.offset()).top, left += p.left);
            var bottom = top + $container.height(), right = left + $container.width(),
                ep = element.offset(),
                t = ep.top,
                b = t + element.height() + threshold,
                l = ep.left,
                r = l + element.width() + threshold;
            t -= threshold;
            l -= threshold;
            return t >= bottom ? 0 : (b <= top ? 0 : (l >= right ? 0 : (r <= left ? 0 : 1)));
        };
        $.fn.appearLoop = function (callback, options) {
            var element = this, _options = dl._extend({distance: 2000, scroll: 1, container: window}, options, 1),
                container = _options.container, distance = intval(_options.distance),
                $container = container === window ? $window : $(container),
                stop, update = function () {
                    if (stop || !(element.is(":visible") && element.inviewport($container, distance)))return;
                    callback && callback();
                    element.trigger("appear");
                },
                destroys = [
                    function () {
                        stop = 1;
                    },
                    $window.bn("resize", update),
                    element.bn("dl.refresh", update)
                ];
            _options.scroll && destroys.push($container.bn('scroll', update));


            (/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion) && destroys.push($window.bn("pageshow", function (e) {
                e.originalEvent && e.originalEvent.persisted && element.trigger("appear");
            }));

            setTimeout(update, 200);
            return destroys.executer();
        };
        $.fn.appear = function (callback, options) {
            var cancel = this.appearLoop(function () {
                cancel();
                callback && callback();
            }, options);
            return cancel;
        };
        $.fn.transitionEnd = (function () {
            var transitions = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd otransitionend',
                    transition: 'transitionend'
                }, el = document.createElement('x'),
                transition, k;
            for (k in transitions)el.style[k] !== undefined && (transition = transitions[k]);
            return function (callback) {
                return this.bn(transition, callback);
            };
        })();

    })($);
})(window);