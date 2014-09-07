'use strict';
/*jshint unused: vars,camelcase: false */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Xcards20',
  ['ionic',
  'config',
  'Xcards20.controllers',
  'Xcards20.services',
  'Xcards20.directives',
  'Xcards20.directives.imageContainer',
  'Xcards20.directives.cardContainer',
  'restangular',
  'LocalStorageModule',
  'ngCordova',
  'facebook'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      window.StatusBar.styleDefault();
    }
  });
})
.constant('API',{'domain':'http://paulgruenbacher.com/xcards/mobile'})
.constant('PERMISSIONS',{FbPermssions:{scope:'email'}})
.config(function(FacebookProvider) {
  // Set your appId through the setAppId method or
  // use the shortcut in the initialize method directly.
  FacebookProvider.init('749099631795399');
  console.log('provider',FacebookProvider);
})
.config(function(RestangularProvider,API){
  RestangularProvider.setBaseUrl(API.domain);
  //RestangularProvider.setDefaultHttpFields({cache: true});
})
.config(['$httpProvider', function($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
])
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  // setup an abstract state for the tabs directive
  .state('app', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'AppCtrl'
  })

  .state('app.logout', {
    url: '/logout',
    views: {
      'tab-dash' : {
        controller: 'LogoutCtrl'
      }
    }
  })

  // Each tab has its own nav history stack:

  .state('app.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('app.share',{
    url:'/share',
    views:{
      'tab-dash':{
        templateUrl:'templates/share.html',
        controller: 'ShareCtrl'
      }
    }
  })
  .state('app.transfer',{
    url:'/recipient/:recipientId',
    views:{
      'tab-dash':{
        templateUrl:'templates/transfer.html',
        controller: 'TransferCtrl'
      }
    }
  })
  .state('app.card', {
    url: '/card',
    views: {
      'tab-card': {
        templateUrl: 'templates/tab-card.html',
        controller: 'CardCtrl'
      }
    }
  })
  .state('app.build-single', {
    url: '/build/single',
    views: {
      'tab-card': {
        templateUrl: 'templates/single.html',
        controller: 'SingleCtrl'
      }
    }
  })
.state('app.build-message', {
    url: '/build/message',
    views: {
      'tab-card': {
        templateUrl: 'templates/message.html',
        controller: 'MessageCtrl'
      }
    }
  })
  .state('app.addresses', {
    url: '/addresses',
    views: {
      'tab-addresses': {
        templateUrl: 'templates/tab-addresses.html',
        controller: 'AddressesCtrl'
      }
    }
  })
  .state('app.address-create', {
    url: '/create',
    views: {
      'tab-addresses': {
        templateUrl: 'templates/address-create.html',
        controller: 'AddressCreateCtrl'
      }
    }
  })
  .state('app.address-detail', {
    url: '/address/:addressId',
    views: {
      'tab-addresses': {
        templateUrl: 'templates/address-detail.html',
        controller: 'AddressDetailCtrl'
      }
    }
  })
  .state('app.address-edit', {
    url: '/edit/:addressId',
    views:{
      'tab-addresses':{
        templateUrl: 'templates/address-edit.html',
        controller: 'AddressEditCtrl',
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

})
.run(function($rootScope, $http, $injector,$state, AuthenticationService,ParamService) {
  $injector.get('$http').defaults.transformRequest = function(data, headersGetter) {
    var accessToken=AuthenticationService.getAccessToken();
    if (accessToken){
      headersGetter().Authorization = 'Bearer '+ accessToken;
      console.log('access_token',accessToken);
    }
    if (data) {
      return angular.isObject(data) && String(data) !== '[object File]' ? ParamService.param(data) : data;
    }
  };
});

