/* globals Content */
//# sourceURL=Paging
var Paging = (function($, undefined) {
  "use strict";

  return {
    preferredPageSize: null,
    pageSizeOptions: null,

    create: function(target, onPageFunction, validationFunction, screenId, preferredPageSize) {

      var paging = {
        onPageFunction: onPageFunction,
        validateFunction: validationFunction,
        target: target,
        totalItems: -1,
        setPreferredPageSize: preferredPageSize,
        itemsPerPage: parseInt(Paging.preferredPageSize),
        currentPage: 1,
        screenId: screenId,

        isValidIndexToDisplay: function(i) {
          var min = this.itemsPerPage * (this.currentPage - 1);
          var max = this.itemsPerPage * (this.currentPage);
          return (i >= min && i < max);
        },

        setAllCurrentPages: function(pageNumber) {
          this.currentPage = pageNumber;
        },

        isLoaded:  function() {
          if (this.target != null) {
            return $(this.target).find('div.pagingControls').length > 0;
          }
          return $('div.pagingControls').length > 0;
        },

        resetItemsPerPage: function() {
          $(this.target + ' .itemsPerPage option[value="' + this.itemsPerPage + '"]').prop('selected', true);
        },

        getMaxPage: function() {
          return Math.ceil(this.totalItems / this.itemsPerPage);
        },

        changePage: function(offset) {
          var that = this;
          this.validationFunction(function() {
            if (offset != 0) {
              var maxPage = that.getMaxPage();
              var temp = that.currentPage + offset;
              if (temp >= 1 && temp <= maxPage) {
                that.currentPage += offset;
                if (that.onPageFunction != null) {
                  that.onPageFunction();
                }
                refreshPaging();
              }
            }
          });
        },

        gotoPage: function(page) {
          if (page == 'first') {
            page = 1;
          }
          if (page == 'last') {
            page = this.getMaxPage();
          }
          var offset = page - this.currentPage;
          this.changePage(offset);
        },

        setItemsPerPage: function(itemsPerPage, totalItems) {
          this.itemsPerPage = itemsPerPage;
          this.currentPage = 1;
          if (totalItems != null) {
            this.setTotalItems(totalItems);
          }
          else {
            refreshPaging();
          }
        },

        setTotalItems: function(totalItems) {
          this.totalItems = totalItems;
          refreshPaging();
        },

        getPagingRequest: function() {
          return {pageNumber: this.currentPage, 
                  resourceLink: this.screenId};
        }
      };

      //private methods
      var savePagingPref = function(){
        var pagingObj = {itemId: paging.screenId, pageSize: paging.itemsPerPage};
        var url = '/wfm/screenPref/paging/save';
        $.putJSON(url, pagingObj, function() {
          Paging.preferredPageSize = paging.itemsPerPage;
          if (paging.onPageFunction != null) {
            paging.onPageFunction(true);
          }
        });
      };

      var bindPagingControls = function() {
        $(paging.target + ' .itemsPerPage').selectmenu({
          change: function(event) {
            paging.validationFunction(function() {
              var itemsPerPage = paging.setPreferredPageSize ? Paging.preferredPageSize : parseInt($(paging.target + ' .itemsPerPage option:selected').val());
              paging.setItemsPerPage(itemsPerPage);
              paging.currentPage = 1;
              savePagingPref();
            }, null, paging.resetItemsPerPage, paging.target);
          }
        });

        $('div.pagingControls li').unbind('click.paging');
        $('div.pagingControls li[lang="next"]').click(function() {
          paging.changePage(1);
        });
        $('div.pagingControls li[lang="previous"]').click(function() {
          paging.changePage(-1);
        });
        $('div.pagingControls li[lang="last"]').click(function() {
          paging.gotoPage('last');
        });
        $('div.pagingControls li[lang="first"]').click(function() {
          paging.gotoPage('first');
        });
      };

      var loadPagingControls = function() {
        var str = '';
        str += '<div class="paging" lang="' + paging.target + '">';
        str += '  <div class="pagingControls">';
        str += '    <ul class="pageBack pager">';
        str += '        <li lang="first"><a href="#"><span>' + Content.paging.first + '</span></a></li>';
        str += '        <li lang="previous"><a href="#"><span>' + Content.paging.previous + '</span></a></li>';
        str += '    </ul>';
        str += '    <ul class="pageForward pager">';
        str += '        <li lang="next"><a href="#"><span>' + Content.paging.next + '</span></a></li>';
        str += '        <li lang="last"><a href="#"><span>' + Content.paging.last + '</span></a></li>';
        str += '    </ul>';
        str += '    <ul class="pageNumberContainer pagination pagination-sm">';
        str += '    </ul>';
        str += '  </div>';

        str += '  <div class="pageShowing">';
        str += '     <span lang="showingRecords">' + Content.paging.showingRecords + '</span>';
        str += '     <span id="paging_MinShowing">0</span>';
        str += '     <span lang="toValue">' + Content.paging.toValue + '</span>';
        str += '     <span id="paging_MaxShowing">0</span>';
        str += '     <span lang="of">' + Content.paging.of + '</span>';
        str += '     <span id="paging_TotalShowing">0</span>';
        str += '  </div>';
        str += '  <div class="pageRecordsPerPage">';
        str += '      <span lang="numberOfRecordsPerPage">' + Content.paging.numberOfRecordsPerPage + '</span>';

        str += '      <select class="itemsPerPage">';
        for (var i = 0; i < Paging.pageSizeOptions.length; i++) {
          var pageSize = Paging.pageSizeOptions[i];
          str += '          <option value="' + pageSize + '" ' + (pageSize == paging.itemsPerPage ? 'selected="selected"' : '') + '>' + pageSize + '</option>';
        }
        str += '      </select>';
        str += '  </div>';
        str += '</div>';
        str += '<div style="clear:both"></div>';
        $(paging.target).html(str);
        bindPagingControls();
      };

      var refreshPaging = function() {
        populatePageNumbers();
        var max = paging.getMaxPage();
        var min = 1;
        var curr = paging.currentPage;
        var className = 'disabled';
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="last"]').removeClass(className);
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="next"]').removeClass(className);
        if (curr == max || max == 0) {
          $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="last"]').addClass(className);
          $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="next"]').addClass(className);
        }
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="first"]').removeClass(className);
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="previous"]').removeClass(className);
        if (curr == min) {
          $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="first"]').addClass(className);
          $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.pagingControls li[lang="previous"]').addClass(className);
        }

        var minShowing = ((paging.currentPage - 1) * paging.itemsPerPage) + 1;
        var maxShowing = (paging.currentPage * paging.itemsPerPage);
        var total = paging.totalItems;
        if (maxShowing > total) { maxShowing = total; }
        if (total == 0) { minShowing = 0; }
        $(paging.target + ' div.paging span#paging_MinShowing').html(minShowing);
        $(paging.target + ' div.paging span#paging_MaxShowing').html(maxShowing);
        $(paging.target + ' div.paging span#paging_TotalShowing').html(total);
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('div.paging').disableSelection();
      };

      var populatePageNumbers = function() {
        var currPage = paging.currentPage;
        var min = 1;
        var max = paging.getMaxPage();
        var sideCount = 7;
        var totalPages = sideCount * 2 + 1;
        var numbers = [currPage];
        while (numbers[0] > min && ((numbers.length < (totalPages - (max - currPage)) && max - currPage < sideCount) || currPage - numbers[0] < sideCount)) {
          var value = numbers[0] - 1;
          numbers.splice(0, 0, value);
        }
        while (numbers[numbers.length - 1] < max && ((numbers.length < totalPages && currPage - 1 < sideCount) || numbers[numbers.length - 1] - currPage < sideCount)) {
          var value = numbers[numbers.length - 1] + 1;
          numbers.push(value);
        }
        var str = '';
        if (numbers[0] != min) {
          str += '<li><span class="periods perLeft"> ' +'... ' +'</span></li>';
        }
        $(numbers).each(function(i, o) {
          var isSelected = o == currPage;
          str += '<li ' + (isSelected ? 'class="selected active" ' : '') + ' lang="' + o + '"><span>' + o + '</span></li>';
        });
        if (numbers[numbers.length - 1] != max && numbers[numbers.length - 1] != min) {
          str += '<li><span class="periods perRight"> ' +' ...' +'</span></li>';
        }
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('ul.pageNumberContainer').html(str);
        $(paging.target + ', ' + paging.topTarget + '[lang="' + paging.target + '"]').find('ul.pageNumberContainer li span').click(function(event) {
          paging.gotoPage(parseInt($(event.target).parent().attr('lang')));
        });
      };

      //initialize
      if (!paging.isLoaded()) {
        loadPagingControls();
      }
      else {
        paging.itemsPerPage = parseInt($(target + ' .itemsPerPage option:selected').val());
      }
      paging.setTotalItems(0);
      paging.onPageFunction = onPageFunction;
      if (validationFunction != null) {
        paging.validationFunction = validationFunction;
      }
      else {
        paging.validationFunction = function(successFunction, params, cancelFunction) {
          if (successFunction != null) {
            successFunction();
          }
        };
      }
      return paging;
    },
    
    
    getPagingPref: function(id, successFunction){
      var url = '/wfm/screenPref/paging/resource/'+id;
      $.getJSON(url, {}, function(pagingPrefs) {
        Paging.preferredPageSize = pagingPrefs.preferredPageSize;
        Paging.pageSizeOptions = pagingPrefs.pageSizeOptions;
        successFunction();
      });
    }
    
  };
}) (jQuery);
