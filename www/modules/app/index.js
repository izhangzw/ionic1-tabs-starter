/**
 * App模块 mApp
 *
 * 依赖: app.commons
 *
 * 提供 $App 服务
 *
 * 		//Android回退按钮
 * 		handleABB(['okr','workCreate'])
 *
 * 		//一些基础配置
 * 	  someConfigInit()
 *
 * 		//检查更新
 * 	  version()
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

  let platform;//当前使用平台
  let latest;//最新版本号
  let package_home = 'HM_OKR/package';//apk下载存放位置
  let package_name = 'OKR';//下载保存文件名

  const module = angular.module('mApp', [
    'app.commons',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.statusbar',
    'ngCordova.plugins.fileOpener2'
  ])
    .constant('COPYRIGHT', {
      author: 'zhangzw',
      version: '0.0.2'
    })
    .constant('PLATFORM', {
      IOS: 'ios',
      ANDROID: 'android',
      OTHER: 'other'
    })
    .config(['PLATFORM',(PLATFORM)=>{
      const {isAndroid, isIOS} = ionic.Platform;
      platform = (()=>{
        const android = isAndroid();
        const iOS = isIOS();
        return iOS ? PLATFORM.IOS : ( android ? PLATFORM.ANDROID: PLATFORM.OTHER );
      })();
    }])
    .run([()=>{
      console.log(`${platform} - ${module.name} run.`)
    }])
    /**
     * 接口服务
     */
    .factory('sApp', ['$restfuller', ($restfuller)=>{
      const version = (url, params) => {
        return $restfuller.post(url, params)
      };
      return {
        version,
      }
    }])
    /**
     * 错误信息
     */
    .factory('eApp', ['$cordovaToast', ($cordovaToast)=>{
      const hash = {
        1: 'NOT_FOUND_ERR',
        2: 'SECURITY_ERR',
        3: 'ABORT_ERR',
        4: 'NOT_READABLE_ERR',
        5: 'ENCODING_ERR',
        6: 'NO_MODIFICATION_ALLOWED_ERR',
        7: 'INVALID_STATE_ERR',
        8: 'SYNTAX_ERR',
        9: 'INVALID_MODIFICATION_ERR',
        10: 'QUOTA_EXCEEDED_ERR',
        11: 'TYPE_MISMATCH_ERR',
        12: 'PATH_EXISTS_ERR',
        100: '未知平台',
        101: '创建目录失败',
        102: '安装失败',
      };
      return {
        error(code){
          $cordovaToast.showShortCenter(hash[code])
        }
      }
    }])
    /**
     * 开放接口
     */
    .factory('$App', ['$state', '$ionicPlatform', '$cordovaToast', '$timeout', '$ionicHistory', '$cordovaStatusbar', '$ionicPopup', '$log', 'sApp', '$cordovaInAppBrowser', '$cordovaFileTransfer', '$cordovaFileOpener2', '$cordovaFile', 'PLATFORM', '$ionicLoading', 'eApp',
      ($state, $ionicPlatform, $cordovaToast, $timeout, $ionicHistory, $cordovaStatusbar, $ionicPopup, $log, sApp, $cordovaInAppBrowser, $cordovaFileTransfer, $cordovaFileOpener2, $cordovaFile, PLATFORM, $ionicLoading, eApp)=>{

      const handleStatusBar = () => {
        if(window.StatusBar) {
          StatusBar.styleDefault();
          if (platform===PLATFORM.IOS) {
            $cordovaStatusbar.overlaysWebView(true);
          }
        }
      };
      //提示
      const surprise = (()=>{
        const template = (info) => {
          const {curr, latest, log} = info;
          return `<div class="updateInfo">
					<h5 class="updateTitle">请点击更新，进行更新</h5>
					<p class="updateVersion"><b>${curr}</b> 升级至 <b>${latest}</b></p>
					<p class="updateLog">${log ? '更新内容：'+log : ''}</p>
					</div>`;
        };
        return {
          alert(info){
            return $ionicPopup.alert({
              title: '发现新版本!',
              template: template(info),
              buttons: [{
                text: '<b>更新</b>',
                type: 'button-positive',
                onTap(e){
                  return !0;
                }
              }]
            });
          },
          confirm(info){
            return $ionicPopup.confirm({
              title: '发现新版本!',
              template: template(info),
              buttons: [{
                text: '取消'
              },{
                text: '<b>更新</b>',
                type: 'button-positive',
                onTap(e){
                  return !0;
                }
              }]
            })
          }
        }
      })();
      const file = (()=>{
        return {
          gFileData(path){
            return {
              fileName: `${package_name}_${latest}`,
              fileType: 'apk',
              filePath: path
            }
          },
          //打开H5文件系统
          requestFileSystem(){
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            return new Promise( (resolve, reject)=>{
              window.requestFileSystem(
                // PERSISTENT(=1): 永久的， TEMPORARY(=0)： 临时的
                window.LocalFileSystem ? LocalFileSystem.PERSISTENT : window.PERSISTENT, 0, resolve, reject);
            })

          },
          /**
           * 创建多级目录
           *
           *  fs:  fs.root
           * dir: [] -- ['ORK_FILES','2017','12']
           */
          getDirectories(fs, dir){
            return new Promise((resolve, reject)=>{
              const exe = (fs, dir) => {
                fs.getDirectory(dir.shift(), {create: true}, dirEntry=>{
                  if(dir.length)
                    exe(dirEntry, dir);
                  else
                    resolve(dirEntry);
                }, e=>{
                  eApp.error(e.code);
                  reject(e);
                });
              };
              exe(fs,dir);
            });
          }
        }
      })();
      /**
       * 下载安装
       *
       * iOS
       *  - 直接打开url, 系统完成后续下载安装工作
       *
       * Android
       *  - 创建本地文件位置
       *  - 下载文件
       *  - 安装apk
       *
       * @param url {String}
       * @param {Object}
       *    path    {String}
       */
      const install = async (url, {path}) => {
        const downloader = async (fileEntry) => {
          return new Promise((resolve, reject)=>{
            console.log(`${url} --- ${fileEntry.toURL()}`)
            $cordovaFileTransfer.download(url, fileEntry.toURL(), {}, false).then(resolve, reject, progress=>{
              const {loaded, total, lengthComputable} = progress;
              let percent = 0;
              if(lengthComputable===true){
                percent = parseInt(loaded / total*100, 10);
                $ionicLoading.show({
                  template: `已经下载：${percent}%`
                });
              }
            }).finally(()=>{
              $timeout($ionicLoading.hide, 0)
            })
          })
        };
        switch (platform){
          case PLATFORM.IOS:
            $cordovaInAppBrowser.open(url, '_blank', {
              location: 'yes',
              clearcache: 'yes',
              toolbar: 'no'
            })
              .then(e => {
                // success
              })
              .catch(e => {
                // error
              });
            break;
          case PLATFORM.ANDROID:
            const {filePath, fileName, fileType} = file.gFileData(path);
            // 生成本地目录及文件
            const fs = await file.requestFileSystem();
            const dirEntry = await file.getDirectories(fs.root, filePath.split('/'));
            const fileEntry = await $cordovaFile.createFile(dirEntry.toURL(), `${fileName}.${fileType}`, true);
            // 下载
            $ionicLoading.show({ template: '开始下载...' });
            const result = await downloader(fileEntry);
            // 安装
            $ionicLoading.show({ template: '正在安装...' });
            $cordovaFileOpener2.open(result.toURL(), 'application/vnd.android.package-archive').then(()=>{
              $cordovaToast.showLongBottom('安装成功')
            },(e)=>{
              eApp.error(102)
            }).finally(()=>{
              $timeout($ionicLoading.hide, 0);
            });
            break;
          default:
            eApp.error(100);
            break;
        }
      };
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
          };
          $ionicPlatform.registerBackButtonAction(()=>{

            if( isSurface(options) ){
              _count++;
              if(_count===1){
                $cordovaToast.showShortBottom('再按一次退出')
              }else if(_count>=2){
                $timeout.cancel(timer);
                //退出应用
                navigator.app.exitApp();
              }

              timer = $timeout( ()=> {
                _count = 0;
              }, 3000)
            }else{
              const backView = $ionicHistory.backView();
              backView && backView.go();
              //$window.history.go(-1)
            }
          }, 100/*priority优先级*/)
        },
        someConfigInit(){
          //kb
          if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
          }
          //sb
          handleStatusBar();
          /*if (window.StatusBar) {
            StatusBar.styleDefault();
          }*/
        },
        /**
         * 检查更新, 并下载安装
         *
         * @params {Object}
         * {
         *  url     版本号请求地址
         *  version 当前版本号
         * }
         * @params {Object}
         * {
         *  path    文件保存的目录
         * }
         */
        async version({url, version: vs}, path=package_home){
          const pf = platform;
          const {version, isForce, update, log, releaseTime, downloadUrl} = await sApp.version(url, {vs, pf});
          //赋值给全局变量
          latest = version;
          if(!update) return;
          //需要更新继续执行
          const info = {
            curr: vs,
            latest: version,
            log,
            releaseTime,
          };
          const y = await surprise[isForce?'alert':'confirm'](info);
          if(!y) return;
          //更新安装
          await install(downloadUrl, {path});
        }
      }
    }]);
  return module;
}));
