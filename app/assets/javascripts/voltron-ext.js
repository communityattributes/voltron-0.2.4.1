// String

String.prototype.trim = function(){
  return $.trim(this);
};

String.prototype.blank = function(){
  return this.trim() == '';
};

String.prototype.startsWith = function(what){
  var re = new RegExp('^' + what.toString());
  return re.test(this.trim());
};

String.prototype.endsWidth = function(what){
  var re = new RegExp(what.toString() + '$');
  return re.test(this.trim());
};

String.prototype.contains = function(what){
  var re = new RegExp(what.toString(), 'i');
  return re.test(this);
};

// Array

Array.prototype.compact = function(){
  for(var i=0; i<this.length; i++){
    if(!this[i] || (typeof this[i].blank == 'function' && this[i].blank())){
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

Array.prototype.includes = function(what){
  if(typeof what == 'object'){
    var re = new RegExp(what);
    for(var i=0; i<this.length; i++){
      if(re.test(this[i].toString())){
        return true;
      }
    }
  }else{
    for(var i=0; i<this.length; i++){
      if(this[i] == what){
        return true;
      }
    }
  }
  return false;
};

Array.prototype.flatten = function(){
  var b = Array.prototype.concat.apply([], this);
  if(b.length != this.length){
    b = b.flatten();
  };

  return b;
};

Array.prototype.blank = function(){
  return this.compact().length == 0;
};

Array.prototype.uniq = function(){
  var u = {}, a = [];
  for(var i=0, l=this.length; i<l; ++i){
    if(u.hasOwnProperty(this[i])){
      continue;
    }
    a.push(this[i]);
    u[this[i]] = 1;
  }
  return a;
};

Array.prototype.first = function(){
  return this[0];
};

Array.prototype.last = function(){
  return this[this.length-1];
};

// Boolean

Boolean.prototype.blank = function(){
  return this === false;
};

// Number

Number.prototype.blank = function(){
  return this <= 0;
};
