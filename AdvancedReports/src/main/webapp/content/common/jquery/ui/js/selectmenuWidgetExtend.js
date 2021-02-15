$.widget( "ui.selectmenu", $.ui.selectmenu, {
    
  open: function(event) {
    this._off(this.button, "keydown");
    this._on(this.button, {keydown: this._buttonEvents.keydown});
    this._on(this.button, {keydown: this.__events.keydown});
    
    this._super(event);
  },
  
  close: function(event){
    var buttonTextItemIndex = this.__getButtonTextItemIndex();
    if (this.__isValidItemIndex(buttonTextItemIndex) && (buttonTextItemIndex !== this.element[0].selectedIndex)){
      this.__selectItemAt(buttonTextItemIndex, event);
    }
    this._super(event);
  },
  
  __events:{
    keydown: function(event){
      if (this.isOpen){
        switch (event.keyCode){
          case $.ui.keyCode.PAGE_UP:
            this.__setButtonTextLabel();
            break;
          case $.ui.keyCode.PAGE_DOWN:
            this.__setButtonTextLabel();
            break;
          case $.ui.keyCode.UP:
            this.__setButtonTextLabel();
            break;
          case $.ui.keyCode.DOWN:
            this.__setButtonTextLabel();
            break;
          case $.ui.keyCode.LEFT:
            this.__setButtonTextLabel();
            var alreadyAtStartIndex = (this.element[0].selectedIndex === 0);
            if (!alreadyAtStartIndex){
              this.__selectItemAt(this.focusIndex, event);
            }
            break;
          case $.ui.keyCode.RIGHT:
            this.__setButtonTextLabel();
            var alreadyAtEndIndex = (this.element[0].selectedIndex === this.menuItems.length - 1);
            if (!alreadyAtEndIndex){
              this.__selectItemAt(this.focusIndex, event);
            }
            break;
          default: 
            this.__setButtonTextLabel();
            break;
        }
      }
    }
  },
  
  __isValidItemIndex: function(index){
    return (0 <= index && index < this.menuItems.length);
  },
  
  __getButtonTextItemIndex: function(){
    var textItemLabel = this.buttonText.text();
    var textItemIndex;
    if (this.items){
      $.each(this.items, function(index, item){
        if (item.label === textItemLabel){
          textItemIndex = index;
        }
      });
    }
    return textItemIndex;
  },
  
  __selectItemAt: function(index, event){
    if (this.__isValidItemIndex(index)){
      this.element[0].selectedIndex = index;
      this._trigger( "change", event );
    }
  },
    
  __setButtonTextLabel: function(){
    var focusedMenuItem = this.menuItems.eq( this.focusIndex );
    this.buttonText.text(focusedMenuItem.text());
  }
});