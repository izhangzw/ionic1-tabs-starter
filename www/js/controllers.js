'use strict';

const appCtrl = angular.module('app.controllers',
[
'app.commons',
'app.services'
]);

appCtrl
.controller('TabsCtrl', ['$scope', function($scope) {
	
}])

.controller('NotifyCtrl', ['$scope', function($scope) {
	
}])

.controller('UserCtrl', ['$scope', function($scope) {
	
}])

.controller('LoginCtrl', ['$scope', 'Loginer', 'APP', '$toast', function($scope, Loginer, APP, $toast) {
	const loginer = Loginer.get();

	$scope.version = () => {
		$toast.alert(APP.version)
	}
}])