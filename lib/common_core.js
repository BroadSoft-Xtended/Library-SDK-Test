var id = 'test'
var namespace = 'bdsft_client_instances';
console.debug = function(msg) {console.info(msg);}
expect = require('expect');
extend = require('extend');
chai = require("chai");
chai.use(require("chai-as-promised"));
should = chai.should();
request = require('supertest');
var Factory = require('bdsft-sdk-factory');

module.exports = {
  setupLocalStorage: function(){
    localStorage = {};
    var localStorageMethods = 5;
    localStorage.setItem = function (key, val) {
         this[key] = val + '';
    }
    localStorage.getItem = function (key) {
        return this[key];
    }
    localStorage.key = function (index) {
        return Object.keys(this)[index + localStorageMethods];
    }
    localStorage.removeItem = function (key) {
      delete this[key];
    };
    localStorage.clear = function () {
      for(var i = this.length; i >= 0; i--) {
        var key = this.key(i);
        this.removeItem(key);
      }
    }
    Object.defineProperty(localStorage, 'length', {
        get: function () { 
          return Object.keys(this).length - localStorageMethods; 
        }
    });
  },
  createClientDiv: function() {
    var div = document.createElement("div");
    var div2 = document.createElement("div");
    div.className = 'bdsft-webrtc';
    div2.className = 'client';
    document.body.appendChild(div);
    div.appendChild(div2);
    return div2;
  },
  appendView: function(view) {
    var div2 = this.createClientDiv();
    div2.appendChild(view.view[0]);
  },
  get: function(module, name) {
    return global[namespace][id][module][name]
  },
  createModelAndView: function(name, dependencies, object, args, opts) {
    if(dependencies[name].model) {
      this.create(name, name, {dependencies: dependencies, constructor: dependencies[name].model}, args, opts);
    }
    if(dependencies[name].view) {
      this.create(name+'view', name, {dependencies: dependencies, constructor: dependencies[name].view}, args, opts);
    }
    if(object && dependencies[name][object]){
      this.create(object, name, {dependencies: dependencies, constructor: dependencies[name][object]}, args, opts);
    }
  },

  create: function(name, module, createOptions, args, opts) {
    createOptions = createOptions || {};
    if(!global.hasOwnProperty(name)) {
      Object.defineProperty(global, name, {
        get: function() {
          return global[namespace][id][module][name];
        }
      });
    }

    var options = extend({}, {id: id, namespace: namespace}, createOptions.config);
    options.dependencies = extend({}, createOptions.dependencies || {});
    if(createOptions.lib) {
      options.dependencies[name.replace(/view/i, '')] = createOptions.lib;
    }
    if(global[namespace] && global[namespace][id] && global[namespace][id][module] && global[namespace][id][module][name]) {
      delete global[namespace][id][module][name];
    }
    Factory(options)(createOptions.constructor, undefined, undefined, args, opts);
  },
  isVisible: function(element, visible) {
    // fix caching bug with jsdom and css() by calling _clearMemoizedQueries();
    element[0]._clearMemoizedQueries();
    var isPopup = element.attr('class').indexOf('popup') !== -1;
    expect(element.css('opacity')).toEqual(visible ? "1" : "0");
    expect(element.css('zIndex')).toEqual(visible ? (isPopup ? "100" : "20") : "-1");
  },
  equalCss: function(element, name, value) {
    // fix caching bug with jsdom and css() by calling _clearMemoizedQueries();
    element[0]._clearMemoizedQueries();
    expect(element.css(name)).toEqual(value);
  },

  deleteAllCookies: function() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  val: function(element, value) {
    element.val(value);
    element.trigger('change');
  },

  check: function(element, value) {
    element.prop('checked', value);
    element.trigger('change');
  },

  historyRtcSession: function(uri) {
    return {
      start_time: new Date(),
      end_time: new Date(),
      remote_identity: {
        uri: (uri || "remote")
      },
      direction: "outgoing"
    }
  },

  createLocalMedia: function() {
    return {
      stop: function() {},
      getAudioTracks: function() {
        return [{}];
      }
    };
  }
}