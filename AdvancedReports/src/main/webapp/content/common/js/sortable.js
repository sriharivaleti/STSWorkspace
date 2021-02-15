//# sourceURL=Sortable
var Sortable = function(options) {

  var sortableInstance = {
    options : options,
    sortableColumns : options.sortableColumns, //if sortableColumns is null, sort is applied to all columns
    tableSelector : options.tableSelector,
    sortGet : options.sortGet,

    sortColumn : '',
    sortOrder : '',

    refreshSortIcon : function() {
      $(this.tableSelector).find('.sortIndicator').remove();
      if (this.sortColumn && this.sortColumn != "") {
        $(this.tableSelector).find('thead tr.text th').each(function(i, o) {
          var element = $(o);
          var attr = $(o).attr('lang');
          if (attr != null && attr == sortableInstance.sortColumn) {
            var sortObj = {sortOrder: (sortableInstance.sortOrder == 'ascending' ? 'up' : 'down')};
            var sortIconTemplate = _.template($('#sortIcon').html());
            var sortIndicator = sortIconTemplate(sortObj);
            element.append(sortIndicator);
          }
        });
      }
    },

    bindSortEvents : function() {
      $(this.tableSelector).find('thead tr.text th').off().on('click', function(event) {

        var columnName = $(this).attr('lang');
        var sortArray = sortableInstance.sortableColumns;

        if(sortArray == null || sortArray.indexOf(columnName) > -1) {
          if (sortableInstance.sortColumn != columnName) {
            sortableInstance.sortOrder = '';
          }
          if (sortableInstance.sortOrder == '' || sortableInstance.sortOrder == null) {
            sortableInstance.sortOrder = 'ascending';
            sortableInstance.sortColumn = columnName;
          }
          else if (sortableInstance.sortOrder == 'ascending') {
            sortableInstance.sortOrder = 'descending';
            sortableInstance.sortColumn = columnName;
          }
          else {
            sortableInstance.sortOrder = '';
            sortableInstance.sortColumn = '';
          }
  
          Navigation.confirmIfChangesMade(sortableInstance.sortGet);
        }
      });
    },

    clearSort: function() {
      sortableInstance.sortOrder = '';
      sortableInstance.sortColumn = '';
    }
    
  };

  return sortableInstance;
};