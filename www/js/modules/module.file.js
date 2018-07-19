/**
 * 文件处理模块 mFile
 *
 * 依赖:
 *
 * 提供 $File 服务
 * 		view
 * 		browserOpen
 * 		install
 * 		open
 * 		download
 * 		download_open
 * 		upload
 *
 *
 * 适用范围
 * ???
 * ! 将URL 抽为参数
 * ! 尚未提供初始化接口
 * ! 错误统一处理
 * ? token怎么处理, 切入?
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

  const module = angular.module('mFile', [])

    .constant('COPYRIGHT', {
      author: 'zhangzw',
      version: '0.0.5'
    })
    .constant('FILE_TYPE',{
      IMG: 'jpg png jpeg bmp gif',
      WPS: 'doc docx pdf ppt pptx xls xlsx txt',
      PKG: 'apk plist ipa'
    })
    .value('FILES_HOME', 'OKR_FILES')

    .value('SERVER',{
      host: '/scoreokr-web',
      token: '',
      url: {
        download: '/fileresource/download?resourceId='
      }
    })
    .config([()=>{
    }])
    .run(['APP', 'SERVER', (APP, SERVER)=>{
      //console.log(`${module.name} run.`)
      SERVER.host = APP.host
    }])
    /**
     * 接口服务
     */
    .factory('sFile', ['$cordovaFileTransfer', 'SERVER', 'Loginer',($cordovaFileTransfer, SERVER, Loginer)=>{
      const _downloadURL = (fileId) => `${SERVER.host}${SERVER.url.download}${fileId}&Authorization=${SERVER.token || Loginer.get().token}`

      return {
        downloadURL: _downloadURL,
        //下载
        download(fileId,fileDest){
          let url = _downloadURL(fileId);
          //fixed
          if(fileId.includes('http://')&&fileId.includes('.apk')){
            url = `${SERVER.host}/fileresource/downloadApk?resourceId=${encodeURIComponent(fileId)}`
          }
          return $cordovaFileTransfer.download(url, fileDest, {}, false)
        },

        /**
         * 上传
         * uri: 选取文件的本地地址
         * url: 上传附件的服务器地址
         */
        upload(uri, url){
          let wIndex = uri.lastIndexOf('?');
          let options = {
            fileKey : 'file',
            fileName : (wIndex!=-1) ? uri.substring(uri.lastIndexOf('/') + 1, wIndex) : uri.substring(uri.lastIndexOf('/') + 1),
            mimeType : 'image/jpeg',
            headers: {
              Authorization: Loginer.get().token
            }
          };

          return $cordovaFileTransfer.upload(url, uri, options)
        }
      }
    }])
    .factory('$File', ['FILE_TYPE', 'FILES_HOME', 'sFile', '$cordovaCamera', '$cordovaFileOpener2', '$ionicLoading', '$toast', '$timeout', (FILE_TYPE, FILES_HOME, sFile, $cordovaCamera, $cordovaFileOpener2, $ionicLoading, $toast, $timeout)=>{
      const isIOS = ionic.Platform.isIOS();
      const isAndroid = ionic.Platform.isAndroid();

      const file = (()=> {
        return {
          /**
           * 返回类别
           *
           * params
           * 		被操作文件的后缀名
           * return
           * 		FILE_TYPE内定义的key
           */
          category(fileType){
            fileType = fileType.toLowerCase();
            const arr = Object.entries(FILE_TYPE);
            const len = arr.length;
            let i = 0;
            for(;i<len;i++){
              const [type, values] = arr[i];
              if(values.includes(fileType)){
                return type.toLowerCase();
              }
            }
          },
          gFileData(id, path){
            const pointIndex = path.lastIndexOf('.');
            const x = path.substring(0, pointIndex);
            const fileType = path.substring(pointIndex+1, path.length);

            const index = x.lastIndexOf('/');
            let filePath = `${FILES_HOME}/`, fileName = '';
            if(index!==-1){
              filePath += x.substring(0, index)
              fileName = x.substring(index+1, x.length)
            }else{
              fileName = x;
            }

            return {
              id,
              fileName,
              fileType,
              filePath
            }
          },
          //打开H5文件系统
          requestFileSystem(){
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            return new Promise( (resolve, reject)=>{
              window.requestFileSystem(
                // PERSISTENT(=1): 永久的， TEMPORARY(=0)： 临时的
                window.LocalFileSystem ? LocalFileSystem.PERSISTENT : window.PERSISTENT,
                0, resolve, reject);
            })

          },
          /**
           * 创建多级目录
           *
           *  fs:  fs.root
           * dir: [] -- ['ORK_FILES','2017','12']
           */
          getDirectories(fs, dir){
            const thiz = this;
            fs.getDirectory(dir.shift(), {create: true}, (dirEntry) => {
              if(dir.length){
                thiz.getDirectories(dirEntry, dir)
              }
            }, e => {
              console.log('创建目录失败')
              //_error_(e)
            })
          },
          //创建一级目录
          getDirectory(fs, dir){
            return new Promise( (resolve, reject)=>{
              fs.root.getDirectory(dir, {create: true}, resolve, reject)
            })
          },
          //创建文件
          getFile(fs, fileName){
            return new Promise( (resolve, reject)=>{
              fs.getFile(fileName, { create: true, exclusive: false }, resolve, reject)
            })
          },

          //打开方式 - InAppBrowser
          // open image of android(本地文件)
          // open all type file of iOS(在线自己下载)
          // open ios plist
          browserOpen(url){
            var o,
              target = '_blank',
              options = 'location=no,hardwareback=no,zoom=no,enableViewportScale=yes,closebuttoncaption=关闭';

            if(url.startsWith('file:')){

            }else if(url.includes('.plist')){
              target = '_system';
              options = '';
            }else if(url.includes('.apk')){
              target = '_system';
              options = '';
            }else{
              url = sFile.downloadURL(url)
            }
            if(window.cordova && window.cordova.InAppBrowser){
              o = cordova.InAppBrowser.open(url, target, options);
              o.addEventListener('loadstart', function () {
                $ionicLoading.show();
              });
              o.addEventListener('loadstop', function () {
                $ionicLoading.hide();
              })
              o.addEventListener('loaderror', function (e) {
                const { type, url, code, message } = e;
                $toast.alert(`这个文件可能是迷路了[${code}]`);
                console.dir(e)
                $ionicLoading.hide();

                o.close();
                o=undefined;
              });
            }else{
              $toast.alert('抱歉, 我还在思考如何打开此文件');
              console.error('未找到InAppBrowser插件')
            }
          },
          //打开方式 - FileOpener 4 Android
          //
          // open android's office file
          // ios 不走这
          filerOpen(url){
            if(window.cordova && window.cordova.plugins.FileOpener) {
              window.cordova.plugins.FileOpener.openFile(url, data => {}, () => {
                $toast.alert('抱歉, 需要安装WPS才能查看此类型的文件')
              });
            }else{
              $toast.alert('抱歉, 我还在思考如何打开此文件');
              console.error('未找到cordova.plugins.FileOpener插件')
            }
          },
          //打开方式 - $cordovaFileOpener2
          //install apk
          filer2Open(url){
            let i = url.lastIndexOf('.');
            let fileType = url.substring(i + 1, url.length);
            let mime = fileType.includes('apk') ? 'vnd.android.package-archive' : fileType;
            return $cordovaFileOpener2.open(url, `application/${mime}`)
          },
          //Android 安装 apk
          installApk(url){
            $ionicLoading.show({ template: '正在安装...' });
            this.filer2Open(url).then(()=>{
              $toast.succ('安装完毕')
            },(e)=>{
              $toast.alert('安装失败')
              console.log(e)
            }).finally(()=>{
              $timeout(()=>{
                $ionicLoading.hide();
              }, 0);
            })
          },
          /**
           * 上传前选择
           */
          pick(options){
            options.sourceType = [Camera.PictureSourceType.CAMERA, Camera.PictureSourceType.PHOTOLIBRARY][options.sourceType];
            options.mediaType && ( options.mediaType = [Camera.MediaType.PICTURE, Camera.MediaType.VIDEO, Camera.MediaType.ALLMEDIA][options.mediaType] );
            //
            options = Object.assign({
              encodingType: Camera.EncodingType.JPEG,
              destinationType: Camera.DestinationType.FILE_URI,
              quality: 50,
              saveToPhotoAlbum: false,
              correctOrientation: true,
              mediaType: Camera.MediaType.ALLMEDIA
              //targetWidth: 100,
              //targetHeight: 100,
              //allowEdit: true
            }, options);

            return $cordovaCamera.getPicture(options);
          },
          /**
           * 上传
           */
          upload(uri, url){
            return new Promise( (resolve, reject) => {
              $ionicLoading.show();

              sFile.upload(uri, url).then( resolve,
                err => {
                  $toast.alert(`上传出错[${err.code}]`)
                },
                progress => {
                  let {loaded, total, lengthComputable} = progress;
                  let percent = 0;
                  if(lengthComputable===true){
                    percent = parseInt(loaded / total*100, 10);
                    $ionicLoading.show({
                      template: `正在上传: ${percent}%`
                    });
                  }
                })
                .finally(()=>{
                  $timeout(()=>{
                    $ionicLoading.hide();
                  }, 0);
                });
            });
          }
        }
      })();

      return {
        /**
         * 查看文件
         *
         * {
			 * 	id: 文件下载的ID
			 *  path: 文件保存路径( 2017/12/fr-32055be0-2558-45b2-b830-a4ee5e25b1c1.pptx )
			 * }
         */
        view( data ){
          const {id, filePath: path}= data
          if(isIOS){
            const oFile = file.gFileData(id, path);
            this.open(oFile)
          }else{
            this.download_open(data)
          }
        },
        /**
         * 浏览器打开
         */
        browserOpen(url){
          file.browserOpen(url)
        },
        install(url){
          file.installApk(url)
        },
        /**
         * 打开文件
         *
         * params
         *
         * {id, fileName, filePath, fileType, result}
         */
        open({id, fileName, filePath, fileType, result} = {}){
          const cate = file.category(fileType);
          ;({
            //打开图片
            img(){
              if(isAndroid){
                file.browserOpen(result.toURL())
              }else{
                file.browserOpen(id)
              }
            },
            //打开word
            wps(){
              if(isAndroid){
                file.filerOpen(result.toURL())
              }else{
                file.browserOpen(id)
              }
            },
            //安装
            pkg(){
              if(isAndroid){
                file.installApk(result.toURL())
              }else{
                file.browserOpen(id)
              }
            }
          })[cate]();

        },
        /**
         * 下载文件
         */
        async download({ id, filePath, fileName, fileType }={}){
          $ionicLoading.show()
          const fs = await file.requestFileSystem();
          await file.getDirectories(fs.root, filePath.split('/'));
          const fileEntry = await file.getFile(fs.root, filePath ? `${filePath}/${fileName}.${fileType}`: `${fileName}.${fileType}`);
          return new Promise((resolve, reject)=> {
            sFile.download(id, fileEntry.toURL()).then(resolve, reject, progress=>{
              let {loaded, total, lengthComputable} = progress;
              let percent = 0;
              if(lengthComputable===true){
                percent = parseInt(loaded / total*100, 10);
                $ionicLoading.show({
                  template: `已经下载：${percent}%`
                });
              }
            }).finally(()=>{
              $timeout(()=>{
                $ionicLoading.hide();
              },0)
            })
          });
        },
        /**
         * 下载并打开
         * params
         * 		id: '文件ID',
         * 		filePath: '2017/12/fr-32055be0-2558-45b2-b830-a4ee5e25b1c1.pptx'
         */
        async download_open({id, filePath: path, url}={}){
          const oFile = file.gFileData(id, path);
          try{
            //download
            oFile.result = await this.download(oFile);
            //open
            this.open(oFile)
          }catch(e){
            $toast.alert('打开失败')
            $timeout(()=>{
              $ionicLoading.hide();
            },0)
            console.log('download_open_catch: ',e)
          }
        },

        gFileData(id, path){
          return file.gFileData(id, path)
        },
        /**
         * 上传
         *
         * 参数请参见 https://www.npmjs.com/package/cordova-plugin-camera
         */
        async upload(url, options){
          const uri = await file.pick(options)
          return file.upload(uri, url)
        }
      }
    }])
    .directive('directive',[()=>{
      console.log('directive')
    }])
    .filter('File.filter',[()=>{
      console.log('filter')

    }])
    .controller('File.controller',[()=>{
      console.log('controller')

    }]);

  return module;
}));
