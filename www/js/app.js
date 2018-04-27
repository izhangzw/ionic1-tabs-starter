'use strict';

const app = angular.module('app', ['ionic', 'angular-loading-bar', 'app.controllers', 'ngCordova.plugins.toast', 'ngCordova.plugins.statusbar', 'mApp']);

app
.constant('APP', {
	//host: 'http://goalokr.hnaholding.com/scoreokr-web',//海南生产环境
	//host: 'http://116.204.25.82/scoreokr-web',//海南测试环境
	host: 'http://appdev.mochasoft.com.cn:8000/scoreokr-web',//天津测试环境
	//host: '/scoreokr-web',
	version: '0.0.1'
})
.run(['$ionicPlatform', '$state', '$timeout', '$ionicViewService', '$rootScope', '$cordovaToast', '$cordovaStatusbar', '$App', function($ionicPlatform, $state, $timeout, $ionicViewService, $rootScope, $cordovaToast, $cordovaStatusbar, $App) {
//	$rootScope.$on("$ionicView.beforeEnter", isWelcome($state));
	const {version, isAndroid, isIOS} = ionic.Platform;
	//Fix iphonex
	if(/iphone/gi.test(navigator.userAgent) && (screen.height == 812 && screen.width == 375)){
		$('body').addClass('IPHONEX')
	}
	//监听
	$rootScope.$on('unauth', (e) => {
		$state.go('login')
	});

	
	const handleStatusBar = () => {
		if(window.StatusBar) {
			StatusBar.styleDefault();
			if (isIOS()) {
				$cordovaStatusbar.overlaysWebView(true);
			}
		}
	}
	
	const deviceReady = () => {
		//监听android回退事件
		if(isAndroid()) $App.handleABB(['app', 'app.notify', 'app.user', 'login'])
		//检查更新
		//$rootScope.$broadcast('version')
	}
	const devicePause = () => {
		//应用被暂停时触发
	}
	const deviceResume = () => {
		//再次被调起时触发
	}
	$ionicPlatform.ready(function() {
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		//sb
		handleStatusBar();
		//监听设备
		document.addEventListener('deviceready', deviceReady, false);
		document.addEventListener('pause', devicePause, false);//监听退到后台
		document.addEventListener('resume', deviceResume, false);//监听再次调起
	});
}])

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
	$ionicConfigProvider.platform.android.tabs.position('bottom');
	//全局禁用缓存
	$ionicConfigProvider.views.maxCache(0);
	//禁止右滑返回上一页
    $ionicConfigProvider.views.swipeBackEnabled(false);
    //关闭所有切页动画
    //$ionicConfigProvider.views.transition('none')
	//注入拦截器
	//+token
	$httpProvider.interceptors.push('token');
	//路由
    $stateProvider
    .state('app', {
	    url: '/app',
	    abstract: true,
	    templateUrl: 'templates/tabs.html'
	  })
    .state('app.notify', {
	    url: '/notify',
	    views: {
	      'app-notify': {
	        templateUrl: 'templates/notify.html',
	        controller: 'NotifyCtrl'
	      }
	    }
	  })
    .state('app.user', {
	    url: '/user',
	    views: {
	      'app-user': {
	        templateUrl: 'templates/user.html',
	        controller: 'UserCtrl'
	      }
	    }
	})
    .state('login', {
	    url: '/app/login',
	    templateUrl: 'templates/login.html',
	    controller : 'LoginCtrl'
	});

	$urlRouterProvider.otherwise('/app/notify');
}]);
