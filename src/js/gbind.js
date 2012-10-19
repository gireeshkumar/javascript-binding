/**
 * G's JavaScript data binding library
 */

// object.watch
if (!Object.prototype._watch) {
	Object.prototype._watch = function(prop, handler) {
		var val = this[prop], getter = function() {
			return val;
		}, setter = function(newval) {
			val = newval;
			return val = handler.call(this, prop, val, newval);
		};
		if (delete this[prop]) { // can't watch constants
			if (Object.defineProperty) { // ECMAScript 5
				Object.defineProperty(this, prop, {
					get : getter,
					set : setter
				});
			} else if (Object.prototype.__defineGetter__
					&& Object.prototype.__defineSetter__) // legacy
			{
				Object.prototype.__defineGetter__.call(this, prop, getter);
				Object.prototype.__defineSetter__.call(this, prop, setter);
			}
		}
	};
}

// object.unwatch
if (!Object.prototype._unwatch) {
	Object.prototype._unwatch = function(prop) {
		var val = this[prop];
		delete this[prop]; // remove accessors
		this[prop] = val;
	};
}

var gbind = {

	listeners : {},
	init : function(){
		$( this ).bind( "onvalchange", function(obj,param){
			
			
			var arr = this.listeners[param.fqn];
			if(arr != null){
				$.each(arr, function(idx,val){
					val(param.value);
				});
			}
		});
	}
		
	,bindable : function(name, instance) {
		this[name] = instance;
		//alert("Make it bindable : " + instance);
		var curinstance = this;
		
		$.each(instance, function(key, value) { 
			if(key != "_watch" && key != "_unwatch"){
				 instance._watch(key, function(prop, val, newval){
						$( curinstance ).trigger("onvalchange",{fqn:name+"."+key,property:prop, value:newval});
						return newval;
					});
			}
			 
		});
		
		
		
	}
	,addListner : function(property, handler){
		var arr = this.listeners[property];
		if(arr == null){
			arr = new Array();
		}
		arr[arr.length] = handler;
		this.listeners[property] = arr;
	}
	,updateBindable : function(value, target){
		this.setData(target, value, this);
		var iii = this.model1.firstName;
		var ij = iii;
	}
	,setData : function(key,val,obj) {
		  //if (!obj) obj = data; //outside (non-recursive) call, use "data" as our base object
		  var ka = key.split(/\./); //split the key by the dots
		  var ka0 = ka[0];
		  if (ka.length < 2) { 
		    obj[ka0] = val; //only one part (no dots) in key, just set value
		  } else {
		    if (!obj[ka0]){
		    	obj[ka0] = {}; //create our "new" base obj if it doesn't exist
		    }
		    var key = ka.shift();
		    obj = obj[key]; //remove the new "base" obj from string array, and hold actual object for recursive call
		    this.setData(ka.join("."),val,obj); //join the remaining parts back up with dots, and recursively set data on our new "base" obj
		  }    
		}
	,bind : function(node, bvalue){
		// contains 'trigger' ?
		
		var trigger = "change";
		
		var parts = bvalue.split(",");
		for(var i = 0; i < parts.length; i++){
			var bnds = $.trim(parts[i]).split(":");
			if(bnds[0] == "trigger"){
				trigger = bnds[1];
				break;
			}
		}
		
		for(var i = 0; i < parts.length; i++){
			var bnds = $.trim(parts[i]).split(":");
			if(bnds != null && bnds.length > 0){
				if(bnds[0] == "trigger"){
					continue;
				}
				
				this.bindNode(node, trigger, bnds[0], bnds[1]);
				
			}
		}
	}
	,bindNode : function(node, trigger, source, target){
		target = $.trim(target);
		$(node).on(trigger, function(evt){
			var txt = $(this).attr(source);
			gbind.updateBindable(txt,target);
		});
		
		gbind.addListner(target, function(paramval){
			var attr = $(node).attr(source);
			if (typeof attr !== 'undefined' && attr !== false) {
				if($(node).attr(source) != paramval){
					$(node).attr(source, paramval);
				}
			} else {
				// not an attribute, try invoking the function directly on the object
				$(node)[source](paramval);
			}				
		});
	}
	
	
	// watch
	// model - name of the model, used in "bindable"
	// properties - array of properties to watch
	// callback handler  (function (model, property))
	,watch : function(model, properties, handler){
		$.each(properties, function(idx, prop){
			
			gbind.addListner(model+"."+prop, function(pval){
				handler(this[model], prop, pval);
			});
			
		});
	}
};




$(function(){
	
	gbind.init();
	
	$("*[data-bind]").each(function(idx,node){
		var bvalue = $(node).data("bind");
		if(bvalue != null){
			gbind.bind(node, bvalue);
		}
	});
});