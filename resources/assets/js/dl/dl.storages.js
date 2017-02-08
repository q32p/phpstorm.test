/**
 * Created by Amirka on 07.02.2017.
 */
(function(gl){
    var
        dl = gl.dl || {},
        noop = dl.noop || function(){},

        encode = dl.toJson || noop,
        decode = dl.fromJson || noop,

        _warn = dl.warn || noop,

        _clone = dl.clone,
        _copy = _clone ? function(value){
                return _clone(value, 10); // Глубина копирования объектов
            } : noop,
        _srorageSet = dl.srorageSet = function(haystack,key,value){
            if(!isObject(value))return haystack[key] = value;
            var dst = haystack[key];
            if(dst === value)return dst;
            if(isArray(value)){
                if(!isArray(dst))dst = haystack[key] = [];
                dst.length = 0;
                dst.push.apply(dst,value);
            }else{
                if(!isObject(dst))dst = haystack[key] = {};
                var k, _remove = {};
                for(k in dst)_remove[k] = true;
                for(k in value){
                    _srorageSet(dst,k,value[k]);
                    _remove[k] && delete _remove[k];
                }
                for(k in _remove)delete dst[k];
            }
            return dst;
        },
        _storageGen = dl.storageGen = function(options){
            var
                _self = {}, _data = {}, _keys = [], _last = {},
                _options = _self.options = objectval(options),
                _save = _self.save = function(){
                    var f = options.setter;
                    if(isFunction(f))f(_data);
                },
                _load = _self.load = function(){

                    var f = options.getter, k;
                    _keys = [];
                    _data = isFunction(f) ? objectval(f()) : {};
                    //_first && (_tmp = _clone(_data), _first = 0);
                    for(k in _data)_keys.push(k);
                    return _self;
                },
                _setItem = _self.setItem = function(k,v){
                    if(v === null || v === undefined){
                        _data[k] === undefined || delete _data[k];
                        _keys.removeOf(k);
                    }else{
                        _data[k] = v;
                        _keys.setOf(k);
                    }
                    return _self;
                },
                _getItem = _self.getItem = function(k){return _data[k];},
                _removeItem = _self.removeItem = function(k){
                    _data[k] === undefined || delete _data[k];
                    _keys.removeOf(k);
                    return _self;
                },
                _clear = _self.clear = function(){_keys = []; _data = {};},
                _key = _self.key = function(i){return _keys[i];};

            _self.getKeys = function(){return _keys;};
            _self.getData = function(){return _data;};
            _self.getChanged = function(){
                var _changed = {}, k, v;
                for(k in _data)_changed[k] = _data[k];
                for(k in _last)(v = _data[k]) === _last[k] ? delete _changed[k] : (_changed[k] = v);
                return _changed;
            };
            _self.update = function(){
                _last = _clone(_data);
            };
            _self.__defineSetter__('length', function(l){
                l = intval(l,_keys.length,0);
                while(_keys.length > l)delete _data[_keys.pop()];
                return _keys.length;
            });
            _self.__defineGetter__('length', function(){return _keys.length;});

            _load();
            _last = _clone(_data);

            return _self;
        },


        _getStorage = function(storage){
            if(!storage)return storage;
            var k = '__' + Math.round(Math.random() * 1e7);
            try{storage.setItem(k,k); storage.removeItem(k);}
            catch(e){ return 0; }
            return storage;
        },
        _storageWrapper = dl.storageWrapper = function(storageName,prefix,defaultData){
            prefix === undefined && (prefix = 'dl.');

            var prefixLength = prefix.length,
                storage = _getStorage( gl[storageName] ) || (
                        _warn('This browser does not support "' + storageName + '"!', gl[storageName]),
                            {setItem: noop, getItem: noop, removeItem: noop, key:noop, length:0}
                    ),
                _setPrefix = function(_prefix){
                    if(!isString(_prefix)){
                        throw new TypeError('storage "' + storageName + '" - $setPrefix() expects a String.');
                        return;
                    }
                    prefixLength = (prefix = _prefix).length;
                },
                _set = function(key,value){return storage.setItem(prefix + key, isEmpty(value) ? null : encode(value));},
                _get = function(key){return decode( storage.getItem(prefix + key) );},
                _init = function(data){
                    var v, k;
                    for(k in data)((v = $storage[k]) === undefined || v === null) && ($storage[k] = data[k]);
                    return $storage;
                },
                _reset = function(data) {
                    for (var k in $storage)'$' === k[0] || (delete $storage[k], storage.removeItem(prefix + k));
                    return isObject(data) ? _init(data) : $storage;
                },
                _object = function(key, defaultObject){
                    var v;
                    return isObject(v = $storage[key]) ? v : ($storage[key] = defaultObject ? _copy(defaultObject) : {});
                },
                _sync = function(){
                    for (var i = 0, l = storage.length, k; i < l; i++){
                        (k = storage.key(i)) && prefix === k.slice(0, prefixLength) && _srorageSet($storage, k.slice(prefixLength), decode(storage.getItem(k)) );
                    }
                    return $storage;
                },
                _apply = function(){
                    var tmp = {}, k, v, save = storage.save;

                    if(isEqual($storage, $last))return $storage;
                    for(k in $last)tmp[k] = true;
                    for(k in $storage)'$' === k[0] || ( _set(k, $storage[k]), delete tmp[k] );
                    for(k in tmp)storage.removeItem(prefix + k);

                    $last = _copy($storage);
                    isFunction(save) && (storage.options.prefix = prefix, save.apply(storage));
                    return $storage;
                },
                _bind = function(key,watchers){
                    var w = watchval(watchers), _w;
                    w.length && (_w = callbacks[key] = watchval(callbacks[key])).push.apply(_w, w);
                    return function(){ return _w.removeOf.apply(_w,w); };
                },
                _unbind = function(key,watchers){
                    var w = watchval(watchers), _w;
                    w.length && (_w = callbacks[key] = watchval(callbacks[key])).removeOf.apply(_w, w);
                },
                _render = function(data){
                    var k, v, z, i, l, key;
                    for(key in data){
                        if( prefix === key.slice(0, prefixLength)){
                            k = key.slice(prefixLength);
                            (v = decode(data[key])) ? _srorageSet($storage, k, v) : delete $storage[k];
                            if(isArray(z = callbacks[k]))for(i = 0, l = z.length; i < l; i++)z[i](k,v);
                        }
                    }
                    $last = _copy($storage);
                    return $storage;
                },
                callbacks = {}, $last, $storage = {
                    $setItem: _set, $getItem: _get,
                    $setPrefix: _setPrefix,
                    $default: _init,
                    $reset: _reset,
                    $object: _object,
                    $sync: _sync,
                    $apply: _apply,
                    $bind: _bind, $unbind: _unbind,
                    $render: _render
                };
            defaultData && _init(defaultData);
            _sync();
            $last = _copy($storage);
            return $storage;
        };



// angular module
    var angular = gl.angular, module = angular.module('dl', []);
    ['paramStorage', 'stateStorage', 'localStorage', 'sessionStorage',
        'cookieStorage', 'remoteStorage'].forEach(function(name){
        module.provider('$' + name, function(){
            var _prefix, _dData;
            this.setOptions = function(prefix,data){
                _prefix = prefix, _dData = data;
            };
            this.$get = ['$rootScope', '$location', function($rootScope, $location){
                var $storage;
                if(name === 'paramStorage' && !isObject(gl[name]) ){
                    var storage = gl[name] = _storageGen({
                            getter: function(){return $location.search();},
                            setter: function(data){$location.search(data); /*.replace(); */}
                        }),
                        render = [function(){
                            $storage.$render(storage.load().getChanged());
                            storage.update();
                            $rootScope.$digest();
                        }].goer(100);
                    $rootScope.$on('$locationChangeSuccess',function(e,newUrl,oldUrl){
                        render();
                    });
                }
                if(name === 'cookieStorage' && !isObject(gl[name]))(function(){
                    var
                        encode = function(v){return encodeURIComponent(v);},
                        decode = function(v){return decodeURIComponent(v);},
                        setter = function(data){

                            var _options = objectval(storage.options), date = new Date(), k, v,
                                _prefix = _options.prefix || '', prefixLength = _prefix.length,
                                _path = _options.path ? '; path=' + _options.path : '',
                                _domain = _options.domain  ? '; domain=' + _options.domain : '',
                                _secure = _options.secure  ? '; secure' : '',
                                _config = _path + _domain + _secure,
                                _cookie;

                            console.log('setter', data);

                            date.setMilliseconds(date.getMilliseconds() + intval(_options.expires) * 1000);
                            _config = '; expires=' + date.toUTCString() + _config;

                            for(k in data){
                                _prefix === k.slice(0,prefixLength) && (
                                    _cookie = encode(k) + '=' + encode((v = data[k]) === null || v === undefined ? '' : v) + _config,
                                        console.log('_cookie',_cookie),
                                        document.cookie = _cookie
                                );
                            }
                        },
                        getter = function(){
                            var _cookie = document.cookie, w = _cookie ? _cookie.split('; ') : [],
                                i = 0, l = w.length, parts, data = {};
                            for(; i < l; i++){
                                parts = w[i].split('=');
                                data[ decode(parts[0]) ] = decode(parts[1]);
                            }
                            return data;
                        },
                        storage = gl[name] = _storageGen({
                            getter: getter,
                            setter: setter,
                            expires: 400 * 86400,
                            prefix: ''
                        });
                })();

                if(name === 'sessionStorage' &&  !isObject(gl[name]) ){
                    gl.addEventListener && gl.addEventListener('storage', function(event){
                        var d = document, k = event.key, v = event.newValue;
                        (!k || !isString(v) || v[0] === '_') ||
                        (!d.hasFocus || !d.hasFocus()) && ($storage.$render({k:v}), $rootScope.$digest());
                    });
                }
                $storage = _storageWrapper(name,_prefix,_dData);


                var subApply = [function(){
                        $storage.$apply();
                        $rootScope.$digest();
                    }].goer(1000),
                    apply = [function(){
                        $storage.$apply();
                        $rootScope.$digest();
                        subApply();
                    }].goer(200);

                $rootScope.$watch(function(){
                    apply.debounce || apply();
                });

                return $storage;
            }];
        });
    });


})(window);