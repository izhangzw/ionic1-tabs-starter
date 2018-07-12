# 简介
这是一个ionic模板工程, 简化手机端开发而生成的生产模板   
[FAQ](https://github.com/jDragonV/ionic1-tabs-starter/blob/master/FAQ.md)

# 安装
该工程依赖于node.js(>6.0) 安装[node.js](https://npm.taobao.org/mirrors/node)

1. 克隆工程到本地  `https://github.com/jDragonV/ionic1-tabs-starter.git`   
2. 进入工程目录执行
```
$ npm install -g ionic@3.19.1
$ npm install -g cordova@6.4.0
$ npm install
```
3. 运行工程 `ionic serve`


# 截图


# 目录结构
```
|--[es6]								// 打包时需要, 开发时可以忽略. --待转换的文件存放目录(ES6 --babel--> ES5). 生成的文件将直接替换www/js对应的文件
|--[hooks]								// 如果是在linux或mac系统下，还需要使用chmod +x 命令启用hooks目录下面的所有js文件的执行权限
|--[resources]							// 资源目录
	|--icon.png							// Logo(1024px * 1024px)
	|--splash.png						// 启动图片(2732px * 2732px)
|--[scss]								// 预编译样式文件目录
	|--ionic.app.scss					// ionic预编译样式文件
|--[www]								// 90%的开发都在此目录下
	|--[css]							// 样式文件
		|--[fonts]						// 自定义的矢量图标目录
		|--base.css						// 预设(基类)样式文件
		|--style.css					// 自定义样式文件
		|--ionic.app.css				// 通过预编译scss文件生成的样式文件
	|--[img]							// 图片
	|--[js]								// javascript文件
		|--[modules]					// 自定义的公用js模块
		|--[service]					// 服务类js.  此文件夹下所有文件都是一个单独对象, 用来调用服务器接口. 
			|--service.user.js			// 实例文件
	|--[lib]							// 三方js插件
		|--[ionic]						// ionic框架所需
		|--[loadingBar]					// jQuery插件
		|--browser-polyfill.min.js		// ES6语法polyfill
		|--jquery.min.js				// jQuery
		|--loading-bar.min.js			// 基于angular, 自动监听请求的loading效果插件
		|--ng-cordova.min.js			// cordova插件整合 [帮助文档](http://ionic-china.com/doc/ngCordova/index.html)
	|--[templates]						// HTML 模板
	|--index.html						// 页面入口
|--apkSign.bat							// 签名命令
|--babel.bat							// 编译命令
|--bower.json							// ionic serve后没有他会警告找不到它
|--config.xml							// 打包配置文件
|--gulpfile.js							// gulp 命令
|--ionic.config.json					// ionic工程配置文件
|--okr.ks								// 示例,android证书
|--package.json							// nodejs配置文件
|--README.md
|--.bowerrc								// eslint忽略配置
|--.editorconfig						// 编辑器配置，就是指统一不同编辑器的代码风格的配置
|--.gitignore							// git忽略配置
```

# 版本
- node: v6.9.2
- ionic: 3.19.1
- cordova: 6.4.0

