var Utils = (function(){
  "use strict";
  
  return {
    numOrdA: numOrdA,
    sortByCodeType: sortByCodeType,
    isNumeric: isNumeric,
    isArray: isArray,
    isObject: isObject,
    isString: isString,
    isFunction: isFunction,
    isOperator: isOperator,
    stringEndsWith: stringEndsWith,
    unique: unique,
    containsProperty: containsProperty
  };
  
  function numOrdA(a, b){ return (a-b); }

  function sortByCodeType(a, b, aDate, bDate) {
    
    if (a == 8) {
      a = 0.25;
    } else if (a == 7) {
      a = 0.5;
    }
    if (b == 8) {
      b = 0.25;
    } else if (b == 7) {
      b = 0.5;
    }
    
    if(a==b && aDate != null && bDate != null){
      if(aDate < bDate){
        a = a - 0.01;
      }
      if(bDate < aDate){
        b = b - 0.01;
      }
    }
      
    return a - b;
  }

  function isNumeric(value) {
    return !isNaN(value);
  }
  
  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]'; 
  }
  
  function isObject(value) {
    return (value != null) && (typeof value === 'object');
  }
  
  function isString(value) {
    return typeof value === 'string';
  }
  
  function isFunction(value) {
    return typeof value === 'function';
  }

  function isOperator(v) {
    var x = (v == '<' || v == '>' || v == '<=' || v == '>=' || v == '=');
    return x;
  }

  function stringEndsWith(haystack, needle) {
    var isValid = haystack.length >= needle.length && haystack.indexOf(needle) >= 0; 
    isValid = isValid && haystack.substr(haystack.length - needle.length) === needle;
    return isValid;
  }
  
  function unique(array) {
    var r = [];
    o:for(var i = 0, n = array.length; i < n; i++) {
      for(var x = 0, y = r.length; x < y; x++)  {
        if(r[x]==array[i]) { continue o; }
      }
      r[r.length] = array[i];
    }
    return r;
  }
  
  //written because _.findWhere does a strict match.
  function containsProperty(objCollection, propertyObj) {
    //only matches one property for now
    var key = _.keys(propertyObj)[0];
    
    for (var i = 0; i < objCollection.length; i++) { 
      if (objCollection[i][key] == propertyObj[key]) { 
        return true;
      }
    }
    return false;
  }
  
}());

