<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
    <head>
        <base href="{{ config('app.url') }}"/>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laravel</title>
        <!-- Fonts -->
        <link href="./css/app.css" rel="stylesheet" type="text/css">
        <script type="text/javascript">
            (function(d,js,g){
                var h = d.head, c = function(u){
                    var r,s=d.createElement('script'), z=0, m=function(){ h.removeChild(s);!(--j)&&g&&g();},
                        f=s.onload=function(){z||(z=1)&&m();}; s.onreadystatechange=function(){if((r=this.readyState)=="complete"||r=="loaded")f();};
                    s.type='text/javascript';s.charset='utf-8';s.async=true;s.src=u;h.appendChild(s);}, j;
                js&&((js instanceof Array) ? ((j = js.length),(function(){for(var i = j - 1; i > -1 ; i--)c(js.pop());})()) : c(js));
            })(document,[
                // Асинхронная загрузка JS, затем инициализация всех библиотек
                'js/app.js'
            ],function(){

                console.log('JS loaded!');

                dl.require('document')(function(){
                    console.log('document loaded!');
                    window.APP_INIT && window.APP_INIT();
                    window.angular && angular.bootstrap(document, ['app']);
                });

            });
        </script>
    </head>
    <body>
        <div class="inner">
            @yield('inner')
        </div>
    </body>
</html>
