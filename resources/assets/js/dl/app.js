function APP_INIT(){

/*
    Декларация модулей
    При вызове модуля, проверяется был ли он инициализирован,
    если нет, то он инициализируется только единожды при первом вызове.
    Если модуль готов, то выполняются функции, которые ожидали его инициализации.
*/
dl.require({
    vk: [ 
        true, // выполнять последовательно
        '//vk.com/js/api/openapi.js?117', // подключить скрипт
        function(callback){ window.VK.init({ apiId:4978848, onlyWidgets: true}); callback(); },  // выполнить функцию
        10, // подождать
        'assets/examples/less1/js/jquery.vk.js' // подключть скрипт
    ],
    yandexMaps:[ 
        true, 'http://api-maps.yandex.ru/2.1/?load=package.full&lang=ru-RU', 10, 
        function(callback){ window.ymaps.ready(callback); } 
    ],
	owlCarousel:[
    	'assets/examples/less1/js/owl.carousel.js',
    	'assets/examples/less1/css/owl.carousel.css',
    	true, 10 
	],
	swipebox:[  
	    'assets/examples/less1/js/dl.swipebox.js', 
	    'assets/examples/less1/css/dl.swipebox.css', 
	    true, 10 
    ],
	maskedinput:[ true, 'assets/examples/less1/js/jquery.maskedinput.js', 10],
	ui:[
	    'assets/examples/less1/jquery.ui/jquery-ui.min.js', 
	    'assets/examples/less1/jquery.ui/jquery-ui.min.css',  
	    true,  10
    ]
});

dl.setServices([],['$rootScope','$templateCache','$compile','$parse','$filter']);


var app = angular.module('app',['ngTouch','dl','dlScope','dlServices']);

app.config(['$locationProvider','$paramStorageProvider',function($locationProvider,$paramStorageProvider){
    $locationProvider.html5Mode(true);
    $paramStorageProvider.setOptions('');
}]);


app.run(['$rootScope','$location','$filter','$localStorage','$paramStorage',
function($rootScope, $location, $filter, $localStorage, $paramStorage){
    
    
    
}]);





}