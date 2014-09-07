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
.directive('resizable',['$timeout',function($timeout){
  function link(scope,elem,attrs){
    var resized=document.createEvent('MutationEvent'),
    parent=elem.parent(),
    w,h;
    resized.initEvent('resized',false,false);
    function resize(){
      elem[0].dispatchEvent(resized);
      console.log('dispatch',resized);
    }
    scope.$on('plus',function(){
      var wInt=w*0.05,
      hInt=h*0.05;
      if(!(elem[0].clientWidth>=elem[0].naturalWidth||elem[0].clientHeight>=elem[0].naturalHeight)){
        elem.css({
          width: parseInt(elem[0].clientWidth)+parseInt(wInt)+'px',
          height: parseInt(elem[0].clientHeight)+parseInt(hInt)+'px',
          left: parseInt(elem[0].x)-parseInt(wInt/2)+'px',
          top: parseInt(elem[0].y)-parseInt(hInt/2)+'px'
        });
      }
    });
    scope.$on('minus',function(){
      var wInt=w*0.05;
      var hInt=h*0.05;
      console.log(elem);
      if(!(elem[0].clientWidth<=parent[0].clientWidth||elem[0].clientHeight<=parent[0].clientHeight)){
        elem.css({
          width: parseInt(elem[0].clientWidth)-parseInt(wInt)+'px',
          height: parseInt(elem[0].clientHeight)-parseInt(hInt)+'px',
          left: parseInt(elem[0].x)+parseInt(wInt/2)+'px',
          top: parseInt(elem[0].y)+parseInt(hInt/2)+'px'
        });
      }
    });
    function initializeSize(){
      $timeout(function(){
        w = elem[0].naturalWidth;
        h = elem[0].naturalHeight;
        var bW=parent[0].clientWidth,
        bH=parent[0].clientHeight;
        console.log(w,h,bW,bH);
        if(h/w >= bH/bW){
          console.log('full width');
          elem.css({
            width:bW+'px',
            height:''
          });
          scope.myImage.w=bW;
          scope.myImage.h='';
        }else{
          elem.css({
            width:'',
            height: bH+'px'
          });
          scope.myImage.h=bH;
          scope.myImage.w='';
        }
        resize();
      },500);
    }
    scope.$on('orientation',function(){
      initializeSize();
    });
    elem.on('load', function() {
      initializeSize();
    });
  }
  return{
    restrict: 'A',
    link: link,
    scope:{
      myImage:'='
    }
  };
}])
.directive('draggable',['$timeout','$document',function($timeout,$document){
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
      element.css({left:0+'px'});
      scope.myImage.x=0;
      containment();
    });
    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      if(attrs.draggable === 'true'){
        startX = event.screenX - x;
        startY = event.screenY - y;
        console.log('start',startX,startY,x,y);
        element.removeClass('transition-05s');
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      }
    });
    function containment(){
      console.log(parent,element);
      x=element[0].x;
      y=element[0].y;
      differenceX=parent[0].clientWidth-element[0].clientWidth;
      differenceY=parent[0].clientHeight-element[0].clientHeight;
      console.log('containment',x,y,differenceX,differenceY);
      if(x>0){
        x=0;
        element.addClass('transition-05s');
        element.removeClass('right-contain');
        element.css({left:x+'px'});
        scope.myImage.y=y;
      }
      if(y>0){
        y=0;
        element.addClass('transition-05s');
        element.css({top:y+'px'});
        scope.myImage.y=y;
      }
      if(x<differenceX){
        x=differenceX;
        console.log('go right');
        element.addClass('transition-05s');
        element.css({left:differenceX+'px'});
        scope.myImage.y=y;
      }
      if(y<differenceY){
        y=differenceY;
        element.addClass('transition-05s');
        element.css({top:y+'px'});
        scope.myImage.y=y;
      }
    }
    function mousemove(event) {
      y = event.screenY - startY;
      x = event.screenX - startX;
      element.css({
        left: x + 'px',
        top: y + 'px'
      });
      scope.myImage.x=x;
      scope.myImage.y=y;
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
}])
.directive('maintainAspect',['$timeout',function($timeout){
  function link(scope,elem,attrs){
    var image=elem[0],
    newValues={},oldValues={};
    scope.zoomed=scope.$parent.zoomed;
    scope.$watch('zoomed',function(){
      console.log('zoomed maintain');
      scope.maintainAspect();
    });
    scope.maintainAspect=function(){
      if(image.width !== 0 && image.clientWidth !== 0){
        oldValues.width=image.clientWidth;
        oldValues.height=image.clientHeight;
        $timeout(function(){
          console.log(image.clientWidth,oldValues.width,image.x);
          newValues.x=parseInt(image.clientWidth/oldValues.width*image.x);
          newValues.y=parseInt(image.clientHeight/oldValues.height*image.y);
          elem.css({
            left:newValues.x+'px',
            top:newValues.y+'px'
          });
        },500); //Wait 250 ms for image dimensions to change then, move it. 
      }
    };
  }
  return{
    link:link,
    restrict:'A'
  };
}])
.directive('imageContainer',['$ionicActionSheet','$cordovaCamera',function($ionicActionSheet,$cordovaCamera){
  function link(scope,elem,attrs){
    scope.zoomed=false;
    scope.landscape=true;
    scope.plus=function(){
      scope.$broadcast('plus');
    };
    scope.minus=function(){
      scope.$broadcast('minus');
    };
    scope.rotate=function(){
      scope.landscape = (!scope.landscape);
      scope.$broadcast('orientation');
    };
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
          scope.myImage.fileURI=imageURI;
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
    scope.zoomOut=function(event){
      if(event.target===elem[0]){
        scope.zoomed=false;
        console.log('zoom out',scope,scope.zoomed);
      }
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
      myImage:'=myImage'
    },
    link: link
  };
}]);