'use strict';
/*jshint unused: vars,camelcase: false */
angular.module('Xcards20.directives.imageContainer', [])
.directive('zoomable',function(){
  function link(scope,elem,attrs){
    scope.zoom=function(){
      console.log('click zoomable');
    };
  }
  return{
    restrict: 'A',
    link: link,
    scope: true
  };
})
.directive('clickOutside',['$document',function($document){
  /* Relies on isActive attribute to know whether to listen for clicking outside element*/
  function link(scope,element,attrs){
    var oldValue;
    var onClick = function (event) {
      var isChild = element.has(event.target).length > 0;
      var isSelf = element[0] === event.target;
      var isInside = isChild || isSelf;
      if (!isInside) {
        scope.$apply(attrs.clickOutside);
        console.log('apply');
      }
    };
    console.log(scope, attrs, attrs.isActive);
    attrs.$observe('isActive', function(newValue) {
      console.log('change',oldValue,newValue);
      if (newValue !== oldValue && newValue === 'true') {
        console.log('bind');
        $document.bind('click', onClick);
      }
      else if (newValue !== oldValue && newValue === 'false') {
        $document.unbind('click', onClick);
      }
      oldValue=newValue;
    });
  }
  return{
    link: link
  };
}])
.directive('resizable',function(){
  function link(scope,elem,attrs){
    var resized=document.createEvent('MutationEvent');
    resized.initEvent('resized',false,false);
    elem[0].addEventListener('resized',function(){
      console.log('listened resized');
    });
    function resize(){
      elem[0].dispatchEvent(resized);
      console.log('dispatch',resized);
    }
    resize();
    elem.on('load', function() {
      var w = (this).naturalWidth,
      h = (this).naturalHeight,
      div = elem.parent(),
      bW=div.clientWidth,
      bH=div.clientHeight;
      if(bW/bH >= w/h){
        elem.removeClass('full-height');
        elem.addClass('full-width');
      }else{
        elem.removeClass('full-height');
        elem.addClass('full-height');
      }
    });
  }
  return{
    restrict: 'A',
    link: link
  };
})
.directive('draggable',function($document){
  function link(scope, element, attrs) {
    var startX = 0, startY = 0, x = 0, y = 0,
    parent=element.parent(),differenceX,differenceY;
    parent.css({
      position: 'relative'
    });
    element.css({
      position: 'absolute'
    });
    element[0].addEventListener('resized',function(){
      console.log('resized');
      containment();
    });
    element.on('load',function(){
      containment();
    });
    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      startX = event.screenX - x;
      startY = event.screenY - y;
      console.log('start',startX,startY,x,y);
      element.removeClass('transition-05s');
      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });
    function containment(){
      differenceX=parent[0].clientWidth-element[0].clientWidth;
      differenceY=parent[0].clientHeight-element[0].clientHeight;
      if(x>0){
        x=0;
        element.addClass('transition-05s');
        element.removeClass('right-contain');
        element.css({left:x+'px'});
      }
      if(y>0){
        y=0;
        element.addClass('transition-05s');
        element.css({top:y+'px'});
      }
      if(x<differenceX){
        x=differenceX;
        console.log('go right');
        element.addClass('transition-05s');
        element.css({left:differenceX+'px'});
      }
      if(y<differenceY){
        y=differenceY;
        element.addClass('transition-05s');
        element.css({top:y+'px'});
      }
    }
    function mousemove(event) {
      y = event.screenY - startY;
      x = event.screenX - startX;
      element.css({
        left: x + 'px',
        top: y + 'px'
      });
    }
    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);
      containment();
    }
  }
  return{
    restrict: 'A',
    link: link
  };
})
.directive('imageContainer',['$ionicActionSheet','$cordovaCamera',function($ionicActionSheet,$cordovaCamera){
  function link(scope,elem,attrs){
    var buttons=[
      {text:'Camera',
      clicked:function(){
        console.log('camera');
        var options = {
          quality : 50,
          destinationType : 'Camera.DestinationType.FILE_URI',
          sourceType : 'Camera.PictureSourceType.CAMERA',
          allowEdit : true,
          encodingType: 'Camera.EncodingType.JPEG',
          saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function(imageURI){
          console.log(imageURI);
          scope.imageURI=imageURI;
        },function(error){
          console.log(error);
        });
      }},
      {text:'Photo Album',
      clicked:function(){
        console.log('photo album');
      }},
      {text:'Facebook,Instagram, etc.',
      clicked:function(){
        console.log('facebook');
      }}
    ];
    scope.zoomOut=function(){
      console.log('zoom out');
      scope.zoomed=false;
    };
    scope.zoom=function(){
      console.log('zoom',attrs);
      scope.zoomed=true;
    };
    scope.choose=function(){
      scope.zoom();
      // Show the action sheet
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: 'choose a picture',
        cancelText: 'Cancel',
        cancel: function() {
          // add cancel code..
        },
        buttonClicked: function(index) {
          buttons[index].clicked();
          return true;
        }
      });
    };
  }
  return{
    restrict: 'E',
    templateUrl:'templates/img-container.html',
    replace:true,
    scope:{
    },
    link: link
  };
}]);