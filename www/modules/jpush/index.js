/**
 * 极光推送模块 mJPush
 *
 *
 * 提供 $JPush 服务
 *    init()
 *    clearBadge();
 *
 *    //返回注册ID
 *    getRid();
 *
 * ✔️ 模块自动执行$JPush.init()
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

  const module = angular.module('mJPush', [])
    .constant('COPYRIGHT', {
      author: 'zhangzw',
      version: '0.0.2'
    })
    .run(['$injector', '$ionicPlatform', ($injector, $ionicPlatform)=>{
      $ionicPlatform.ready(function() {
        $injector.invoke(['$JPush', function($JPush){
          console.log(`${module.name} run.`);
          $JPush.init();
        }]);
      });
    }])
    /**
     * 开放接口
     */
    .factory('$JPush', ['$state', '$rootScope', '$timeout', '$location', '$log',
      ($state, $rootScope, $timeout, $location, $log) => {
        var jpush;
        let rid;
        const {isAndroid, isIOS} = ionic.Platform;
        const android = isAndroid();
        const ios = isIOS();
        const o = (()=>{
          return {
            clearBadge(){
              if(ios){
                jpush.setBadge(0);
                jpush.setApplicationIconBadgeNumber(0);
              }else{
              }
            },
            onReceiveRegistrationId(e){
              $log.log(`1.rid=${e.registrationId}`);
              rid = e.registrationId;
            },
            //进入app
            onGetRegistradionID(rId){
              $log.log(`2.rid=${rId}`);
              rid = rId;
            },
            //收到推送时触发
            onReceiveNotification(e){
              $log.log(`收到推送: ${JSON.stringify(e)}`);
              //不显示未读个数
              o.clearBadge();

              var id;
              if(android){
                const {title, alert, extras} = e;
                id = extras['cn.jpush.android.NOTIFICATION_ID'];
//					if(!appvar.background){
//						//根据notifycationId 清除本地通知
//						jpush.clearNotificationById(nid)
//					}
              }else{
                id = e['cn.jpush.android.NOTIFICATION_ID'];
                //const badge = e.aps.badge;
                //jpush.setBadge(badge)

              }

              //如果在通知页就刷新
              const crr = $state.current.name;
              if('hmb.notify'===crr) $rootScope.$broadcast('new.notify')
              // else if('workDetail'===crr && $location.path().includes(id)){
              //   $rootScope.$broadcast('refresh.detail')
              // }
            },
            //点击通知进入应用程序时触发
            onOpenNotification(e){
              $log.log(`通知打开app(${android? 'android': 'ios'}), ${JSON.stringify(e)}`)
              var id;
              if(android){
                const {title, alert, extras} = e;
                id = extras['cn.jpush.android.NOTIFICATION_ID'];
                //o.clearBadge();
              }else{
                id = e['cn.jpush.android.NOTIFICATION_ID'];
                let badge = e.aps ? (e.aps.badge || 0) : 0;
                jpush.setBadge(--badge)
              }

              $state.go('hmb.notify');
            },
            //收到自定义通知时触发
            onReceiveMessage(e){
              $log.log(`收到自定义通知: ${JSON.stringify(e)}`);
              if(android){
                const {message, extras} = e;
              }else{
                const {content, extras} = e;
              }
            }

          }
        })();

        return {
          init(){
            jpush = window.JPush;

            if(!jpush){
              $log.error('缺少推送插件');
              return;
            }
            jpush.init();
            jpush.setDebugMode(false);
            jpush.setLatestNotificationNum(99);
            $timeout(()=>{
              jpush.getRegistrationID(o.onGetRegistradionID);
            }, 0);
            //监听注册成功事件 ( 新安装app会进入此监听 , 测试发现部分android和ios会)
            document.addEventListener('jpush.receiveRegistrationId', o.onReceiveRegistrationId, false);
            //监听推送打开
            document.addEventListener('jpush.openNotification',o.onOpenNotification,false);
            //监听推送
            document.addEventListener('jpush.receiveNotification',o.onReceiveNotification,false);
            //监听自定义消息
            document.addEventListener('jpush.receiveMessage',o.onReceiveMessage,false);
            //监听iOS后台接收
            //document.addEventListener("jpush.backgroundNotification", o.onBackgroundNotification, false)
          },
          //清空
          clearBadge(){
            o.clearBadge()
          },
          getRid(){
            return rid || '';
          }
        }
      }]);

  return module;
}));
