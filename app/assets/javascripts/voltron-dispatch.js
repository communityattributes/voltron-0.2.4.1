//= require voltron-ext
//= require voltron-core

Voltron.addModule('Dispatch', function(){
  var _events = {};

  var Dispatcher = function(context){
    var callbacks = {};

    return {
      add: function(event, callback){
        if(!$.isArray(callbacks[event.toLowerCase()])){
          callbacks[event.toLowerCase()] = [];
        }
        callbacks[event.toLowerCase()].push(callback);
        return context || this;
      },

      dispatch: function(event){
        if($.isArray(callbacks[event.toLowerCase()])){
          for(var i=0; i<callbacks[event.toLowerCase()].length; i++){
            callbacks[event.toLowerCase()][i].apply(context || this, Array.prototype.slice.call(arguments, 1));
          }
        }
        return context || this;
      }
    };
  };

  return {
    addEventWatcher: function(event){
      var args = Array.prototype.slice.call(arguments, 1).flatten().compact();
      _events[event] = args;
      $.each(args, function(index, evt){
        if(['element', 'event', 'data'].includes(evt.toLowerCase())){
          Voltron.debug('error', 'Provided event watcher argument %o is a reserved observer param and will be overridden when the event is dispatched. Consider changing the name of the argument in your call to addEventWatcher for %o', evt, event);
        }
      });
      Voltron.debug('info', 'Added event watcher for %o', event);
      return this.listen();
    },

    listen: function(){
      $('body').off(this.getEvents()).on(this.getEvents(), '[data-dispatch]', this.trigger);
      return this;
    },

    getEvents: function(){
      return $.map(_events, function(val,key){
        return key + '.voltron';
      }).join(' ');
    },

    getHash: function(keys, vals){
      return keys.length === vals.length ? keys.reduce(function(obj, key, index){
        obj[key] = vals[index];
        return obj;
      }, {}) : {};
    },

    getArgumentHash: function(event, args){
      if(_events[event]){
        return this.getHash(_events[event], args);
      }
      return {};
    },

    trigger: function(event){
      if($(this).data('dispatch')){
        var args = Voltron('Dispatch/getArgumentHash', event.type, Array.prototype.slice.call(arguments, 1));
        var params = $.extend(args, { element: this, event: event, data: $(this).data() });

        var dispatches = params.data.dispatch.split(/\s+/);
        var events = {};

        for(var i=0; i<dispatches.length; i++){
          events = $.extend(events, Voltron('Dispatch/getDispatchOptions', dispatches[i], params, this));
        }

        if(events[event.type]){
          var context = events[event.type]['context'];
          var moduleName = events[event.type]['module'];

          if(Voltron.hasModule(moduleName)){
            var module = Voltron.getModule(moduleName);
            var method = Voltron('Dispatch/getDispatchMethod', event.type, context);

            if($.isFunction(module[method])){
              Voltron.debug('info', 'Dispatching callback function %o', module.name() + '/' + method);
              module[method](params);
              return; // Exit so we are not unnecessarily dispatching events
            }else{
              Voltron.debug('warn', 'Module %o was defined but callback function %o does not exist. Continuing with standard dispatcher.', module.name(), method);
            }
          }

          Voltron.dispatch([event.type, context].join(':').toLowerCase(), params);

          if(context != this.tagName.toLowerCase()){
            Voltron.dispatch([event.type, this.tagName].join(':').toLowerCase(), params);
          }
        }
      }
    },

    getDispatchOptions: function(dispatch, params, element){
      var defaultModule = params.data.module || Voltron.getConfig('controller');
      var options = [];

      if((matches = dispatch.match(/^([a-z_\-]+):([a-z\_\-:]+)\/([a-z\_\-]+)/i)) !== null){
        // Match format: "module:action/context"
        options[matches[2]] = { context: matches[3], module: matches[1] };
      }else if((matches = dispatch.match(/^([a-z\_\-:]+)\/([a-z\_\-]+)/i)) !== null){
        // Match format: "action/context", using default module
        options[matches[1]] = { context: matches[2], module: defaultModule };
      }else if((matches = dispatch.match(/^([a-z\_\-:]+)$/i)) !== null){
        // Backward compatibility - Use data-event, element id, or tag name as context,
        // depending on what is available. Use default module
        if(params.data.event){
          options[matches[1]] = { context: params.data.event.toLowerCase(), module: defaultModule };
        }else if(element.id){
          options[matches[1]] = { context: element.id.toLowerCase(), module: defaultModule };
        }else{
          options[matches[1]] = { context: element.tagName.toLowerCase(), module: defaultModule };
        }
      }
      return options;
    },

    getDispatchMethod: function(event, target){
      var method = ['on', event, target].join('_');
      return method.replace(/_([a-z0-9])|\-([a-z0-9])|:([a-z0-9])/ig, function(match){
        return match[1].toUpperCase();
      });
    },

    new: function(context){
      return new Dispatcher(context);
    }
  };
}, true);
