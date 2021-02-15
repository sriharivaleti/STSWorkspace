/* globals alert */

var CSMath = (function() {
  "use strict";
  
  return {
    
    isDebugMode: false,
    
    /* 
     * rounds fractional part of floating point number
     * rounding mode is half up
     * 
     * @param v is the value
     * @param p is the precision
     * @param isFixed will format fractional part to length of p
     * @param isDebug will cause alert prompts
     */    
    round: function(v, p, isFixed, isDebug) {
      
      isFixed = (isFixed == null) ? false : isFixed;
      isDebug = (isDebug == null) ? false : isDebug;
      
      if (isNaN(v)) { return null; }
      if (p == null || isNaN(p) || parseInt(p) != parseFloat(p)) {
        if (this.isDebugMode) {
          alert('p invalid');
        }        
        return v;
      }     
      
      var temp = v.toString();
      var decimalIndex = temp.indexOf('.');
      var wholeNumber = temp;
      var decimalValue = '';
      if (decimalIndex !== -1) {
        wholeNumber = temp.substr(0, decimalIndex);
        decimalValue = temp.substr(decimalIndex + 1);
      
        if (isDebug) {
          alert("whole: " + wholeNumber);
          alert("0-dec: " + decimalValue);
        }
        
        if (decimalValue.length > p) {
          decimalValue = decimalValue.substr(0, p) + '.' + decimalValue.substr(p);          
        } else if (decimalValue.length < p) {
          var zeros = "";          
          for(var i = 1; i <= (p - decimalValue.length); i++) {
            zeros += "0"; 
          }
          decimalValue = decimalValue + "" + zeros;
        }
        
        if (isDebug) {
          alert("1-dec: " + decimalValue);
        }
        
        decimalValue = Math.round(parseFloat(decimalValue));
        decimalValue = decimalValue / Math.pow(10,p);
        
        if (isDebug) {
          alert("2-dec: " + decimalValue);
        }
        
      } else {
        decimalValue = 0.0;
      }
      
      if (wholeNumber.indexOf('-') > -1) {
      	temp = parseFloat(parseInt(wholeNumber) - parseFloat(decimalValue));
      } else {
      	temp = parseFloat(parseInt(wholeNumber) + parseFloat(decimalValue));
      }
      
      if (isFixed) {
        temp = temp.toFixed(p);
      }
      
      return temp;
      
    },
    
    eof: 0
    
  };
  
})();