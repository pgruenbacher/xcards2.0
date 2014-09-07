'use strict';
/*jshint unused: vars, camelcase: false */
angular.module('Xcards20.services', ['http-auth-interceptor'])
/**
 * A simple example service that returns some data.
 */
.factory('FacebookService',function(Facebook){
  return{
    me:function(){
      return Facebook.api('/me', function(response) {
      });
    }
  };
})
.factory('ImagesService',function(Restangular,CacheAndCall,localStorageService){
  var imageAPI=Restangular.all('imageAPI'),
  tempImages=[];
  return{
    all:function(callback){
      CacheAndCall.getCacheList(imageAPI,{},function(response){
        console.log(response);
        callback(response);
      });
    },
    get:function(){

    },
    saveTemp:function(image){
      tempImages.push({
        x:image.x,
        y:image.y,
        w:image.w,
        h:image.h,
        fileURI:image.fileURI
      });
      console.log(tempImages);
    }
  };
})
.factory('TransferService',function(Restangular,UserService,CacheAndCall){
  //transfers structure
  /*var transfers=[{
    recipient:null,
    credits:null,
    addresses:null,
  }];*/
  var transfers=[];
  var transferAPI=Restangular.all('transferAPI');
  return {
    all:function(callback){
      CacheAndCall.getCacheList(transferAPI, {}, function (value) {
        console.log(value);
        callback(value);
      });
    },
    get:function(id){
      return transfers[id];
    },
    create:function(transfer){
      return transferAPI.post(transfer);
    },
    check:function(user){
      if(user.email){
        return UserService.find(user.email);
      }
    },
    saveRecipient:function(recipient,optionalId){
      optionalId=optionalId || false;
      if(optionalId){
        transfers[optionalId].recipient=recipient;
        return optionalId;
      }
      return transfers.push({recipient:recipient})-1; //need to return index not length
    },
    verifyRecipient:function(recipient){
      var valid =false, i=0,
        emails=0, numbers=0,
        phoneRegex=/^(?:\([2-9]\d{2}\)\ ?|[2-9]\d{2}(?:\-?|\ ?))[2-9]\d{2}[- ]?\d{4}$/,
        emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(typeof recipient.emails !== 'undefined'){
        for(i=0; i<recipient.emails.length; i++){
          if(emailRegex.test(recipient.emails[i].value)){
            recipient.emails[i].verified=true;
            valid++;
            emails++;
          }
        }
      }
      if(typeof recipient.phoneNumbers !== 'undefined'){
        for(i=0; i<recipient.phoneNumbers.length; i++){
          if(phoneRegex.test(recipient.phoneNumbers[i].value)){
            console.log('phoneRegex',true,recipient.phoneNumbers[i].value);
            recipient.phoneNumbers[i].verified=true;
            console.log(recipient.phoneNumbers[i].value);
            valid++;
            numbers++;
          }
        }
      }
      return {status:valid,numbers:numbers,emails:emails};
    },
    findPreferred: function(path){
      if(typeof path !== 'undefined'){
        for(var i=0; i<path.length; i++){
          if(path[i].pref){
            return path[i].value;
          }
        }
      }
      return null;
    },
    findVerified:function(path){
      if(typeof path !== 'undefined'){
        for(var i=0; i<path.length; i++){
          if(path[i].verified){
            return path[i].value;
          }
        }
      }
      return null;
    },
    findPrefOrVerified:function(path){
      var self=this;
      var value=self.findPreferred(path)||self.findVerified(path);
      return value;
    }
  };
})
.factory('UserService',function($http,Restangular,localStorageService){
  var userAPI=Restangular.all('userAPI');
  return{
    authenticate:function(){
      Restangular.all('user/auth').getList().then(function(response){
        localStorageService.set('AuthUser',response[0]);
        return response[0];
      },function(response){
        console.log(response);
      });
    },
    user:function(){
      return localStorageService.get('AuthUser');
    },
    get:function(id){
      return userAPI.get(id);
    },
    find:function(email){
      return userAPI.get('find', {'filter':email, 'where':'email'});
    },
    create: function(user){
      return userAPI.post(user);
    }
  };
})
.factory('Addresses', function($http,API,Restangular,CacheAndCall) {
  var addresses=[];
  var addressesAPI=Restangular.all('addressesAPI');
  // Might use a resource here that returns a JSON array
  return {
    all: function(callback){
      CacheAndCall.getCacheList(Restangular.all('addressesAPI'), {}, function (value) {
        addresses=value;
        callback(value);
      });
    },
    create:function(address){
      return addressesAPI.post(address);
    },
    get: function(addressId) {
      console.log(addressId, 'addressId',addresses);
      return addresses[addressId];
    },
    copy: function(addressId){
      console.log(addresses[addressId]);
      return Restangular.copy(addresses[addressId]);
    },
    put: function(address){
      return address.put();
    },
    delete: function(addressId){
      return $http.delete(API.domain+'/mobile/addressesAPI/'+addresses[addressId].id)
      .then(function(addressId){
        addresses.splice(addressId,1);
      });
    }
  };
})
.factory('AuthenticationService', function($rootScope, $http, authService, Restangular, $state, localStorageService) {
  return {
    login: function(user) {
      var self=this;
      console.log('login');
      var tokenRequest=Restangular.oneUrl('oauth/access_token');
      tokenRequest.get({
        'username':user.email,
        'password':user.password,
        'grant_type':'password',
        'scope':'test_scope',
        'client_id':'123456',
        'client_secret':'123456'
      }).then(
      function(data,status,headers,config){
        console.log('login response',data);
        if(self.saveAuthentication(user)){
          console.log('saved user, saved authentication token');
        }else{
          console.log('failed to save user');
        }
        localStorageService.set('access_token',data.access_token);
          // Step 1
        // Need to inform the http-auth-interceptor that
        // the user has logged in successfully.  To do this, we pass in a function that
        // will configure the request headers with the authorization token so
        // previously failed requests(aka with status == 401) will be resent with the
        // authorization token placed in the header
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          config.headers.Authorization = data.access_token;
          return config;
        });
        $state.go('app.dash');
      },
      function(data){
        console.log('error',data);
        $rootScope.$broadcast('event:auth-login-failed', data.status);
      });
    },
    logout: function(user) {
      if(localStorageService.remove('access_token')&&localStorageService.remove('authentication')){
        $rootScope.$broadcast('event:auth-logout-complete');
      }
    },
    loginCancelled: function() {
      authService.loginCancelled();
    },
    saveAuthentication:function(authentication){
      var stored=localStorageService.set('authentication',authentication);
      if(stored){
        return true;
      }else{
        return false;
      }
    },
    getAuthentication:function(){
      var authentication=localStorageService.get('authentication');
      if(authentication){
        return authentication;
      }else{
        return false;
      }
    },
    getAccessToken:function(){
      return localStorageService.get('access_token');
    }

  };
})
.factory('ParamService',function($filter){
  /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
  return {
    fixedEncodeURI:function (str) {
      return encodeURIComponent(str).replace(/%5B/g, '%7B').replace(/%5D/g, '%7D');
    },
    param : function(obj) {
      var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      var self=this;
      console.log('transform request',obj,query);
      for(name in obj) {
        value = obj[name];
        if(value instanceof Array) {
          for(i=0; i<value.length; ++i) {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            if(innerObj[fullSubName] !== undefined && innerObj[fullSubName] !== null){
              query += self.param(innerObj) + '&';
            }
          }
        }
        else if(value instanceof Object) {
          for(subName in value) {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            if(innerObj[fullSubName] !== undefined && innerObj[fullSubName] !== null){
              query += self.param(innerObj) + '&';
            }
          }
        }
        else if(value !== undefined && value !== null){
          query += self.fixedEncodeURI(name) + '=' + self.fixedEncodeURI(value) + '&';
        }
      }
      console.log('transform completed',query);
      return query.length ? query.substr(0, query.length - 1) : query;
    }
  };
})
.factory('CacheAndCall',function($q){
  //See https://github.com/mgonto/restangular/issues/349 for reference
  return {
    getCache: function (type, restangularObj, options, cacheCallback) {
      var cacheKey = restangularObj.getRestangularUrl() + JSON.stringify(options);
      var promise;
      if (type === 'one') {
        promise = restangularObj.get(options);
      }
      else {
        promise = restangularObj.getList(options);
      }
      var deferred = $q.defer();
      promise.then(function(data) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        cacheCallback(data);
        deferred.resolve(data);
      }, function(data) {
        deferred.reject(data);
      });

      var item = localStorage.getItem(cacheKey);
      if (item) {
        cacheCallback(JSON.parse(item));
      }
      return deferred.promise;
    },

    getCacheOne: function(restangularObj, options, cacheCallback) {
      var self=this;
      return self.getCache('one', restangularObj, options, cacheCallback);
    },

    getCacheList: function(restangularObj, options, cacheCallback) {
      var self=this;
      return self.getCache('list', restangularObj, options, cacheCallback);
    }
  };
})
.factory('BusyService', ['$ionicLoading', function($ionicLoading) {
  return {
    show: function(content) {
      $ionicLoading.show({
        template: '<span class="ion-loading-c"></span> Loading...',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    },
    hide: function() {
      $ionicLoading.hide();
    }
  };
}])
.factory('HelperService', function(){
  return{
    alphabetize: function(input,item) {
      var self=this,
      group,
      groupValue='',
      groups=[];
      self.sortBy(input,item);
      for(var i = 0; i < input.length; i++){
        var contact = input[i];
        if(self.deepFind(contact,item).substring(0,1) !== groupValue){
          group = {
            label : self.deepFind(contact,item).substring(0,1),
            contacts : []
          };
          groupValue = self.deepFind(contact,item).substring(0,1);
          groups.push(group);
        }
        group.contacts.push(contact);
      }
      return groups;
    },
    deepFind:function (obj, path){
      var paths = path.split('.'),
          current = obj,
          i;

      for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
          return undefined;
        } else {
          current = current[paths[i]];
        }
      }
      return current;
    },
    sortBy: function(collection,name){
      var self=this;
      collection.sort(
        function( a, b ) {
          if ( self.deepFind(a,name) <= self.deepFind(b,name) ) {
            return( -1 );
          }
          return( 1 );
        }
      );
    }
  };
});
