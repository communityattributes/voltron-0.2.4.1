window.Voltron = (function(cmd){
  var command = cmd.split('/', 2);
  var module = command[0];
  var method = command[1] || 'initialize';

  if(Voltron.hasModule(module)){
    var mod = Voltron.getModule(module);
    if($.isFunction(mod[method])){
      return mod[method].apply(mod, Array.prototype.slice.call(arguments, 1));
    }else{
      Voltron.debug('error', 'Module %o does not define the method %o', module, method);
    }
  }else{
    Voltron.debug('error', 'Module with name %o does not exist.', module);
  }
  return false;
});

$.extend(Voltron, {
  _config: {},
  _observer: {},
  _modules: {},
  _classes: {},

  _inherited: {
    _name: null,

    on: function(){
      var args = Array.prototype.slice.call(arguments, 0);
      args.push(this);
      Voltron.on.apply(Voltron, args);
      return this;
    },

    name: function(){
      return this._name;
    }
  },

  initialize: function(conf){
    if(!conf) conf = {};
    $.extend(this._config, conf);

    // Try and create a module with the name of the current controller
    if(this.hasModule(this.getConfig('controller'))){
      this.ready(Voltron.getModule, this.getConfig('controller'));
    }
  },

  // When ready, fire the callback function, passing in any additional args
  ready: function(callback, args){
    $(document).ready(function(){
      if(!$.isArray(args)) args = [args];
      callback.apply(Voltron, args);
    });
    return this;
  },

  debug: function(){
    // IE/Edge only expose console when dev tools is open. Check for it's existence before attempting to call log/warn/error/info
    if(this.isDebugging() && console){
      var method = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      console[method].apply(console, args);
    }
    return this;
  },

  getBaseUrl: function(){
    if(!location.origin) location.origin = location.protocol + "//" + location.host;
    return location.origin;
  },

  getPath: function(url){
    if(!url) url = window.location.href;
    return url.replace(this.getBaseUrl(), '');
  },

  // Get a config value, optionally define a default value in the event the config param is not defined
  getConfig: function(key, def){
    var out = this._config;
    if(!key) return out;
    var paths = key.replace(/(^\/+)|(\/+$)/g, '').split('/');

    $.each(paths, function(index, path){
      if(out[path] != undefined){
        out = out[path];
      }else{
        out = def;
        return false;
      }
    });

    return out;
  },

  // Set a config value. Supports xpath syntax to change nested key values
  // i.e. setConfig('a/b/c', true); will change the value of "c" to true
  setConfig: function(key, value){
    var out = this._config;
    var paths = key.replace(/(^\/+)|(\/+$)/g, '').split('/');
    var change = paths.pop();

    $.each(paths, function(index, path){
      if(out[path] != undefined){
        out = out[path];
      }else{
        out = out[path] = {};
      }
    });

    out[change] = value;
    return this;
  },

  // Similar to setConfig, except this will instead treat the config `key` value as an array, and add the value to it
  addConfig: function(key, value){
    if(!this._config[key]) this._config[key] = [];
    this._config[key].push(value);
    return this;
  },

  getAuthToken: function(){
    return this.getConfig('auth_token', '');
  },

  // Are we in debug mode?
  isDebugging: function(){
    return this.getConfig('debug', false);
  },

  isController: function(controllers){
    return $.map([controllers].flatten().compact(), function(c){ return c.toLowerCase(); }).includes(this.getConfig('controller'));
  },

  // Adds one or more event listener callbacks that will be dispatched when the event occurs
  // Optionally with a defined context for what `this` will be in the callback function
  // If not defined it defaults to the core Voltron module, aka - the stuff in this file
  // Example: Voltron.on('event1', 'event2', 'event3', function(observer){}, this);
  // OR: Voltron.on('event1 event2 event3', function(observer){}, this);
  on: function(){
    var args = Array.prototype.slice.call(arguments, 0);
    var events = $.map(args, function(item){ if(typeof item == 'string') return item; });
    var callback = args[events.length];
    var context = args[events.length+1] || Voltron;

    $.each(events, function(index, event){
      if(!Voltron._observer[event]) Voltron._observer[event] = [];
      Voltron._observer[event].push($.proxy(callback, context));
    });
    return this;
  },

  // Dispatch an event, optionally providing some additional params to pass to the event listener callback
  dispatch: function(name, params){
    if(!params) params = {};
    this.debug('info', 'Dispatching %o', name);
    $.each(this._observer[name], function(index, callback){
      if($.isFunction(callback)){
        callback(params);
      }
    });
    return this;
  },

  // Check if a module with the given name has been added
  hasModule: function(id){
    return $.isFunction(this._modules[id.toLowerCase()]);
  },

  // Add a module, specifying the name (id), the module itself (should be an object or a function that returns such)
  // Optionally provide `true`, or an array of controller names as the last argument to auto instantiate when added either
  // all the time (if true), or on the specified controllers
  addModule: function(){
    var id = arguments[0];
    var depends = $.isFunction(arguments[1]) ? [] : arguments[1];
    var module = $.isFunction(arguments[1]) ? arguments[1] : arguments[2];
    var run = $.isFunction(arguments[1]) ? arguments[2] : arguments[3];

    if(!this.hasModule(id)){
      id = $.camelCase(id).replace(/\b[a-z]/g, function(letter){
        return letter.toUpperCase();
      });
      this[id] = module;
      this._modules[id.toLowerCase()] = module;
    }

    // Wait until DOM loaded, then create instances of any modules that should be created
    this.ready(function(id, depends, run){
      if(run === true || ((this.isController(run) || this.isController(id)) && run !== false)){
        if(depends == '*'){
          $.each(Voltron._modules, function(name, module){
            if(name.toLowerCase() != id.toLowerCase()){
              Voltron.getModule(name);
            }
          });
        }else{
          for(var i=0; i<depends.length; i++){
            this.getModule(depends[i]);
          }
        }
        this.getModule(id);
      }
    }, [id, depends, run]);
    return this;
  },

  // Get a module with the given name from the list of modules
  getModule: function(name, args){
    var id = name.toLowerCase();

    name = $.camelCase(name).replace(/\b[a-z]/g, function(letter){
      return letter.toUpperCase();
    });

    if(!args) args = [];
    if(this.hasModule(id)){
      if(!this._classes[id]){
        this._classes[id] = new this._modules[id]($);
        // Add some inherited methods... shortcuts, if you will
        this._classes[id] = $.extend(this._classes[id], this._inherited);
        // Add the name to the module
        this._classes[id]._name = name;
        // Tell the user we've created the module
        this.debug('info', 'Instantiated %o', name);
        // If there is an initialize function, call it, dispatching before/after events
        if($.isFunction(this._classes[id].initialize)){
          Voltron.dispatch('before:module:initialize:' + id, { module: this._classes[id] });
          this._classes[id].initialize.apply(this._classes[id], args);
          Voltron.dispatch('after:module:initialize:' + id, { module: this._classes[id] });
        }
      }
      return this._classes[id];
    }else{
      this.debug('warn', 'Module with name %o does not exist.', name);
    }
    return false;
  }
});

if(typeof V != 'undefined'){
  if(console) console.warn('The window variable %o is already defined, so shortcut to %o will not be defined.', 'V', 'Voltron');
}else{
  window.V = window.Voltron;
}
