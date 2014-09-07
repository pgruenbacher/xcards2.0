'use strict';
/*jshint unused: vars,camelcase: false */
angular.module('Xcards20.controllers', [])
.controller('DashCtrl', function($scope,$http, UserService,AuthenticationService,TransferService) {
  UserService.authenticate();
  TransferService.all(function(transfers){
    $scope.transfers=transfers;
  });
  $scope.logout=function(){
    AuthenticationService.logout();
  };
})
.controller('ShareCtrl',function($scope, $state,Addresses,$ionicPopup,$ionicModal,TransferService){
  $scope.transfer={recipient:{}};
  $scope.found=false;
  Addresses.all(function(value){
      $scope.addresses=value;
    });
  $scope.saveContact=function(user){
    var verified=TransferService.verifyRecipient(user);
    if(verified.status>1&&(verified.emails>1||verified.numbers>1)){
      $scope.transfer.recipient=user;
      $scope.transfer.recipient.addressee=user.name.formatted;
      $scope.preferenceModal.show();
    }else if(verified.status===1){
      $scope.importModal.hide();
      $scope.save(user);
    }else{
      $scope.showInvalid();
    }
  };
  $scope.showInvalid = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Invalid Contact',
      template: 'Sorry, that contact has no valid contact information (email, number)'
    });
    alertPopup.then(function(res) {
      console.log('Invalid');
    });
  };
  $scope.save=function(user){
    if(typeof user.addressee === 'undefined'){
      user.addressee=user.name.formatted;
    }
    var recipientId=TransferService.saveRecipient(user,false);
    $state.go('app.transfer',{recipientId:recipientId});
  };
  $ionicModal.fromTemplateUrl('templates/createModal.html', function(modal) {
      $scope.createModal = modal;
    },{scope: $scope,animation: 'slide-in-up',focusFirstInput: true});
  $ionicModal.fromTemplateUrl('templates/importModal.html', function(modal) {
      $scope.importModal = modal;
    },{scope: $scope,animation: 'slide-in-up',focusFirstInput: true});
  $ionicModal.fromTemplateUrl('templates/preferenceModal.html', function(modal) {
      $scope.preferenceModal = modal;
    },{scope: $scope,animation: 'slide-in-up',focusFirstInput: true});
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    console.log('destroy modal');
    $scope.preferenceModal.remove();
    $scope.importModal.remove();
    $scope.createModal.remove();
  });
})
.controller('ImportCtrl',function($scope, $cordovaContacts, HelperService,TransferService){
  $cordovaContacts.find({}).then(function(result){
    $scope.groups=HelperService.alphabetize(result,'name.formatted');
    $scope.search=' ';
    console.log($scope.groups);
  },function(result){
    console.log('fail',result);
  });
})
.controller('CreateUserCtrl',function($scope,$state,UserService,TransferService){
  $scope.user={};
  $scope.saveCreate=function(user){
    user.emails=[{value:user.email}];
    $scope.save(user);
    $scope.createModal.hide();
  };
  $scope.loading=false;
  $scope.check=function(email,form){
    console.log('check',email);
    $scope.loading=true;
    form.createForm.$invalid=true;
    UserService.find(email).then(function(response){
      $scope.loading=false;
      console.log(response);
      form.createForm.$invalid=false;
      if(response.status==='found'){
        $scope.found=true;
        form.user.addressee=response.user.first+' '+response.user.last;
      }else{
        $scope.found=false;
      }
    },function(response){
      $scope.loading=false;
      console.log('error',response);
      form.createForm.$invalid=false;
    });
  };
})
.controller('TransferCtrl',function($scope,$state,$stateParams,selectedFilter,UserService,Addresses,
  $ionicPopup, BusyService,TransferService,$ionicModal,byIdFilter)
{
  Addresses.all(function(value){
    $scope.addresses=value;
  });
  $scope.user={credits:UserService.user().credits};
  $scope.transfer=TransferService.get($stateParams.recipientId);
  $scope.transfer.credits=0;
  $scope.transfer.addresses=[];
  $scope.transfer.recipient.email=TransferService.findPrefOrVerified($scope.transfer.recipient.emails);
  $scope.transfer.recipient.phoneNumber=TransferService.findPrefOrVerified($scope.transfer.recipient.phoneNumbers);
  $scope.plus=function(){
    $scope.transfer.credits++;
  };
  $scope.minus=function(){
    $scope.transfer.credits--;
  };
  $scope.confirm=function(){
    var credits=$scope.transfer.credits;
    var addresses=selectedFilter($scope.addresses);
    var recipient=$scope.transfer.recipient;
    /*Take Confirmation*/
    $scope.showPopup(credits,addresses,recipient).then(function(result){
      console.log(result);
      BusyService.show();
      var addressIds=byIdFilter(addresses);
      var recipientInfo={
        addressee:recipient.addressee,
        email:recipient.email,
        phoneNumber:recipient.phoneNumber
      };
      /*Send TransferCreation*/
      TransferService.create({
        credits:credits,
        addresses:addressIds,
        recipient:recipientInfo
      }).then(function(result){
        console.log(result);
        BusyService.hide();
        $state.go('app.dash');
      },function(result){
        console.log('error',result);
        BusyService.hide();
      });
    });
  };
  $scope.showPopup = function(credits,addresses,recipient) {
    $scope.data = {};
    var html='<p>You will be sending:</p>'+
    (credits > 0 ? '<p>'+ credits +' credits</p>':'')+
    (addresses.length > 0 ? '<p>'+addresses.length+
    ' addresses</p>':'')+
    '<p>Click continue to go ahead...</p>';
    // An elaborate, custom popup
    var confirmPopup = $ionicPopup.confirm({
      template: html,
      title: 'Confirm Transfer',
      subTitle: 'Please confirm',
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function(e) {
            return 'hello';
          }
        },
      ]
    });
    return confirmPopup;
  };
  $ionicModal.fromTemplateUrl('templates/addressesModal.html', function(modal) {
      $scope.addressesModal = modal;
    },{scope: $scope,animation: 'slide-in-up',focusFirstInput: true});
})
.controller('PreferenceCtrl',function($scope){
  $scope.data={};
  $scope.continue=function(){
    var emailID=$scope.data.emailID,
    numberID=$scope.data.numberID;
    console.log(emailID,numberID);
    var user=$scope.transfer.recipient;
    if(typeof emailID !== 'undefined'){
      user.emails[emailID].pref=true;
    }
    if(typeof numberID !== 'undefined'){
      user.phoneNumbers[numberID].pref=true;
    }
    $scope.save(user);
    $scope.preferenceModal.hide();
  };
})
.controller('AddressesModalCtrl',function($scope){
  $scope.toggle=function(address){
    address.selected = !address.selected;
  };
})
.controller('AddressesCtrl', function($scope, $state, Addresses) {
  //console.log(addresses);
  //$scope.addresses=addresses; //resolved
  Addresses.all(function(value){
    $scope.addresses=value;
  });
})
.controller('AddressCreateCtrl',function($scope,$state,Addresses,BusyService){
  $scope.address=[];
  $scope.create=function(){
    BusyService.show();
    Addresses.create($scope.address).then(function(response){
      console.log(response);
      BusyService.hide();
      $state.go('app.addresses');
    },function(response){
      BusyService.hide();
      console.log(response);
    });
  };
})
.controller('AddressDetailCtrl', function($scope, $state, $stateParams, Addresses, BusyService) {
  $scope.address=Addresses.get($stateParams.addressId);
  $scope.addressId=$stateParams.addressId;
  $scope.delete=function(addressId){
    BusyService.show();
    Addresses.delete(addressId).then(
    function(data){
      BusyService.hide();
      console.log('delete success');
      $state.go('app.addresses');
    },
    function(data){
      BusyService.hide();
      console.log('delete fail');
    });
  };
})
.controller('AddressEditCtrl', function($scope, $stateParams, $state, Addresses, BusyService){
  $scope.address=Addresses.copy($stateParams.addressId);
  $scope.addressId=$stateParams.addressId;
  $scope.edit=function(index){
    BusyService.show();
    if(! angular.equals($scope.addressClone,$scope.address)){
      Addresses.put($scope.address).then(function(response){
        console.log(response);
        BusyService.hide();
        $state.go('app.addresses');
      },function(response){
        BusyService.hide();
        console.log(response);
      });
    }
  };
})

.controller('CardCtrl', function($scope) {

})
.controller('SingleCtrl',function($scope,ImagesService,$state){
  $scope.singleImage={}; //Will be updated by image-container-directiv
  $scope.continue=function(){
    console.log($scope.singleImage);
    var  singleImage=$scope.singleImage;
    if(singleImage.w>0 || singleImage.h>0){
      ImagesService.saveTemp(singleImage);
      $state.go('app.build-message');
    }
  };
})
.controller('MessageCtrl',function($scope,ImagesService){

})
/*Controller for all of app to detect http authourization*/
.controller('AppCtrl', function($scope, $state, $ionicModal) {
   
  $ionicModal.fromTemplateUrl('templates/login.html', function(modal) {
      $scope.loginModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }
  );
  //Be sure to cleanup the modal by removing it from the DOM
  $scope.$on('$destroy', function() {
    $scope.loginModal.remove();
  });
  /*Register Modal*/
  $ionicModal.fromTemplateUrl('templates/register.html', function(modal) {
      $scope.registerModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }
  );
  //Be sure to cleanup the modal by removing it from the DOM
  $scope.$on('$destroy', function() {
    $scope.registerModal.remove();
  });

})
/*Login Controller */
.controller('LoginCtrl', function($scope, $http, $ionicModal, $state, Facebook, PERMISSIONS, FacebookService, AuthenticationService, localStorageService) {
  $scope.message = '';
  // Define user empty data :/
  $scope.user = {};
      
  // Defining user logged status
  $scope.logged = false;
  $scope.login = function(user) {
    AuthenticationService.login(user);
  };
  $scope.facebook = function() {
    Facebook.getLoginStatus(function(response) {
      console.log('facebook');
      if (response.status === 'connected') {
        $scope.logged = true;
        console.log(response);
        $scope.fbLoginUser();
      }
      else{
        $scope.fbLogin();
      }
    },true);
  };
  //Include permissions object as second parameter
  $scope.fbLogin = function() {
    Facebook.login(function(response) {
      if (response.status === 'connected') {
        $scope.logged = true;
        $scope.fbLoginUser();
      }
    },PERMISSIONS.FbPermissions);
  };
  $scope.fbLoginUser= function(){
    FacebookService.me().then(function(response){
      var user=response;
      console.log('user',user);
      user.facebook_id=user.id;
      user.password='verified';
      AuthenticationService.saveAuthentication(user);
      AuthenticationService.login(user);
    });
  };
  $scope.register= function(){
    $scope.registerModal.show();
  };
  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    $scope.user=AuthenticationService.getAuthentication();
    if($scope.user.email && $scope.user.password){
      AuthenticationService.login($scope.user);
    }
    $scope.loginModal.show();
  });
 
  $scope.$on('event:auth-loginConfirmed', function() {
    $scope.email = null;
    $scope.password = null;
    $scope.loginModal.hide();
    $scope.registerModal.hide();
  });
  
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = 'Login failed';
    console.log(status);
    if (status === 400){
      error = 'Invalid email or Password. Did you activate the account? Check email';
    }
    $scope.message = error;
  });
 
  $scope.$on('event:auth-logout-complete', function() {
    $state.go('app.dash', {}, {reload: true, inherit: false});
  });
})
.controller('RegisterCtrl',function($scope,$state, $ionicPopup, AuthenticationService, UserService, BusyService, localStorageService){
  $scope.register=function(user,form){
    $scope.submitted=true;
    if(! form.$invalid){
      BusyService.show();
      UserService.create(user).then(function(response){
        console.log(response);
        BusyService.hide();
        if(response.error){
          $scope.message=response.error.email;
        }else{
          if(response.user){
            console.log(response.user);
            var newUser=response.user;
            newUser.password=user.password;
            console.log('newuser',newUser);
            localStorageService.set('user',newUser);
            var alertPopup = $ionicPopup.alert({
              title: 'Before you continue...',
              template: 'An email hase been sent to validate your account, please return after you have activated your account'
            });
            alertPopup.then(function(res){
              console.log('state');
              $scope.loginModal.hide();
              $scope.registerModal.hide();
              $state.go('app.dash');
            },function(res){
              console.log('fail');
            });
          }
        }
      },function(response){
        BusyService.hide();
        console.log('error',response);
      });
    }
  };
});