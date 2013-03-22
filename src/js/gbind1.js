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


// 
var widgets = {};


//require(["esprima","jquery-1.7.2.min"], function(esp, jq) {
   

var eventhandler = {};

function BaseBindingExpression(){
	this.evaluate = function(scr) {
		return (new Function( "with(this) { return " + scr + "}")).call(this);
	};
}

$(function(){
	
	// implement component binding
	$("*[data-bind-widget]").each(function(idx,node){
		var bindwidget = $(node).data("bind-widget");
		var widgetoptions = $(node).data("bind-widget-options");
		if(bindwidget){
			if(widgets && widgets[bindwidget]){
				var opts = null;
				if(widgetoptions){
					opts = eval("("+widgetoptions+")");
				}
				widgets[bindwidget].create($(node), opts);
			}
		}

	});
	
	
	
	$("*[data-bind]").each(function(idx,node){
		var bvalue = $(node).data("bind");
		
		var parts = bvalue.split(":");
		
		var target = $.trim(parts[0]);
		var exp = $.trim(parts[1]);
		
		// now need to understand the expression
		
		var baseBindingExpression = new BaseBindingExpression();
		baseBindingExpression.expression = exp;
		baseBindingExpression.targetnode = $(node);
		
		baseBindingExpression.targetProperty = target;
		
		baseBindingExpression.execute = function(){
//			 $(this.targetnode).text( this.evaluate(this.expression) );
			 
			var expvalue =  this.evaluate(this.expression);
			
			// condition for 'disabled' (its a spl attribute in html node)
			if(target == "disabled"){
				
				if(expvalue == "disabled" || expvalue == "true" || expvalue == true){
					$(this.targetnode).attr("disabled","disabled");
				}else{
					$(this.targetnode).removeAttr("disabled");
				}
				
			}if(target == "class"){
				// remvoe all class ?
				$(this.targetnode).removeAttr("class");
				
				$(this.targetnode).addClass(expvalue);
			}else{
				var bindwidget = $(this.targetnode).data("bind-widget");
				var skip = false;
				
				if(bindwidget){
					if(widgets && widgets[bindwidget]){
		    			if(widgets[bindwidget][target]){
		    				widgets[bindwidget][target]($(this.targetnode), expvalue);
		    				skip = true;
		    			}else if (widgets[bindwidget].invoke){ // has invoke function ?
		    				widgets[bindwidget].invoke($(this.targetnode), target,  expvalue);
		    				skip = true;
		    			}
		    		}
				}
				
				if(!skip){
					var attr = $(this.targetnode).attr(target);
					if (typeof attr !== 'undefined' && attr !== false) {
							$(this.targetnode).attr(target, expvalue);
					} else {
						// not an attribute, try invoking the function directly on the object
						var fn = $(this.targetnode)[target];
						if (typeof fn !== 'undefined' && fn !== false) {
							$(this.targetnode)[target](expvalue);
						}
					}
				}
				
				
			}
			
		}
		
		
		
		var ast = esprima.parse(exp);
		var a = ast;
		
		$.each(ast.body, function(idx,val){
			var expr = val.expression;
			processExpression(expr, baseBindingExpression);
		});
		baseBindingExpression.execute(); // execute on init
		
	});
	
	function processExpression(expr, baseBindingExpression){
		if(expr.object){// direct object exp, like  'a.value'
			
			  if(expr.object.type == "CallExpression"){
				  $.each(expr.object.arguments, function(idx, val){
					  if(val.object || val.property){
						  processExpression(val, baseBindingExpression);
					  }				  
				  });
			  }else{
				  processObj(expr, baseBindingExpression); 
			  }
			
		  } 
		
		if(expr.property){
			if(expr.property.type == "MemberExpression"){
				if(expr.property.object){
					processExpression(expr.property, baseBindingExpression);
				}
			}
		}
		
		  if(expr.left){ // with left / right operations, like  'a.value + b.value'
			  addOperant(expr.left, baseBindingExpression);
		  }
		  
		  if(expr.right){ // with left / right operations, like  'a.value + b.value'
			  addOperant(expr.right, baseBindingExpression);
		  }
		  
		  if(expr.callee){ // using function 'func(a.value)
			  $.each(expr.arguments, function(idx, val){
				  if(val){
					  processExpression(val, baseBindingExpression);
				  }				  
			  });
			  
			  if(expr.callee.object){
				  processExpression(expr.callee, baseBindingExpression);
			  }
		  }
		  
		  
		  if (expr.type){
			  if(expr.type == "Identifier"){
				  // direct variable use
				  var idname = expr.name;
				  rsltClosure = function(){
					return window[idname];  
				  };
			  }
//			  else if(expr.type == "MemberExpression"){
//				  processObj(expr, baseBindingExpression);
//			  }
		  }
	}
	
	function addOperant(expr, baseBindingExpression){
		//processObj(expr, baseBindingExpression);
		processExpression(expr, baseBindingExpression);
	}
	
	function processObj(expr, baseBindingExpression){
		  var idname = expr.object.name;//identifier name
		  
		  var x = window.hasOwnProperty(idname);
		  
		  var objectReference;
		  var propname = expr.property.name;
		  
		  if( !(eventhandler[idname])){
			  eventhandler[idname] = {};
		  }
		  
		  //data-bind-trigger="keyup"
		  var trigger = "change";
		  
		  var xtrigger = $(baseBindingExpression.targetnode).data("bind-trigger");
		  if (typeof xtrigger !== 'undefined' && xtrigger !== false) {
			  trigger = xtrigger;
		  }else{
			  xtrigger = null;
		  }
		  
		 
		  
		  if(!x){
			  
			  
			  // find if any element with that id exist
			  var itms = $("#"+idname);
			  if(itms.length){// found a dom element
				  
				  var bindwidget = $(itms[0]).data("bind-widget");
				  
				  var dynaObj = function(){
					    var value = $(itms[0]);
					   
					    this.__defineGetter__(propname, function(){
					    	
					    	var returnvalue = null;
					    	
					    	var skip = false;
					    	
					    	// has 'data-bind-widget' definition ?
					    	
					    	
					    	if(bindwidget){
					    		if(widgets && widgets[bindwidget]){
					    			if(widgets[bindwidget][propname]){
					    				returnvalue = widgets[bindwidget][propname](value);
					    				skip = true;
					    			}else if (widgets[bindwidget].invoke){ // has invoke function ?
					    				returnvalue = widgets[bindwidget].invoke(value, propname);
					    				skip = true;
					    			}
					    		}
					    		
					    	}
					    	
					    	if(!skip){
					    		var attr = value.attr(propname);
						    	if (typeof attr !== 'undefined' && attr !== false) {
						    		returnvalue = attr;
								}else{
									returnvalue = value[propname]();
								}
//						        var x = value.attr("value");
					    	}
					    	
					    	
					        return returnvalue;
					    });
				  };
				  var xd = new dynaObj();
				  baseBindingExpression[idname] = xd;
				  
				  
				  if( !(eventhandler[idname][propname])){
					  
					  
					  var changeHandler = function(){
						  $(itms[0]).trigger("propertychange",{property:propname, val:$(itms[0]).val(), obj:$(itms[0])});
					  };
					  
					  
					  // does the widget has custom 'onChange' trigger configured
					  var triggerAdded = false;
					  if(xtrigger == null && (widgets && widgets[bindwidget])){
						  if(widgets[bindwidget]["onChange"]){ // does this has an onchange function
							  widgets[bindwidget].onChange($(itms[0]), changeHandler);
						  }
						  else if(widgets[bindwidget]["trigger"]){
							  trigger = widgets[bindwidget]["trigger"];
						  }
						  
					  }
					  
					  if(!triggerAdded){
						  // detect types
						  $(itms[0]).on(trigger, changeHandler); 
					  }
					  
					  eventhandler[idname][propname] = true;
				  }
				  
				  $(itms[0]).bind("propertychange", function(obj, param){
					  baseBindingExpression.execute();
				  });
			  }
		  }else{
			 
			  
			  baseBindingExpression[idname] = window[idname];
			  
			  
			  if( !(eventhandler[idname][propname])){
				  window[idname]._watch(propname, function(){
					  $( window[idname] ).trigger("propertychange",{property:propname, val:window[idname][propname], obj:window[idname]});
				  });
				  eventhandler[idname][propname] = true;
			  }
			  
			 
			  
			  $( window[idname]).bind("propertychange", function(obj, param){
				  baseBindingExpression.execute();
			  });
			  
			  // two way binding
			  $(baseBindingExpression.targetnode).on(trigger, function(){
				  var txt = $(this).attr(baseBindingExpression.targetProperty);
				  baseBindingExpression[idname][propname] = txt;
			  });
			  
		  }
	}
	
	function _findObject(idname){
		
		var obj = window[idname];
		var oo = eval(idname);
		
		return null;
	}
});




//});
