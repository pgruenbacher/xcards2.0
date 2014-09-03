'use strict';
/*jshint unused: vars,camelcase: false */
angular.module('Xcards20.directives', [])
.filter('tel', function () {
  return function (tel) {
    if (!tel) { return ''; }

    var value = tel.toString().trim().replace(/^\-\+/, '');

    if (value.match(/[^0-9]/)) {
      return tel;
    }

    var country, city, number;

    switch (value.length) {
      case 10: // +1PPP####### -> C (PPP) ###-####
        country = 1;
        city = value.slice(0, 3);
        number = value.slice(3);
        break;

      case 11: // +CPPP####### -> CCC (PP) ###-####
        country = value[0];
        city = value.slice(1, 4);
        number = value.slice(4);
        break;

      case 12: // +CCCPP####### -> CCC (PP) ###-####
        country = value.slice(0, 3);
        city = value.slice(3, 5);
        number = value.slice(5);
        break;

      default:
        return tel;
    }

    if (country === 1) {
      country = '';
    }

    number = number.slice(0, 3) + '-' + number.slice(3);

    return (country + '('+city+')'  + number).trim();
  };
})
.filter('selected',function(){
  return function(items){
    var result=[];
    for(var i=0; i<items.length; i++){
      if(items[i].selected){
        result.push(items[i]);
      }
    }
    return result;
  };
})
.filter('verified',function(){
  return function(items){
    var result=[];
    for(var i=0; i<items.length; i++){
      if(items[i].verified){
        result.push(items[i]);
      }
    }
    return result;
  };
})
.filter('byId',function(){
  return function(items){
    var result=[];
    for(var i=0; i<items.length; i++){
      if(items[i].id){
        result.push(items[i].id);
      }
    }
    return result;
  };
})
.directive('passwordMatch',[function(){
  return {
    restrict: 'A',
    scope:true,
    require: 'ngModel',
    link: function (scope, elem , attrs,control) {
      var checker = function () {
        //get the value of the first password
        var e1 = scope.$eval(attrs.ngModel);

        //get the value of the other password 
        var e2 = scope.$eval(attrs.passwordMatch);
        return e1 === e2;
      };
      scope.$watch(checker, function (n) {
        //set the form control to valid if both
        //passwords are the same, else invalid
        control.$setValidity('match', n);
      });
    }
  };
}])
.directive('broadcastSubmit',function(){
  return{
    scope:true,
    controller:function($scope){
      this.broadcastSubmit=function(broadcast){
        $scope.$broadcast(broadcast);
      };
    }
  };
})
.directive('submitForm',function(){
  return{
    restrict:'A',
    require:'^broadcastSubmit',
    link:function(scope,element,attrs,controller){
      element.on('click',function(){
        var broadcast=attrs.submitForm;
        controller.broadcastSubmit(broadcast);
      });
    }
  };
})
.directive('submitOn',function(){
  return{
    scope:true,
    restrict:'A',
    link:function(scope,element,attrs,form){
      var reception=attrs.submitOn;
      scope.$on(reception,function(event){
        angular.element(element).triggerHandler('submit');
      });
    }
  };
})
.directive('onValidSubmit', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    require: '^form',
    restrict: 'A',
    link: function(scope, element, attrs, form) {
      form.$submitted = false;
      var fn = $parse(attrs.onValidSubmit);
      element.on('submit', function(event) {
        $timeout(function(){
          scope.$apply(function() {
            element.addClass('ng-submitted');
            form.$submitted = true;
            $timeout(function(){
              if (form.$valid && !form.$invalid) {
                if (typeof fn === 'function') {
                  fn(scope, {$event: event});
                }
              }
            },100); //100 ms delay to allow for other validator functions
          });
        },100); //100 ms delay for other $apply occurring
      });
    }
  };
}])
.directive('validated', ['$parse', function($parse) {
  return {
    restrict: 'C',
    require: '^form',
    /*jshint loopfunc: true */
    link: function(scope, element, attrs, form) {
      var inputs = element.find('*');
      for(var i = 0; i < inputs.length; i++) {
        (function(input){
          var attributes = input.attributes;
          if (attributes.getNamedItem('ng-model') !== null && attributes.getNamedItem('name') !== null) {
            var field = form[attributes.name.value];
            if (field !== void 0) {
              scope.$watch(function() {
                return form.$submitted + '_' + field.$valid;
              }, function() {
                if (form.$submitted !== true){
                  return null;
                }
                var inp = angular.element(input);
                if (inp.hasClass('ng-invalid')) {
                  element.removeClass('has-success');
                  element.addClass('has-error');
                } else {
                  element.removeClass('has-error').addClass('has-success');
                }
              });
            }
          }
        })(inputs[i]);
      }
    }
  };
}])
.directive('ngMax', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      scope.$watch(attr.ngMax, function(){
        ctrl.$setViewValue(ctrl.$viewValue);
      });
      var minValidator = function(value) {
        var min = scope.$eval(attr.ngMax) || 0;
        if ((value!=='') && value > min) {
          ctrl.$setValidity('ngMax', false);
          return undefined;
        } else {
          ctrl.$setValidity('ngMax', true);
          return value;
        }
      };
      ctrl.$parsers.push(minValidator);
      ctrl.$formatters.push(minValidator);
    }
  };
})
.directive('numbersOnly', function(){
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        // this next if is necessary for when using ng-required on your input. 
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (inputValue === undefined){return null;}
        var transformedInput = inputValue.replace(/[^0-9]/g, '');
        if (transformedInput!==inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });
    }
  };
});
