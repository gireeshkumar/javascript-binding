
/*
 * 
 * Widget configuration, map non-standard widget to a standard property binding components
 * 
 * eg,  JQuery UI "DatePicker" doesn't have any direct method (true with most JQuery components)
 *     to get selected date we need to call "$(<selector>).datepicker("getDate") which makes it harder
 *     to do direct property binding, widget configuration will help declare wrapper getter method/property
 *     
 * 
 */


var widgets = {
		accordion0:{
			trigger:'accordionchange'
			,create: function(obj, opts){
				return obj.accordion(opts);
			}
		}
		,accordion:{
			trigger:'accordionchange'
			,create: function(obj, opts){
				return obj.accordion(opts);
			}
			,invoke:function(){
				// arguments[0] = object
				// arguments[1] = property/function
				// arguments[2..]+ = params
				
				if(arguments[1] == "selected"){
					return this.getSetSActiveValue(arguments[0], arguments[2]);
				}
			}
			,getSetSActiveValue:function(obj, val){ // private
				if(val || val == 0){
					return obj.accordion( "option", "active" , val);
				}else{
					var obj = obj.accordion( "option", "active" );
					return obj;
				}
			}
		}
		,tabs : {
			trigger : 'tabsselect'
			,create: function(obj, opts){
				return obj.tabs(opts);
			}
			,selected:function(obj, val){
				if(val || val == 0){
					return obj.tabs( "option", "selected" , val);
				}else{
					return obj.tabs( "option", "selected" );
				}
			}
		}	
		
	,progressbar:{
		trigger:'progressbarchange'
		,create: function(obj, opts){
			return obj.progressbar(opts);
		}
		,value: function(obj, val){
			if(val || val == 0){
				return obj.progressbar( "value", val);
			}else{
				return obj.progressbar( "value");
			}
		}
	}	
		
	,slider : {
		trigger:'slide'
		,create: function(obj, opts){
			return obj.slider(opts);
		}
		,value: function(obj, val){
			if(val || val == 0){
				return obj.slider( "value", val);
			}else{
				return obj.slider( "value");
			}
			
		}
	}
		
	,datepicker : {
		create: function(obj, opts){
			return obj.datepicker(opts);
		}
		,selectedDate : function(obj) {
			return obj.datepicker("getDate");
		}
		,onChange : function(obj, handler) {
			obj.datepicker("option", {
				onSelect : function(dateText, inst) {
					obj.trigger("change");
				}
			});
		}
	}
};