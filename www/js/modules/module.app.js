/**
 * App模块 mApp
 *
 * 依赖: mFile
 * 
 * 提供 $App 服务
 * 		andorid回退按钮
 * 		handleABB(['okr','workCreate'])
 * 		检查更新
 *
 * 
 * 适用范围
 * 
 * 
 */
;(function(angular, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['angular'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('angular'));
    } else {
        factory(angular);
    }
}(angular, function(angular) {
	'use strict';
	
	const module = angular.module('mApp', [/*'mFile'*/])
	
	.config([()=>{
	}])
	.run([()=>{
		console.log(`${module.name} run.`)
	}])
	/**
	 * 接口服务
	 */
	.factory('sApp', [()=>{
		return {
		}
	}])
	/**
	 * 开放接口
	 */
	.factory('$App', ['$state', '$ionicPlatform', '$cordovaToast', '$timeout', '$ionicViewService', ($state, $ionicPlatform, $cordovaToast, $timeout, $ionicViewService)=>{
		return {
			//Handle Android Back Botton
			handleABB(options){
				let _count = 0;
				let timer = 0;
				const isSurface = (hashs) => {
					let {name: curr} = $state.current;
					
					for(let hash of hashs){
						if( hash===curr ) return !0
					}
					return !1;
				}
				$ionicPlatform.registerBackButtonAction(()=>{
					
					if( isSurface(options) ){
						_count++;
						if(_count===1){
							$cordovaToast.showShortBottom('再按一次退出')
						}else if(_count>=2){
							$timeout.cancel(timer)
							//退出应用
							navigator.app.exitApp();
						}
		
						timer = $timeout( ()=> {
							_count = 0;
						}, 5000)
					}else{
						const backView = $ionicViewService.getBackView()
						backView && backView.go();
						//if()
						//$window.history.go(-1)
					}
				}, 100/*priority优先级*/)
			}
		}
	}])
	//.directive('directive',[()=>{}])
	//.filter('filter',[()=>{}])
	//.controller('controller',[()=>{}]);
	
	return module;
}));