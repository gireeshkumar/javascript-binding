javascript-binding
==================

Flex like data binding for javascript

Usage
-----
    <p>Number 1 : <input id="a" value="10"/></p>
    <p>Number 2 : <input id="b" value="0"/></p>
  
    <h3>Result : <span data-bind="text: parseInt( a.value ) + parseInt( b.value )" ></span></h3>
    
CSS binding

    <button  data-bind="disabled: a.value < 50 " >Work</button>
    
-
    <button  data-bind="disabled: (parseInt( a.value ) + parseInt( b.value )) < 50 " >Total &gt; 50</button>
    
http://jsfiddle.net/pBGPL/2/
    
Using custom trigger

    var model1 = {
         num1 : 0
        ,num2  : 0
        ,rslt  : 0
    };

    <p>Number 1 : <input data-bind="value: model1.num1, trigger:keyup" id="a"/></p>
    <p>Number 2 : <input data-bind="value: model1.num2, trigger:keyup" id="b"/></p>
    
    <h2>Result : <span data-bind="text: model1.rslt"> </span></h2>
    <h3>Result : <span data-bind="text: (a.value + b.value)"></span></h3>


Apply custom style classes

http://jsfiddle.net/YQF4t/3/

With JQuery UI object - Accordion

http://jsfiddle.net/Z3sha/1/
    
With JQUI progress bar with live update

http://jsfiddle.net/Fp8gF/


## Requirements
* [jQuery](http://jquery.com/)
* [EsprimaJS] (http://esprima.org)
