/**
 * 通用工具模块 app.commons
 *
 *
 * 提供 服务
 * $restfuller
 * $url
 * $toast
 * Loginer
 *
 * 提供 自定义标签
 * debounce
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

  const module = angular.module('app.commons', [/*'mFile'*/])
    .constant('COPYRIGHT', {
      author: 'zhangzw',
      version: '0.0.2'
    })
    // rest
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
      };

      //执行ajax
      const processing = function(url, config){
        console.log(`ajax: ${url}`)
        let datas = Object.assign({timeout: 15000}, { url: paddingURL(url) }, config);

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
        };

        const promise = new Promise( (resolve, reject) => {
          $http(datas)
            .success(ret => {
              let {status, data, errorMsg, errorCode} = ret;
              status = status.toUpperCase();
              if (status === 'ERROR' || status === 'FAILED') {
                errorMsg && ($toast.alert(gMsg(errorMsg)));
                reject(gMsg(errorMsg));

                if(errorCode==='0001'){
                  $rootScope.$broadcast('unauth')
                }
              }else{
                resolve(data);
              }
            })
            .error( (e, status, c) => {
              reject(status)
            });
        });
        //拓展 - 可以使用 rest.success()
        promise.success = function(callback){
          promise.then( data => {
            callback && callback(data)
          });
          return promise;
        };
        //拓展 - 可以使用 rest.error()
        promise.error = function(callback){
          promise.then( null, e=> {
            callback && callback(e)
          });
          return promise;
        };
        return promise;
      };
      return {
        get(url, config){
          return processing(url, Object.assign({}, {method: 'get'}, config));
        },
        post(url, data, config){
          return processing(url, Object.assign({}, {method: 'post', data}, config));
        }
      }
    }])
    /**
     * 跳转携带参数
     *
     * #/home?key=xxx
     *
     */
    .factory('$url',['$location', function($location){

      const getParamsFromUrl = function(name){
        var hash = location.hash;
        var index = hash.indexOf('?');
        var search = hash.substr(index);
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");//构造一个含有目标参数的正则表达式对象
        var r = search.substr(1).match(reg);//匹配目标参数
        if (r!=null) return unescape(r[2]); return '';//返回参数值
      };
      /**
       * 处理参数
       *
       * - 对象参数转成字符串
       * - 处理中文参数
       *
       * @param params {object}
       * @return ret {object}
       */
      const cpu = (params) => {
        const ret = {}
        for(let key in params){
          if(params.hasOwnProperty(key)){
            let val = params[key];

            if(typeof val === 'object')
              val = JSON.stringify(val)

            ret[key] = encodeURIComponent(val);
          }
        }
        return ret;
      };

      return {
        /**
         * 携带参数跳转
         *
         * @param url {string} 必填
         * @param params {object} 选填
         */
        jump(url, params){
          params = params ? cpu(params) : {};
          $location.path(url).search(params)
        },
        /**
         * 获取URL上的参数
         * @param key
         * @returns {返回参数值}
         */
        param(key){
          return decodeURIComponent(getParamsFromUrl(key))
        }
      }
    }])
    //吐司提示
    .service('$toast', ['$timeout', function($timeout){
      var hash = {
        alert: 'ion-android-alert',
        succ: 'ion-checkmark-circled'
      }
      var html = function(m, t){
        return '<div class="prompt '+t+'"><i class="icon '+hash[t]+'"></i><span>'+m+'</span></div>'
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

    .factory('Loginer', function(){

      return {
        get(){
          return localStorage.loginer ? JSON.parse(localStorage.loginer) : '';
        },
        set(data){
          localStorage.loginer = typeof data==='string' ? data : JSON.stringify(data);
        },
        destory(){
          localStorage.removeItem('loginer')
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
        // DES加密
        encryptByDES(message, key='mochasoft1qa2ws3ed!@#$%^') {
          var keyHex = CryptoJS.enc.Utf8.parse(key);
          var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          });
          return encrypted.toString();
        }
      }
    })
    /**
     * 防抖
     *
     * 立即出发函数，time毫秒内不重复出发
     *
     *
     * 使用方式：
     * 在标签中加入属性debounce="fn(!params)(,time)"
     * fn是需要执行的函数名
     * params是fn的参数
     * time是防抖间隔毫秒值，默认2000
     *
     * 例如：
     * <a debounce="page.scan,3000"></a>
     * <a debounce="file.open!id,2000"></a>
     */
    .directive('debounce', [function(){
      var debounce = function(fn, t, params){
        var timeout;

        debounce.cancel = function(){
          clearTimeout(timeout);
          timeout = null;
        };

        return function(){
          var
            ctx = this,
            args = arguments,
            exe = !timeout,
            ret;
          //Array.prototype.push.call(args, params);
          //args[0]._debounce_params_ = params;
          exe && fn && ( ret = fn.call(ctx, params) );

          if(!timeout){
            timeout = setTimeout(function(){
              timeout = null;
            }, t);
          }

          return ret;
        }
      };
      return {
        restrict: 'A',
        link: function(scope, elment, attr){
          // 处理参数
          // 参数规则 fn!params,time
          // eg: page.scan!id,3000
          const attributes = attr.debounce;
          let time = 2000;
          let fn_params;
          let fn;
          let params = '';
          //分离函数和点击间隔毫秒
          // caz 毫秒值可能不传
          if(attributes.includes(',')){
            const arr = attributes.split(',');
            fn_params = arr[0];
            time = arr[1];
          }else{
            fn_params = attributes;
          }
          //分离函数名和参数
          if(fn_params.includes('!')){
            const arr = fn_params.split('!');
            fn = arr[0];
            params = arr[1];
          }else{
            fn = fn_params;
          }
          elment.bind('click', debounce(eval(`scope.${fn}`), time, params))
        }
      }
    }]);

  return module;
}));
