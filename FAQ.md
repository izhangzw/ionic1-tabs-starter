# 使用过的版本
+ 1.7.15
+ 2.1.17
+ 3.19.0

直接使用最新版, 别问为什么
> npm install -g ionic@latest



# 常用命令
```
ionic start "ionic1-tab-starter" tabs --type=ionic1 --display-name="ionic1-tab-starter" --cordova --no-git --no-link`
ionic serve
ionic cordova plugin save

ionic cordova platform ls   //查看有哪些平台
ionic cordova platform remove android/ios   //移除安卓/ios平台
ionic cordova platform add android/ios   //添加安卓/ios平台
ionic cordova resources  //创建平台的icon.png图标以及启动页面
ionic cordova build android/ios   //编译 生成.apk
ionic cordova build android --release
apkSign.bat//安卓签名

cordova plugin remove [PLUGIN_ID]
cordova plugin add [PLUGIN_ID]@[VERSION]
```

# 常用代码

> 返回上一页的3种方式

```js

//
$ionicGoBack()
// 不想返回死循环
$window.history.go(-1)
// 
$ionicHistory.backView().go()
// 原路返回两级
$ionicHistory.goBack(-2);
```

> 跳转刷新

```js
//当需要用到路由缓存, 又需要强制刷新的时候, 可以在路由中加参数 例如
$state.go('app.home', {reload: +new Date(), id: 'xx'});
//$url自己封装的
$url.jump('/app/home', {reload: +new Date()});
```

> 页面切换的动画效果   

关闭跳转时候的动画效果：属性`nav-transition="none"`   
全局关闭过渡效果：`$ionicConfigProvider.views.transition('none');`   
自定义过度效果:

首先 `cordova plugin add com.telerik.plugins.nativepagetransitions`   

其次 `<meta http-equiv="Content-Security-Policy" content="default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src  'self' 'unsafe-inline' *">`   
再次 
```js

    /**
     *
     * direction: left | right | up | down
     *  up 向上
     *  down 向下
     *
     * transitiontype: fade | slide | flip | drawer | curl
     *  flip: 网易云打开效果
     *  drawer: 推到右侧，还留了10%
     *  curl: 翻书
     */
    .directive('goNative', ['$ionicGesture', '$ionicPlatform', function($ionicGesture, $ionicPlatform) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          $ionicGesture.on('tap', function(e) {
            const {direction='left', transitiontype='slide', duration='300'} = attrs;
            $ionicPlatform.ready(function() {
              if(!(window.plugins && window.plugins.nativepagetransitions)) return;
              let options = {
                duration
              };
              switch (transitiontype) {
                case 'fade':
                  break;
                case 'drawer':
                  options.origin = direction;
                  options.action = 'open';
                  break;
                default:
                  options.direction = direction;
                  break;
              }
              window.plugins.nativepagetransitions[transitiontype](
                options,
                msg => {
                  console.log(`success: ${msg}`)
                },
                msg => {
                  console.log(`err: ${msg}`)
                }
              );
            });
          }, element);
        }
      };
    }])
```
最后 `<a transitiontype="slide" direction="up" go-native>登录</a>`   



# ionic我遇到的坑(持续更新ing...)

### 下载文件到根目录, 需要在config.xml中加入配置
```xml
<!-- Android -->
<preference name="AndroidPersistentFileLocation" value="Compatibility" />
<!-- iOS 未测试 -->
<preference name="iosPersistentFileLocation" value="Library" />
```


### Android icon splash未生效的解决方案
res需手动替换
ionic cordova build android 的时候 会在根目录生成res/
将该文件夹下的目录及文件一并复制覆盖 platforms/android/res/


### Action Sheets在Android平台样式不对
在css文件中加入以下代码：
```css

.platform-android .action-sheet-backdrop{-webkit-transition:background-color 150ms ease-in-out;transition:background-color 150ms ease-in-out;position:fixed;top:0;left:0;z-index:11;width:100%;height:100%;background-color:rgba(0,0,0,0)}.platform-android .action-sheet-backdrop.active{background-color:rgba(0,0,0,0.4)}.platform-android .action-sheet-wrapper{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);-webkit-transition:all cubic-bezier(0.36,0.66,0.04,1) 500ms;transition:all cubic-bezier(0.36,0.66,0.04,1) 500ms;position:absolute;bottom:0;left:0;right:0;width:100%;max-width:500px;margin:auto}.platform-android .action-sheet-up{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.platform-android .action-sheet{margin-left:8px;margin-right:8px;width:auto;z-index:11;overflow:hidden}.platform-android .action-sheet .button{display:block;padding:1px;width:100%;border-radius:0;border-color:#d1d3d6;background-color:transparent;color:#007aff;font-size:21px}.platform-android .action-sheet .button:hover{color:#007aff}.platform-android .action-sheet .button.destructive{color:#ff3b30}.platform-android .action-sheet .button.destructive:hover{color:#ff3b30}.platform-android .action-sheet .button.active,.platform-android .action-sheet .button.activated{box-shadow:none;border-color:#d1d3d6;color:#007aff;background:#e4e5e7}.platform-android .action-sheet-has-icons .icon{position:absolute;left:16px}.platform-android .action-sheet-title{padding:16px;color:#8f8f8f;text-align:center;font-size:13px}.platform-android .action-sheet-group{margin-bottom:8px;border-radius:4px;background-color:#fff;overflow:hidden}.platform-android .action-sheet-group .button{border-width:1px 0 0 0}.platform-android .action-sheet-group .button:first-child:last-child{border-width:0}.platform-android .action-sheet-options{background:#f1f2f3}.platform-android .action-sheet-cancel .button{font-weight:500}.platform-android .action-sheet-open{pointer-events:none}.platform-android .action-sheet-open.modal-open .modal{pointer-events:none}.platform-android .action-sheet-open .action-sheet-backdrop{pointer-events:auto}.platform-android .action-sheet .action-sheet-title,.platform-android .action-sheet .button{text-align:center}.platform-android .action-sheet-cancel{display:block}

```


### 隐藏小技巧
ionic 工程, HTML准备完毕之后, ionic会根据平台为body添加对应class   
例如   
`iphone iOS11.2, body的class会包含"platform-ios platform-ios11 platform-ios11_2"`   
`android sdk4.3, body的class会包含"platform-android platform-android4 platform-android4_3"`   



### app内容允许复制
```css
.selectable{
-webkit-user-select: auto !important;
-khtml-user-select: auto !important;
-moz-user-select: auto !important;
-ms-user-select: auto !important;
-o-user-select: auto !important;
user-select: auto !important;  
}
```
iOS在被复制的元素上引用该class, 并添加属性. 例如`<h2 class="selectable" data-tap-disabled="true">这里的文字可复制了</h2>`



### app中复制提示信息改为中文
打开xcode，Resources/*-Info.plist文件，修改参数localization native development region的值改成China

### 访问手机隐私资源需要在config.xml中写入如下参数
> xcode控制台报错：`This app has crashed because it attempted to access privacy-sensitive data without a usage description. The app's Info.plist must contain an NSPhotoLibraryUsageDescription key with a string value explaining to the user how the app uses this data.`   
```XML
<platform name="ios">
<config-file parent="NSContactsUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能访问您的通讯录</string>
</config-file>
<config-file parent="NSMicrophoneUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能访问您的麦克风</string>
</config-file>
<config-file parent="NSPhotoLibraryUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能访问您的相册</string>
</config-file>
<config-file parent="NSCameraUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能访问您的相机</string>
</config-file>
<config-file parent="NSPhotoLibraryAddUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能将图片添加到相册</string>
</config-file>
<config-file parent="NSLocationAlwaysUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能获取您的地理位置</string>
</config-file>
<config-file parent="NSLocationWhenInUseUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能获取您的地理位置</string>
</config-file>
<config-file parent="NSBluetoothPeripheralUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能访问您的蓝牙</string>
</config-file>
<config-file parent="NSSpeechRecognitionUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能将语音转文字</string>
</config-file>
<config-file parent="NSCalendarsUsageDescription" target="*-Info.plist">
    <string>嗨马需要您的允许才能访问您的日历</string>
</config-file>
</platform>
```

### iPhoneX splash底部有一块白色区域
这个BUG是cordova-ios的, [详情](https://github.com/ionic-team/ionic-v1/issues/331)
`ionic cordova platform add ios@4.5.4`即可解决


### config.xml plugin携带参数模板
```
<plugin name="jpush-phonegap-plugin" spec="~3.2.13">
    <variable name="APP_KEY" value="ce4bb2d359088f49b0151310" />
</plugin>
```


### iOS11 吊起扫码程序两次
通过debounce解决


### Unable to tunnel through proxy. Proxy returns "HTTP/1.1 400 Bad Request
检查`.gradle/gradle.properties`文件中是否设置了代理,将代理删掉


### autofocus输入域并弹起键盘   

***Android***      
`document.getElementById('input').focus()`    

***iOS***   
`document.getElementById('input').focus()`     
并 config.xml中加入代码 `<preference name="KeyboardDisplayRequiresUserAction" value="true" />`


### 如果发现 input/textarea的光标不见了, 输入内容不显示,  但键盘打开状态   
查看dom中是不是多了一个同样的input/textarea 且 class中包含`previous-input-focus`, 修改它的显示位置.. 最好前面加父级class名以免影响别处
```css
ionic中源码
.previous-input-focus, .cloned-text-input + input, .cloned-text-input + textarea{
    position: absolute!important;
    left: -9999px;
}
```

### 不记录路由   
```
      const history = $ionicHistory.viewHistory();
      const backView = history && (history.backView);
      const refer = backView && (backView.url);
      if(refer && refer.includes('/o/kr/')) $ionicHistory.removeBackView();
```

### android tab跟随键盘, 且debug发现页面被压瘪

修改`/platfroms/android/app/src/main/AndroidManifest.xml`下`android:windowSoftInputMode="adjustPan"`
