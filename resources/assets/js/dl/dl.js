/**
 * Created by Amirka on 07.02.2017.
 */
/*!
 dl.js || Absalyamov Amir Nailevich | 2016-12-09T05:08:00+03:00 | mr.amirka@ya.ru, vk.com\mr.amirka, dartlie.ru
 */

(function(gl){'use strict';
    var
        isObject = gl.isObject = function(v){return v === null ? false : ((typeof v) == 'object');},
        isArray = gl.isArray = Array.isArray ? Array.isArray : function(v){return ( v instanceof Array );},
        isBoolean = gl.isBoolean = function(v){return (typeof v) == 'boolean';},
        isNumber = gl.isNumber = function(v){return (typeof v) == 'number';},
        isNumeric = gl.isNumeric = function(v){return !isNaN(v = parseFloat(v)) && isFinite(v);},
        isFunction = gl.isFunction = function(v){return (typeof v) == 'function';},
        isString = gl.isString = function(v){return (typeof v) == 'string';},
        isScalar = gl.isScalar = function(v){return (/string|number|boolean/).test(typeof v);},
        isEmptyObject = gl.isEmptyObject = function(m){
            for(var k in m)return false;
            return 1;
        },
        isEmpty = gl.isEmpty = function(m){
            if(!isObject(m))return !m;
            if(isArray(m))return m.length < 1;
            for(var k in m)return false;
            return true;
        },
        _isNotEqual = function(d, s, depth){
            if(d === s)return false;
            if( depth < 1 || !(isObject(d) && isObject(s)) )return true;
            var k, map = {};
            for(k in d){
                if(_isNotEqual(d[k], s[k], depth - 1))return true;
                map[k] = true;
            }
            for(k in s){
                if(!map[k] && _isNotEqual(s[k], d[k], depth - 1))return true;
            }
            return false;
        },
        isEqual = gl.isEqual = function(d,s,depth){
            return !_isNotEqual(d, s, intval(depth, 10) );
        },
        _isNotLike = function(d, s, depth){
            if(d === s)return false;
            if( isBoolean(d) && (d == !!s) )return false;
            if( depth < 1 || !(isObject(d) && isObject(s)) )return true;
            var k;
            for(k in d){
                if(_isNotLike(d[k], s[k], depth - 1))return true;
            }
            return false;
        },
        isLike = gl.isLike = function(d,s,depth){
            return !_isNotLike(d, s, intval(depth, 10) );
        },

        /* is browser? */
        win = gl.window, dl = isObject(gl.dl) ? gl.dl : {};

    /* export */
    if(isObject(gl.module) && isObject(module.exports)){
        module.exports = dl;
    }else if(isFunction(gl.define) && define.amd){
        gl.define([],function(){return dl;});
    }else gl.dl = dl;

    var
        _slice = Array.prototype.slice,
        arrayCopy = dl.arrayCopy = function(items,start,end){
            return _slice.apply(items,start,end);
        },
        modval = function (m){
            function f(n,d,t){return t == 'boolean' ? (n ? 1 : 0) : (t == 'number' ? (isNaN(n) ? d || 0 : n) : (t == 'string' ? (isNaN(n = m(n)) ? d || 0 : n): d || 0 ));}
            return function(v,d,n){return isNumeric(v = f(v,d,typeof v)) && n !== undefined && v < n ? n : v;};
        },
        intval = gl.intval = modval(parseInt), floatval = gl.floatval = modval(parseFloat),
        stringval = gl.stringval = function(v,d){d = (d === undefined ? '' : d); return ''+(isScalar(v) ? (v === '' ? d : v) :d);},
        objectval = gl.objectval = function(v,d){return isObject(v) ? v : (d === undefined ? {} : d);},
        arrayval = gl.arrayval = function(v,d){return isArray(v) ? v : (d === undefined ? (v === undefined ? [] : [ v ]) : d);},
        watchval = gl.watchval = function(v){return isArray(v) ? v : (isFunction(v) ? [v] : [] );},
        _copy = dl.copy = function(src, depth, dst){
            return [ src ].merge(dst, depth);
        },
        __clone = function(s,l,a){
            if(l < 0 || !isObject(s))return s;
            var d, i = 0;
            if(isArray(s)){
                d = [];
                if(l-- > 0){
                    for(var len = s.length; i < len; i++)d.push(__clone(s[i],l,a));
                    return d;
                }
                d.push.apply(d,s);
                return d;
            }
            var k, v;
            d = {};
            l--;
            if(isArray(a)){
                for(; i < a.length; i++){
                    if( (v = s[k = a[i]]) === undefined)continue;
                    d[k] = isObject(v) ? __clone(v,l,a) : v;
                }
                return d;
            }
            for(k in s)d[k] = isObject(v = s[k]) ? __clone(v,l,a) : v;
            return d;
        },

// src, depth, keys copy */
        _clone = dl.clone = function(s,l,a){return __clone(s,intval(l),a);},

// dst,src,nocopy,copy
        objectSync = dl.objectSync = function(dst,src,nocopy,copy){
            if(dst === src || !isObject(src))return dst;
            dst = objectval(dst);
            var tmp, i = 0, k, l, v, type;
            if( isArray(nocopy) || (type = typeof nocopy) === 'string' && (nocopy = [ nocopy ]) ){
                tmp = {};
                for(l = nocopy.length; i < l; i++)((v = dst[k = nocopy[i]]) === undefined) || (tmp[k] = v);
            }else{
                type === 'object' && (tmp = nocopy);
            }
            if(isArray(copy) || isString(copy) && (copy = [ copy ])){
                for(i = 0, l = copy.length; i < l; i++)(src[k = copy[i]] === undefined) || (dst[k] = src[k]);
            }else for(k in src)dst[k] = src[k];
            if(tmp){for(k in tmp)dst[k] = tmp[k];}
            return dst;
        },

        _extend = dl._extend = function(dst,src,depth){
            if(src === undefined)return dst;
            if(depth < 1 || !isObject(src) || isArray(src))return src;
            isObject(dst) || (dst = {});
            depth--;
            for(var k in src)dst[k] = _extend(dst[k],src[k],depth);
            return dst;
        },

        __unarray = function(items, depth){
            if(depth < 0 && !isObject(s))return s;
            var d = {};
            if(isArray(s)){for(var i = 0, l = s.length; i < l; i++)d[i] = unarray(s[i]);return d;}
            for(var k in s)d[k] = unarray(s[k]);
            return d;
        },
        unarray = gl.unarray = function(items, depth){
            return __unarray(items, intval(depth, 10));
        },

        _separator = /[\s;,]*/,

        /* prototype define */
        proto = function(_class,_property,_method){
            return _class.prototype[_property] || (_class.prototype[_property] = _method);
        };

    /* prototypes */

    proto(Array,'forEach',function(callback,context){
        if(!isFunction(callback))return;
        var z = this, _context = arguments.length > 1 ? context : z, l = z.length, i = 0;
        for(; i < l; i++)callback.call(_context, z[i], i, z);
    });

    proto(Array,'resetAll',function(s){
        var z = this, v, k, i = z.length - 1;
        if(isObject(s)){
            for(;i > -1; i--){
                if(!isObject(v = z[i]))v = z[i] = {};
                for(k in s)v[k] = s[k];
            }
            return z;
        }
        for(;i > -1; i--)z[i] = s;
        return z;
    });

    proto(Array,'count',function(items, depth, start, end){
        var
            _offset = start || 0,
            _end = intval(end, this.length), _count = 0;
        if(isArray(items)){
            for(var i, l = items.length; _offset < _end; _offset++){
                for(i = 0; i < l; i++){
                    if(isLike(items[i], this[_offset], depth)){
                        _count++;
                        break;
                    }
                }
            }
            return _count;
        }
        for(; _offset < _end; _offset++){
            if(isLike(items, this[_offset], depth))_count++;
        }
        return _count;
    });

    proto(Array,'is',function(items, depth, start, end){
        var  _offset = start || 0, _end = intval(end, this.length);
        if(isArray(items)){
            for(var i, l = items.length; _offset < _end; _offset++){
                for(i = 0; i < l; i++){
                    if(isLike(items[i], this[_offset], depth))return true;
                }
            }
            return false;
        }
        for(; _offset < _end; _offset++){
            if(isLike(items, this[_offset], depth))return true;
        }
        return false;
    });
    proto(Array,'isAll',function(items, depth, start, end){
        var  _offset = start || 0, _end = intval(end, this.length), _checked;
        if(isArray(items)){
            for(var i, l = items.length; _offset < _end; _offset++){
                _checked = false;
                for(i = 0; i < l; i++){
                    if(isLike(items[i], this[_offset], depth)){
                        _checked = true;
                        break;
                    }
                }
                if(!_checked)return false;
            }
            return true;
        }
        for(; _offset < _end; _offset++){
            if(!isLike(items, this[_offset], depth))return false;
        }
        return true;
    });

    proto(Array,'toggle',function(items, start, end){
        var
            _offset, _checked, _key, _map = {},
            _start = start || 0,
            _end = intval(end, this.length);
        if(isArray(items)){
            for(var i = 0, l = items.length; i < l; i++){
                _key = items[i];
                _checked = false;
                for(_offset = _start; _offset < _end; _offset++){
                    if(this[_offset][_key])continue;
                    _checked = true;
                    break;
                }
                for(_offset = _start; _offset < _end; _offset++)this[_offset][_key] = _checked;
                _map[_key] = _checked;
            }
            return _map;
        }
        _key = items;
        _checked = false;
        for(_offset = _start; _offset < _end; _offset++){
            if(this[_offset][_key])continue;
            _checked = true;
            break;
        }
        for(_offset = _start; _offset < _end; _offset++)this[_offset][_key] = _checked;
        _map[_key] = _checked;
        return _map;
    });



    proto(Array,'merge',function(dst, depth, include, exclude){
        var
            _dst = dst || {},
            _depth = intval(depth),
            _tmp, i, l = this.length - 1, k;
        for(; l > -1; l--){
            if((_tmp = this[l]) !== undefined)break;
        }
        if(_depth < 0 || !isObject(_tmp) || isArray(_tmp))return _tmp;
        l++;
        if(include){
            isArray(include) || (include = include.split(_separator));
            var ki, kl = include.length;
            for(i = 0; i < l; i++){
                if(!isObject(_tmp = this[i]) || isArray(_tmp))continue;
                for(ki = 0; ki < kl; ki++){
                    k = include[ki];
                    _dst[k] = _extend(_dst[k], _tmp[k], _depth);
                }
            }
            return _dst;
        }
        if(exclude){
            for(i = 0; i < l; i++){
                if(!isObject(_tmp = this[i]) || isArray(_tmp))continue;
                for(k in _tmp)exclude.indexOf(k) > -1 || (_dst[k] = _extend(_dst[k], _tmp[k], _depth));
            }
            return _dst;
        }
        for(i = 0; i < l; i++){
            if(!isObject(_tmp = this[i]) || isArray(_tmp))continue;
            for(k in _tmp)_dst[k] = _extend(_dst[k], _tmp[k], _depth);
        }
        return _dst;
    });

    proto(Array,'rewrite',function(src){
        var i = 0, l = this.length, k, dst;
        if(isObject(src)){
            for(;i < l; i++){
                if(isObject(dst = this[i])){
                    for(k in dst)delete dst[k];
                    for(k in src)dst[k] = src[k];
                }
            }
        }
        for(;i < l; i++){
            if(isObject(dst = this[i]))for(k in dst)delete dst[k];
        }
    });

    function By(items,keys){
        this.items = items;
        this.keys = isArray(keys) ? keys : keys.split(_separator);
    }
    proto(Array,'by',function(src){
        return new By(this,keys);
    });

    proto(By,'push',function(){
        var
            items = this.items,
            keys = this.keys,
            i, success = false,
            kl = keys.length, ki, item, dv,
            l = items.length, e,
            ai = 0, al = arguments.length, k, v;
        for(; ai < al; ai++){
            if(!isObject(v = arguments[ai])){
                dv = v;  v = {};
                for(ki = 0; ki < kl; ki++)v[ keys[ki] ] = dv;
            }
            e = 0;
            for(i = 0; i < l; i++){
                item = items[i]; e = 1;
                for(ki = 0; ki < kl; ki++){
                    if((dv = item[k = keys[ki]]) === undefined || dv != v[k]){e = 0; break;}
                }
                if(e){items[i] = v; break;}
            }
            e || (items.push(v), success = true, l++);
        }
        return success;
    });

    proto(By,'remove',function(){
        var
            items = this.items,
            keys = this.keys,
            i, success = false,
            kl = keys.length, ki, item, dv,
            l = items.length, e,
            ai = 0, al = arguments.length, k, v;
        for(; ai < al; ai++){
            if(!isObject(v = arguments[ai])){
                dv = v;  v = {};
                for(ki = 0; ki < kl; ki++)v[ keys[ki] ] = dv;
            }
            e = 0;
            for(i = l - 1; i > -1; i--){
                item = items[i]; e = 1;
                for(ki = 0; ki < kl; ki++){
                    if((dv = item[k = keys[ki]]) === undefined || dv != v[k]){e = 0; break;}
                }
                if(e){
                    items.splice(i,1);
                    success = true;
                }
            }
        }
        return success;
    });

    proto(By,'get',function(){
        var
            items = arrayCopy(this.items),
            keys = this.keys,
            i, kl = keys.length, ki, item, dv, e,
            dst = [], ai = 0, al = arguments.length, k, v;
        for(; ai < al; ai++){
            if(!isObject(v = arguments[ai])){
                dv = v;  v = {};
                for(ki = 0; ki < kl; ki++)v[ keys[ki] ] = dv;
            }
            e = 0;
            for(i = items.length - 1; i > -1; i--){
                item = items[i]; e = 1;
                for(ki = 0; ki < kl; ki++){
                    if((dv = item[k = keys[ki]]) === undefined || dv != v[k]){e = 0; break;}
                }
                e && dst.concat(items.splice(i,1));
            }
        }
        return dst;
    });

    proto(By,'sync',function(src, result, copy, nocopy){
        var
            items = this.items, i, item, k,
            keys = this.keys, kl = keys.length, ki,
            tmp;
        if(isArray(src)){
            var _items = arrayCopy(items), args = arrayCopy(src), ai, v, find;
            for(i = _items.length - 1; i > -1; i--){
                item = _items[i];
                find = 0;
                for(ai = args.length - 1; ai > -1; ai--){
                    v = args[ai];
                    for(ki = 0; ki < kl; ki++){
                        if((tmp = item[k = keys[ki]]) === undefined || tmp != v[k]){v = 0; break;}
                    }
                    if(v){
                        args.splice(ai,1);
                        find = v;
                        break;
                    }
                }
                find && (objectSync(item,find,nocopy,copy), _items.splice(i,1));
            }
            if(result){
                args.length && items.push.apply(items,args);
                return _items;
            }
            items.removeOf.apply(items,_items);
            args.length && items.push.apply(items,args);
            return _items;
        }
        for(i = items.length - 1; i > -1; i--){
            item = items[i];
            for(ki = 0; ki < kl; ki++){
                if((tmp = item[k = keys[ki]]) === undefined || tmp != src[k]){item = 0; break;}
            }
            if(item)return items[i] = objectSync(item,src,nocopy,copy);
        }
        items.push(src);
        return src;
    });


    proto(Array,'indexOf',function(v){for(var z = this, i = 0, l = z.length; i < l; i++){if(z[i] === v)return i;}return -1;});
    proto(Array,'removeOf',function(){
        var count = 0, j = 0, l = arguments.length, i, tmp;
        for(; j < l; j++){
            tmp = arguments[j];
            for(i = this.length - 1; i > -1; i--)tmp === this[i] && (this.splice(i,1), count++);
        }
        return count;
    });
    proto(Array,'setOf',function(){
        var count = this.length, j = 0, l, al = arguments.length, i, tmp, e;
        for(; j < al; j++){
            tmp = arguments[j];
            e = 1;
            for(i = 0, l = this.length; i > l; i++){
                if(tmp === this[i]){e = 0; break;}
            }
            e && this.push(tmp);
        }
        return this.length - count;
    });

    /*
     alt - значение по умолчанию
     min - минимальное допустимое значение
     */
    (function(){
        var modval = function(m){return function(alt,min){
            var z = this, l = z.length, i = 0, v, t, a = alt || 0;
            for(;i < l; i++){
                if((t = typeof (v = z[i])) == 'boolean')return v ? 1 : 0;
                if(t == 'number' && !isNaN(v)){a = v; break;}
                if(t == 'string' && !isNaN(v = m(v))){a = v; break;}
            }
            return (min !== undefined && a < min) ? min : a;
        }};
        proto(Array,'intval',modval(parseInt));
        proto(Array,'floatval',modval(parseFloat));
    })();


    /* arguments */
    proto(Array,'execute',function(){
        var i = 0, l = this.length;
        for(;i < l; i++)this[i].apply(null,arguments);
        return this;
    });
    proto(Array,'executer',function(){
        var self = this, args = arguments;
        return function(){
            for(var i = 0, l = self.length; i < l; i++)self[i].apply(null,args);
            return self;
        };
    });

    /* delay, count, first is not delay, arguments, context */
    proto(Array,'goer',function(delay,count,first,args,context){
        var items = this, promise, run = function(){
                cancel();
                promise = function(v){
                    if(ex && (_count === Infinity || i < _count)){
                        ex = run.debounce = 0;
                        return v === undefined ? 1 : v;
                    }
                };
                var delay = run.delay, ex = run.debounce = 1, i = run.i = 0,
                    execute = function(){
                        if(ex && (_count === Infinity || i < _count)){
                            run.i = ++i;
                            for(var l = items.length, j = 0; j < l; j++)items[j].apply(context,args);
                            setTimeout(execute, run.delay);
                        }else run.debounce = 0;
                    };
                first || delay < 1 ? execute() : setTimeout(execute, delay);
                return cancel;
            },
            cancel = run.cancel = function(v){return promise && promise(v);},
            _count = count === Infinity ? count : intval(count, 1);
        run.delay = intval(delay);
        return run;
    });
    proto(Array,'go',function(){
        return this.goer.apply(this, arguments)();
    });


    /*
     Возвращает функцию "Сделку", которая при запуске выполняет все переданные в её конструктор функции обратного вызова "Дилеры"
     "Сделка" принимает в качестве аргумента функцию обратного вызова, которая будет выполнена только тогда, когда сработают все "Дилеры" внутри "Сделки"
     "Сделка" может быть синхронной или асинхронной.
     В синхронной "Сделке" "Дилеры" срабатывают последовательно друг за другом - это удобно, если логика в "Дилерах" взаимозависима,
     упрощает конструкции в коде, отвечающем за последовательное выполнение нескольких функциий с аргументами обратного вызова.
     В асинхронной  "Сделке" "Дилеры" срабатывают параллельно - это удобно, например, если необходимо выполнить какой либо код, после
     того, как будет выполненно несколько параллельных запросов на удаленный сервер.
     Так мы ускорим загрузку и облегчим работу с асинхронной логикой приложения.
     */
    proto(Array,'deal',function(sync){
        var dealers = this, _watchers = [], execute = function(){
                loaded = 1;
                var w = ready.w, _w = _watchers;
                ready.w = [];
                _watchers = [];
                (w instanceof Array) ? w.push.apply(w,_w) : (typeof(w) === 'function' && w());
                w.execute();
            },
            i = 0, j = 0, l, executed, loaded,
            mover = function(){
                if((l = dealers.length) < 1)return execute();
                var
                    // последовательно / асинхронно
                    step = sync ? function(){i++; move();} : function(){ ++i < l || execute();},
                    move = sync ? function(){
                            (i < l ? dealers[i](step,sync) : execute());
                        } : function(){
                            for(;j < l; j++)dealers[j](step,sync);
                        };
                move();
            },
            ready = function(callback){
                var cancel = function(v){
                    callback = 0;
                    if(i < l)return arguments.length ? v : 1;
                };
                if(loaded){
                    callback();
                    return cancel;
                }
                _watchers.push(function(){ callback && callback(); });
                executed || mover();
                executed = 1;
                return cancel;
            };
        ready.w = [];
        return ready;
    });

    proto(String,'breakup',function(v,right){
        var i = this.indexOf(v);
        return i < 0 ? (right ? [ '',  this ] : [ this, '' ]) :
            [ this.substr(0,i), this.substr(i + v.length) ];
    });
    proto(String,'lastBreakup',function(v,right){
        var i = this.lastIndexOf(v);
        return i < 0 ? (right ? [ '',  this ] : [ this, '' ]) :
            [ this.substr(0,i), this.substr(i + v.length) ];
    });


    (function(){
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, reg = /[-[\]{}()*+?.,\\^$|#\s]/g;
//экранирование спец.символов в регулярном выражении
        dl.regesc = function(s){return isScalar(s) ? String(s).replace(reg,"\\$&") : '';};
        proto(String,'trim',function(){return this.replace(rtrim,'');});
        proto(String,'regesc',function(){return this.replace(reg,"\\$&");});
    })();


    var
        noop = dl.noop = function(){},
        _location,
        _doc = win ? (_location = win.location, win.document ): null,
        _hostname = _location ?  _location.hostname : '',
        uniqueID = 0,  expSpace = /\+/g,
        exp20 = /%20/g,
        exp22 = /%22/g,
        exp3A = /%3A/g,
        exp2C = /%2C/g,


        expBrackets = /\[(.*?)\]/g,
        expVarname = /(.+?)\[/,
        uid = gl.uid = function(){return ++uniqueID;},
        each = dl.each = function(object,callback){
            for(var k in object)callback(object[k],k,object);
            return object;
        },
        _param = dl.param = function(v,encode){
            var s = [], tmp, build = function(p,v){
                if(isArray(v)){for(var i = 0, l = v.length; i < l; i++)build(p+'[' + i + ']',v[i]);return s;}
                if(isObject(v)){for(var k in v)build(p + '[' + k + ']',v[k]);return s;}
                isScalar(v) && s.push(encodeURIComponent(p)+'='+encodeURIComponent(v));
                return s;
            };
            if(isObject(v)){
                if(isArray(v)){
                    var i = 0, l = v.length;
                    if(encode){
                        for(;i < l; i++)isEmptyObject(tmp = v[i]) || build(i,encode(tmp));
                    }else{
                        for(;i < l; i++)build(i,v[i]);
                    }

                }else{
                    var k;
                    if(encode){
                        for(k in v)isEmptyObject(tmp = v[k]) || build(k,encode(tmp));
                    }else{
                        for(k in v)build(k,v[k]);
                    }
                }
            }
            return s.join('&').replace(exp20, '+').replace(exp22, '"').replace(exp3A, ':').replace(exp2C, ',');
        },
        _fromJson = dl.fromJson = function(s){
            try{ return JSON.parse(s); }catch(e){}
            return null;
        },
        _toJson = dl.toJson = function(){
            return JSON.stringify.apply(JSON,arguments);
        },
        __unparam = dl._unparam = function(s,decode){
            var r = {}, a, l = (a = decodeURIComponent((a = s.breakup('?',1))[1]).split('&')).length;
            if(l < 1)return r;
            for(var w, t, k, v, b, c, d, j, n, q, i = 0; i < l; i++){
                if((w = a[i]).length < 1)continue;
                if((k = (w = w.breakup('='))[0]).length < 1)continue;
                v = w[1].replace(expSpace,' ');
                b = [];
                while(w = expBrackets.exec(k))b.push(w[1]);
                if((c = b.length) < 1){
                    r[k] = v;
                    continue;
                }
                c--;
                w = expVarname.exec(k);
                if(!w || !(k = w[1]) || w.length < 1)continue;
                if(!isObject(d = r[k]))d = r[k] = {};
                for(j = 0, q = b.length; j < q; j++){
                    if((w = b[j]).length < 1){
                        w = 0;
                        for(n in d){
                            if(!isNaN(n) && n >= 0 && (n%1 === 0) && n >= w)w = Number(n) + 1;
                        }
                    }
                    if(j == c)d[w] = v; else d = isObject(t = d[w]) ? t : (d[w] = {});
                }
            }
            if(decode)for(k in r)r[k] = decode(r[k]);
            return r;
        },
        _unparam = dl.unparam = function(s,decode){
            var type = typeof s;
            return type == 'string' ? __unparam(s, decode) : (type == 'object' ? s : {});
        },

// парсит url
        __URL = dl._URL = function(url){
            var
                parts = url.breakup('#'),
                hash = parts[1],
                unhash = parts[0],
                unsearch = (parts = unhash.breakup('?'))[0],
                search = parts[1],
                data = __unparam(search,_fromJson),
                child = hash ? __URL(hash) : {},
                protocol = (parts = unsearch.breakup('://',1))[0],
                pathname = protocol ? (parts = parts[1].breakup('/'))[1] : parts[1],
                hostname = protocol ? parts[0] : '',
                host = protocol ? (parts = hostname.breakup(':'))[0] : '',
                port = protocol ? parts[1] : '',
                unalias = (parts = unsearch.lastBreakup('/',1))[0],
                filename = parts[1],
                alias = (parts = filename.lastBreakup('.'))[0];
            return {
                href: url, search: search, unhash: unhash,
                hash: hash, data: data, protocol: protocol,
                pathname: pathname, hostname: hostname,
                host: host, port: port,
                unalias: unalias ? unalias + '/' : unalias,
                dirname: hostname ? unalias.breakup(hostname + '/', 1)[1] : unalias,
                filename: filename, alias: alias, unext: (unalias ? unalias + '/' : '')  + alias,
                ext: parts[1], unsearch: unsearch, child: child
            };
        },

// парсит url
        _URL = dl.URL = function(url){
            return __URL(url || (_location ? _location.href : ''));
        },

// парсит url и мерджит его параметры указанными аргументами
        _urlExtend = _URL.extend = function(dst,src){

            dst ? (isObject(dst) || (dst = __URL(dst))) : (dst = _URL());
            src ? (isObject(src) || (src = __URL(src))) : (src = {});


            var
                dirname = (src.dirname === undefined ? dst.dirname : src.dirname) || '',
                hostname = dst.hostname || src.hostname,
                protocol = (src.protocol === undefined ? dst.protocol : src.protocol) || dst.protocol || (hostname ? 'http' : ''),
                port = (src.protocol === undefined ? dst.port : src.port) || '',
                host = hostname ? (hostname + (port ? (':' + port) : '') ) : '',

                unalias = (host ? protocol + '://' + host + '/' : '') + dirname,
                alias = (src.alias === undefined ? dst.alias : src.alias) || '',
                ext = (src.ext === undefined ? dst.ext : src.ext) || '',
                filename = alias + (ext ? '.' + ext : ''),
                unext = (unalias ? unalias + '/' : '') + alias,
                unsearch = unext + (ext ? '.' + ext : ''),
                pathname = (dirname ? dirname + '/' : '') + filename,
                data = src.data === null ? {} : _extend(dst.data, src.data, 1),
                search = _param(data,_toJson),
                unhash = unsearch + (search ? '?' + search : ''),
                child = src.child ? _URL.extend(dst.child, src.child) : dst.child,
                hash = child && child.href || '',
                href = unhash + (hash ? '#' + hash : '');
            return {
                href: href,
                search: search, unhash: unhash,
                hash: hash, data: data,
                protocol: protocol, pathname: pathname,
                hostname: hostname, host: host, port: port,
                unalias: unalias ? unalias + '/' : unalias,
                dirname: dirname, filename: filename,
                alias: alias, unext: unext,  ext: ext,
                unsearch: unsearch, child: child
            };
        },


// Конвертирует объект в массив
        _toArray = dl.toArray = function(src,keys){
            var dst = [], l = keys.length, i = 0;
            for(;i < l; i++)dst.push(src[ keys[i] ]);
            return dst;
        },
// Конвертирует массив в объект
        _toObject = dl.toObject = function(src,keys){
            var dst = {}, l = keys.length > src.length ? src.length : keys.length, i = 0, v;
            for(;i < l; i++)(v = src[i]) && (dst[ keys[i] ] = v);
            return dst;
        },

        __request = dl._request = win ? (function(){
                var
                    UNSENT = 0, // начальное состояние
                    OPENED = 1, // вызван open
                    HEADERS_RECEIVED = 2, // получены заголовки
                    LOADING = 3, // загружается тело (получен очередной пакет данных)
                    DONE = 4; // запрос завершён
                return function(src){
                    var provider = new XMLHttpRequest(),
                        stop, progress = src.progress, callback = src.callback, post = src.post,
                        headers = _extend({'Content-type':'application/json; charset=utf-8'}, src.headers, 1),
                        delay = src.delay, execute = function(){
                            if(stop)return;
                            provider.open(src.method || 'GET', src.url, true);
                            if(callback){
                                var loaded = 0, execute = provider.onload = provider.onerror = function(){
                                    stop || loaded || (loaded = 1) && callback(provider.status == 200, provider.response);
                                };
                                provider.onreadystatechange = function(){
                                    (provider.readyState == DONE) && execute();
                                };
                            }
                            progress && (provider.onprogress = function(){stop || progress(arguments);});
                            for(var k in headers)provider.setRequestHeader(k, headers[k]);
                            provider.timeout = src.timeout || 20000;
                            provider.responseType = src.type || 'json';
                            post ? provider.send(isObject(post) ? _toJson(post) : post) : provider.send();
                        };
                    ('onload' in provider) || (provider = new XDomainRequest());
                    delay ? setTimeout(execute,delay) : execute();
                    return function(v){
                        if(stop)return;
                        stop = 1;
                        provider.onreadystatechange = provider.onprogress = provider.onload = provider.onerror = undefined;
                        provider.abort();
                        provider = undefined;
                        callback && callback(0);
                        return v;
                    };
                };

            })() : noop,

        _REQUEST_ARGS = ['url', 'callback', 'delay', 'data', 'post', 'progress'],
// По умолчанию ожидает ответ и отправляет запрос в json формате, не кэширует запросы:
        _request = dl.request = function(src){
            isObject(src) || (src = _toObject(arguments, _REQUEST_ARGS)); //argument is changed
            return __request(merge(src,{
                url: _URL.extend(src.url, {data: _extend(src.data, {timestamp:(new Date()).getTime()}, 1) }).href
            }));
        },

// Ожидает ответ в текстовом формате
        _txt = _request.txt = function(src){
            isObject(src) || (src = _toObject(arguments, _REQUEST_ARGS)); //argument is changed
            src.type = 'text';
            return __request(src);
        },


// Подключает допустимые ресуры: url, callback, delay, progress
        _load = dl.load = function(url, callback, delay, progress, init, data){
            var loc = _URL(url), func, ext = loc.ext;
            data && (url = _URL.extend(loc,{data:data}).href);  //argument is changed
            return (ext.length > 1 && (func = _load[ext])) ? func.apply(null,arguments) :
                ((_warn('Sorry, mr. Amirka doesn\'t know how to load the source "' + url + '", but tryed load this expression as JS'),_js.apply(null,arguments)));
        },
        _loadProvider = dl.loadProvider = _doc ? function(provider,init,callback,delay,progress){
                var stop, destroy, execute = function(){
                    if(stop)return;
                    if(callback){
                        var state, success = 1, loaded = 0,
                            execute = provider.onload = function(){
                                stop || loaded || (loaded = 1) && callback(success); // callback(success,options);
                            };
                        provider.onerror = function(){success = 0; execute();};
                        provider.onreadystatechange = function(){
                            ((state = s.readyState) == "complete" || state == "loaded") && execute();
                        };
                    }
                    progress && (provider.onprogress = function(){stop || progress(arguments);});
                    init && (destroy = init(provider));
                };
                delay ? setTimeout(execute,delay) : execute();
                return function(){
                    stop || (stop = 1, destroy && destroy());
                };
            } : noop,

        _append = dl.append = _doc ? function(parent,node){
                parent.appendChild(node);
                return function(){ parent.removeChild(node); };
            } : noop,
        _before = dl.before = _doc ? function(node,referenceNode){
                var parent = referenceNode.parentNode;
                parent.insertBefore(node, referenceNode);
                return function(){ parent.removeChild(node); };
            } : noop,
        _after = dl.after = _doc ? function(node,referenceNode){
                var parent = referenceNode.parentNode;
                parent.insertBefore(node, referenceNode.nextSibling);
                return function(){ parent.removeChild(node); };
            } : noop,
        _styleSheet = dl.styleSheet = _doc ? function(provider,text){
                provider.styleSheet ? (provider.styleSheet.cssText = text) : provider.appendChild(_doc.createTextNode(text));
            } : noop,


        _css = noop, _scss = noop, _less = noop, _img = noop,

// Подключает JS: url, callback, progress
        _js = _load.js = _doc ? (function(_doc){
                var head = _doc.head;

                // Подключает CSS: url, callback, delay, progress
                _css = _load.css = function(url, callback, delay, progress, init){
                    return _loadProvider(
                        _doc.createElement('link'),
                        function(provider){
                            provider.type = 'text/css';
                            provider.rel = 'stylesheet';
                            provider.href = url;
                            return init ? init(provider) : _append(head,provider);
                        },
                        callback, delay || 1, progress
                    );
                };
                _img = function(url, callback, delay, progress, init){
                    return _loadProvider(
                        _doc.createElement('img'),
                        function(provider){
                            provider.src = url;
                            return init ? init(provider) : _append(head,provider);
                        },
                        callback, delay, progress
                    );
                };
                ['img', 'png', 'jpg', 'svg', 'jpeg', 'gif'].forEach(function(name){ _load[name] = _img; });


                [
                    // Подключает less:
                    {name:'less', exts:[ 'less' ], callback: function(text,callback){
                        win.less.render(text, function(e,s){
                            callback(s.css);
                        });
                    }},
                    // Подключает scss:
                    {name:'sass', exts:[ 'scss', 'sass' ], callback: function(text,callback){
                        win.sass.compile(text, function(result){
                            callback(result.text);
                        });
                    }}
                ].forEach(function(preprocessor){
                    var _name = preprocessor.name, _callback = preprocessor.callback,
                        hanlder = function(url, callback, delay, progress, init){
                            if(!_definitions[_name]){
                                _error('Sorry, module "' + _name + '" is not defined!');
                                return noop;
                            }
                            var text = '', destroy, stop, _success = 0, _cancel = _require(_name, function(callback){
                                _request({
                                    url: url, delay: delay, type: 'text', progress: progress,
                                    callback: function(success, response){
                                        success ? (_success = success, text = response, callback()) : _error('Sorry, file "' + url + '" fail loaded!');
                                    }
                                });
                            })(function(){
                                stop || _callback(text, function(_text){
                                    if(stop)return;
                                    var provider = _doc.createElement('style');
                                    provider.rel = 'stylesheet/less';
                                    provider.id = url;
                                    _text || _error('Sorry, file "' + url + '" failed compile!');
                                    _styleSheet(provider, _text);
                                    destroy = init ? init(provider) : _append(head, provider);
                                    callback && callback(_success);
                                });


                            });
                            return function(){stop || (stop = 1, _cancel(), destroy && destroy());}
                        };
                    preprocessor.exts.forEach(function(ext){
                        _load[ext] = hanlder;
                    });
                });

                // Загружает скрипт
                return function(url, callback, delay, progress, init){
                    return _loadProvider(
                        _doc.createElement('script'),
                        function(provider){
                            provider.type = 'text/javascript';
                            provider.charset = 'utf-8';
                            provider.async = true;
                            provider.src = url;
                            return init ? init(provider) : _append(head,provider);
                        },
                        callback, delay, progress
                    );
                };
            })(_doc) : noop,


        _definitions = dl.definitions = {},
        _timer = dl.timer = function(time){
            return function(callback){
                setTimeout(callback,time);
            };
        },
        _loader = dl.loader = function(url,delay,params,post,progress){
            return function(callback){
                _log(url + ' loading');
                _load(url,function(success){
                    _log(url + (success ? ' success' : ' fail') + ' loaded');
                    success && callback();
                },delay,params,post,progress);
            };
        },
//кэширует результат работы дилера
        _definer = dl.definer = function(name,dealer){
            var definition = _definitions[name] || (_definitions[name] = { name: name, dealer: dealer, w: []});
            return function(callback){
                if(definition.loaded)return callback(1);
                definition.w.push(callback);
                if(definition.exucute)return;
                definition.exucute = 1;
                definition.dealer(function(){
                    definition.loaded = 1;
                    definition.w.execute(1);
                    delete definition.w;
                });
            };
        },
// Кэшируемое подключение модулей
        _require = dl.require = function(){
            var root = [], dealers = [], i = 0, l = arguments.length, t, a, d, k;
            root.push(dealers.deal());
            for(; i < l; i++){
                if((a = arguments[i]) instanceof Array){
                    dealers.push(_require.apply(null,a));
                    continue;
                }
                if((t = typeof a) == 'boolean'){
                    root.push((dealers = []).deal(a));
                    continue;
                }
                if(t  == 'object'){
                    for(k in a)dealers.push(_definer(k,_require(a[k])));
                    continue;
                }
                if(!isNaN(d = parseInt(a)) && isFinite(d)){
                    d > 0 && dealers.push(_timer(d));
                    continue;
                }
                if(t  == 'string'){
                    a && dealers.push(_definer(a,_loader(a)));
                    continue;
                }
                if(t  == 'function'){
                    dealers.push(a);
                    continue;
                }
            }
            return root.deal(true);
        },

        /* url, data, callback // Кроссдоменный запрос */
        _cross = dl.cross = win ? (function(){
                /* callback, prefix, scope */
                var g = dl.gname = function(c,p,s){
                    if(isObject(c)){s = c.scope; p = c.prefix; c = c.callback;}
                    s = s||g.scope; p = p||g.prefix;
                    var n;
                    s[n = p + (++uniqueID)] = function(r){c&&c(r); delete s[n];};
                    return n;
                };
                g.prefix = 'DL_CALLBACK_';
                g.scope = win || {};
                return function(src){
                    isObject(src) || (src = _toObject(arguments, ['url', 'data', 'callback', 'delay', 'progress']));
                    var callback = src.callback, success = 1, execute = function(response){
                            //console.log(success,response);
                            destroy && (destroy(), destroy = 0);
                            callback && callback(success, response);
                        },
                        destroy = _loadDefinitions.js(merge(src,{
                            callback: function(_success){(success = _success) || execute({});},
                            data: merge(src.data, {
                                hostname: _hostname,
                                timestamp: (new Date()).getTime(),
                                callback: g(execute)
                            })
                        }), _URL(src.url));
                };
            })() : noop,
        _toLocation = dl.toLocation = _location ? function(url,search,hashurl,hashsearch){
                url || (url = win.location.href);
                win.location = dl.URL(url,search,hashurl,hashsearch).href;
            } : noop,
        _log = dl.log = function(){console.log.apply(console,arguments);},
        _warn = dl.warn = function(){console.warn.apply(console,arguments);},
        _error = dl.error = function(){console.error.apply(console,arguments);};


    var Cross = dl.Cross = function(options){
        var dst = {};
        var z = [ options ].merge({
            src: {},
            dst: dst,
            delay: 0,
            loading: 0,
            code: 0
        });
        var callback = function(_success,response){
            console.log('success',_success, 'response', response);
            var _response = objectval(response), success = _success ? _response.success : 0, data = objectval(response.data);
            z.code = success ? 1 : 2;
            z.dst = dl.rewrite(dst,data);
            z.loading = 0;
            watchval(z.w).execute(success,data);
        };
        var cancel, gen = function(src,delay){
            z.loading = 1;
            var stop = 0;
            [function(){
                if(stop)return;
                dl.cross(z.url, [ src ].merge(z.src, 2) ,function(success,response){
                    if(stop)return;
                    callback(success,response);
                });
            }].go([delay, z.delay].intval());
            return function(){stop = 1};
        };
        z.run = function(){
            cancel && cancel();
            cancel = gen.apply(z,arguments);
        };
        z.cancel = function(data,delay){
            cancel && cancel();
            z.loading = 0;
        };
        return z;
    };

    _doc && _require({
        document: [function(callback){
            var state = _doc.readyState;
            state === "complete" || state === "interactive" ?
                callback() : _doc.addEventListener("DOMContentLoaded", callback);
        }]
    })();



})(window);