if(window.navigator === undefined || true) {
  navigator = { };
  console.log('mocking navigator', window.navigator);
}
setTimeout(function () {
  var event = new Event('deviceready');
  document.dispatchEvent(event);
}, 2000);
//declare Camera object
var Camera={ quality : 75,
  destinationType : '',
  sourceType : '',
  allowEdit : true,
  popoverOptions: '',
  DestinationType:'',
  PictureSourceType:'',
  EncodingType:'',
  saveToPhotoAlbum: false };
navigator.contacts = {
  find: function(contactFields, contactSuccess, contactError, contactFindOptions) {
  var contacts = [
    {displayName: 'Eric',
      name: {familyName: 'Capewell',formatted:'Eric Capewell'},
      phoneNumbers: [{type: 'string',value: '05133198238',pref: false},
      {type: 'string',value: '05143198238',pref: false}],
      emails: [{type: 'string',value: 'pgruenbacher@gmail.com',pref: false},
      {type: 'string',value: 'asdf@gmail.com',pref: false}]},
    {displayName: 'Leo',name: {familyName: 'Cai',formatted:'Leo Cai'},
      phoneNumbers: [{type: 'string',value: '03837234343',pref: false},
      {type: 'string', value: '5133198238',pref: true}]},
    {displayName: 'Albert',name: {familyName: 'Cai',formatted:'Albert Cai'}},
    {displayName: 'Harry',
      name: {familyName: 'Barry',formatted:'Mike Capewell'},
      phoneNumbers: [{type: 'string',value: '0722829323123',pref: false}]},
    {displayName: 'Frank',name: {familyName: 'Miller',formatted:'Frank Miller'},
      phoneNumbers: [{type: 'string',value: '03837234343',pref: false},
      {type: 'string', value: '5133198238',pref: true}]},
    {displayName: 'Yelor',
      name: {familyName: 'Belor',formatted:'Yelor Belor'},
      phoneNumbers: [{type: 'string',value: '0722829323123',pref: false}]},
    {displayName: 'Max',name: {familyName: 'Cai',formatted:'Max Pain'},
      phoneNumbers: [{type: 'string',value: '03837234343',pref: false},
      {type: 'string', value: '5133198238',pref: true}]},
    {displayName: 'Silly',name: {familyName: 'Cai',formatted:'Silly Billy'},
      phoneNumbers: [{type: 'string',value: '03837234343',pref: false},
      {type: 'string', value: '5133198238',pref: true}]}

  ];
      contactSuccess(contacts);
  }
};
navigator.camera ={
  getPicture:function(contactSuccess, contactError, contactFindOptions){
    //return file URI
    var result='/images/chloeheader.jpg'
    contactSuccess(result);
  }
}
var ContactFindOptions = function() {
  this.filter = '';
  this.multiple = false;
};