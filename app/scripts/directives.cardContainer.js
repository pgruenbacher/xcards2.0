'use strict';
/*jshint unused: vars,camelcase: false */
angular.module('Xcards20.directives.cardContainer', [])
.directive('backCardContainer',[function(){
  var link=function(scope,elem,atrs){
  	scope.expand=false;
    console.log(scope.message);
    scope.zoom=function(){
    	scope.expand=true;
    }
  };
  return{
    restrict:'AE',
    scope: {
      message:'=',
    },
    link:link,
    templateUrl:'templates/partials/back-card-container.html'
  };
}]);