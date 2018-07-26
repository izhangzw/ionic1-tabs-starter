/**
 * App模块 mApp
 *
 * 依赖: mFile
 * 
 * 提供 $App 服务
 * 		andorid回退按钮
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
	.factory('$App', [()=>{
		return {
		}
	}])
	//.directive('directive',[()=>{}])
	//.filter('filter',[()=>{}])
	//.controller('controller',[()=>{}]);
	
	return module;
}));