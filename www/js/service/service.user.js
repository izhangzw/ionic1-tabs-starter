'use strict';
/**
 * 例子 - 人
 * 
 */
appService.factory('User', ['$restfuller', function($restfuller){
	
	return {
		//个人信息
		info(id){
			return $restfuller.get('/empDirectory/getUserInfo')
		},
		
		update(data){
			var url;
			Object.entries(data).forEach( v => {
				let [key, value] = v;
				switch(key){
					case 'userName':
						url = '/empDirectory/modifyUserName';
						break;
					case 'mobile':
						url = '/empDirectory/modifyMobile'
						break;
					default: break;
				}
			})
			return $restfuller.post(url, data);
		},
		login(data){
			return $restfuller.post('/mobiledoLogin', data);
		},
		logout(){
			return $restfuller.get('/dologoutapp')
		}
	}

}]);