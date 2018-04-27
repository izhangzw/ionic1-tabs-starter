'use strict';
/**
 * 包含公用的service factory directive...
 */
angular.module('app.commons', [])
//TODO rest
.factory('$restfuller', ['$rootScope', '$http', '$q', '$log', '$state', 'APP', '$toast', 'Loginer', function($rootScope, $http, $q, $log, $state, APP, $toast, Loginer) {
	//Polyfill
	Promise.prototype.done = function (onFulfilled, onRejected) {
	  this.then(onFulfilled, onRejected)
	    .catch(function (reason) {
	      // 抛出一个全局错误
	      setTimeout(() => { throw reason }, 0);
	    });
	};
	Promise.prototype.finally = function (callback) {
	  let P = this.constructor;
	  return this.then(
	    value  => P.resolve(callback()).then(() => value),
	    reason => P.resolve(callback()).then(() => { throw reason })
	  );
	};
	
	const paddingURL = function(url){
		if( url.startsWith('/') ){
  			url = `${APP.host}${url}`;
  		}
		return url;
	}
	//执行ajax
	const processing = function(url, config){
		
		let datas = Object.assign({}, { url: paddingURL(url) }, config);
		const gMsg = (errorMsg) => {
			let msg = '请检查网络是否畅通';
			if(errorMsg){
				if(errorMsg.length>100){
					msg = '服务器走神了';
				}else{
					msg = errorMsg;
				}
			}
			return msg;
		}
		const promise = new Promise( (resolve, reject) => {
			$http(datas)
			.success(ret => {
				let {status, data, errorMsg, errorCode} = ret;
				status = status.toUpperCase();
		
				if( 'SUCCESS'===status ){
					resolve(data);
				}else{
					if(errorCode==='err00001'){
						if(Loginer.get()) $toast.alert(gMsg(errorMsg))
						$rootScope.$broadcast('unauth');
					}else{
						$toast.alert(gMsg(errorMsg))
					}
					reject(errorMsg)
				}
			})
			.error( (e, status, c) => {
				reject(status)
			});
		});
		promise.success = function(callback){
  			promise.then( data => {
	  			callback && callback(data)
	  		});
	  		return promise;
  		};
  		promise.error = function(callback){
  			promise.then( null, e=> {
  				callback && callback(e)
  			})
  			return promise;
  		};
		return promise;
	}
  	return {
		get(url, config){
			return processing(url, Object.assign({}, {method: 'get'}, config));
	  	},
	  	post(url, data, config){
	  		return processing(url, Object.assign({}, {method: 'post', data}, config));
	  	}
  }
}])
// ajax append token
// Hearder.Authorization = token
.factory('token', ['$q', '$rootScope', 'Loginer', '$toast', function ($q, $rootScope, Loginer, $toast) {
	return {
		request(config){
			const {url} = config;
			if(!url.includes('.html')){
				const {token} = Loginer.get();
				if (token) {
					config.headers['Authorization'] = token;
					//config.url = url.includes('?') ? `${url}&Authorization=${token}` : `${url}?Authorization=${token}`;
				}
			}
			return config;
		},
		responseError(response){
			/*if( errorCode==='err00001' ){
						$state.go('login');
					}else{
					}*/
			const {status} = response;
			console.log(response, status)
			switch(status){
				//case 504: $toast.alert('服务器掉海里了...');break;
				//case 405: $rootScope.$broadcast('unauth'); break;
				case 401: $rootScope.$broadcast('unauth'); break;
				default: $toast.alert(`服务器掉海里了(${status})...`);break;
			}
			return $q.reject(response);
		}
	};
}])

//吐司提示
.service('$toast', ['$timeout', function($timeout){
	var hash = {
		alert: 'ion-android-alert',
		succ: 'ion-checkmark-circled'
	}
	var html = function(m, t){
		return '<div class="prompt '+t+'"><i class="'+hash[t]+'"></i><span>'+m+'</span></div>'
	}
	var _show = function(m, t){
		$('.prompt').remove();
		$('body').prepend(html(m, t));
		$('.prompt').fadeOut(0).fadeIn(200, function(){
			$('.prompt').addClass('on')
		});
		$timeout(function(){
			$('.prompt').removeClass('on').hide(500)
		}, 2000)
	}
	return {
		alert: function(m){
			_show(m, 'alert')
		},
		succ: function(m){
			_show(m, 'succ')
		}
	}
}])
/**
 * 头像指令，包含默认头像
 */
.directive('face', ['$sce', 'Loginer', 'APP', function($sce, Loginer, APP){
  return {
    restrict : 'E',
    template:  `<div class="photo" ng-if="face"><img style="height:100%" ng-src="{{face}}" err-src="img/avater1.png"/><//></div>
				<div class="photo default" ng-if="!face">{{name.substring(0,1)}}</div></a>`,
    link: function(scope, element, attrs){
    	//img/avater2.png
  
		attrs.$observe('ngFace', function (value) {
			scope.face = value ? $sce.trustAsResourceUrl(`${APP.host}/fileresource/image/${value}.jpeg`) : '';
		});
		attrs.$observe('ngName', function (value) {
			scope.name = value;
		});
    }
  }
}])
// 请求下载图片失败时设置显示默认图片
.directive('errSrc', function() {
	return {
		link: function(scope, element, attrs) {
			element.bind('error', function() {
				if (attrs.src != attrs.errSrc) {
					attrs.$set('src', attrs.errSrc);
				}
			});
		}
	}
})
.service('$check', function(){
	const SPECIAL = '<>&*\/|{}$:;';
	if(!String.prototype.getBytes){String.prototype.getBytes=function(){var len=this.length;var bytes=len;for(var i=0;i<len;i++){if(this.charCodeAt(i)>255){bytes++}}return bytes};}
	const LENGTH = {
		WORK_TITLE: 50,// 任务标题 // 限制字数 50个汉字
		WORK_CONTENT: 1000,// 任务描述
		REPORT_CONTENT: 1000,// 进度描述
		STAR_CONTENT: 200,
		TAG_NAME: 10,
		REMARK: 200,//各种审批、申请意见
		COMMENT: 200
	}
	return {
		getLength(key){
			return LENGTH[key] * 2;
		},
		getSpecialZZ(){
			return SPECIAL;
		},
		isEmpty(v){
			return !v.trim()
		},
		//不超过length
		maxLength(value, length) {
	        return (value.getBytes() > length)
	    },
	    isSpecial(value){
	    	const zz = new RegExp('['+SPECIAL+']');
	    	return zz.test(value)
	    },
		isHasEmoji(value){
			var reg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
			return reg.test(value)
		}
	}
})
.factory('Loginer', function(){
	
	return {
		get(){
			return localStorage.loginer ? JSON.parse(localStorage.loginer) : '';
		},
		set(data){
			localStorage.loginer = typeof data==='string' ? data : JSON.stringify(data);
		},
		// 加密
		encode(str){
			var hash = 0, i, chr, len;
			if (str.length === 0) return hash;
			for (i = 0, len = str.length; i < len; i++) {
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
			}
			return hash;
		},
		destory(){
			localStorage.removeItem('loginer')
		}
	}
})

.factory('$keyboard', ['$ionicScrollDelegate', '$state', function($ionicScrollDelegate, $state){
	//监听唤起键盘
	window.addEventListener('native.keyboardshow', function kbs(){
		//window.removeEventListener('native.keyboardshow', kbs);
		$ionicScrollDelegate.scrollBottom(true);
	});
	//监听隐藏键盘
	window.addEventListener('native.keyboardhide', function kbh(){
		//window.removeEventListener('native.keyboardhide', kbh);
		$ionicScrollDelegate.resize()
	});
	
	return {
		show(){
			if(window.cordova && window.cordova.plugins.Keyboard) {
				if(!cordova.plugins.Keyboard.isVisible) cordova.plugins.Keyboard.show()
			}
		},
		hide(){
			if(window.cordova && window.cordova.plugins.Keyboard) {
				if(cordova.plugins.Keyboard.isVisible) cordova.plugins.Keyboard.close();
			}
		}
	}
}])