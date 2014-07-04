(function($) {
  'use strict';

  $.fn.overflowHiddenCollapser = function(options) {
    // Default options
    options = $.extend({
      hiddenMenuClass: '',
      moreBtSelector: ''
    }, options);

    var $visibleMenu = $(this),
        $hiddenMenu = $('<div>').hide().addClass(options.hiddenMenuClass),
        $moreBt = $(options.moreBtSelector),
        $window = $(window),
        lastWidth = $window.width(),
        timeout;

    // Check if element is visible on menu
    var isVisible = function($element) {
      return $element.position().top < $visibleMenu.height();
    };

    // Get the first hidden item.
    var firstHidden = function() {
      // Ignore the clearfix element we added at the end of hidden menu. All
      // other children are items.
      return $hiddenMenu.children().not(':last-child').first();
    };

    // Get the last visible item.
    var lastVisible = function() {
      // Ignore the more button element. All other children are items.
      return $visibleMenu.children().not($moreBt).last();
    };

    // Move overflowed items in visible menu to hidden menu.
    var collapse = function() {
      while (!isVisible($moreBt) && lastVisible().length) {
        $hiddenMenu.prepend(lastVisible().detach());
      }
    };

    // Move items from hidden to visible menu until there is no more space.
    var expand = function() {
      while (isVisible($moreBt) && firstHidden().length) {
        $moreBt.before(firstHidden().detach());
      }

      if (!isVisible($moreBt) && lastVisible().length) {
        $hiddenMenu.prepend(lastVisible().detach());
      }
    };

    // Collapse or expand items according to menu width.
    var arrangeMenuItems = function() {
      var width = $window.width(),
          $firstHidden;

      // Make sure more button is visible before exapnd / collapse.
      $moreBt.css({display: 'block'});

      if (width > lastWidth) { // Window was enlarged
        expand();
      } else { // Window was reduced
        collapse();
      }

      // If there is only one item left on the hidden menu, try to remove the
      // more button to see if there is enough space for the remaining item.
      if ($hiddenMenu.children().length == 2) { // len 2 = item left + clearfix
        $firstHidden = firstHidden();
        $moreBt.before($firstHidden.detach());

        // Remaining item didn't fit on visible menu
        if (!isVisible($firstHidden)) {
          $hiddenMenu.prepend($firstHidden.detach());
        }
      }

      // If all items are visible, hide more button.
      $moreBt.css({display: firstHidden().length ? 'block' : 'none'});

      lastWidth = width;
    };

    // Create the more button if none were defined
    if (!$moreBt.length) {
      $moreBt = $('<div>').text('...').css({
        'float': 'left',
        'line-height': $visibleMenu.height() + 'px'
      });
      $visibleMenu.append($moreBt);
    }

    // Insert hidden menu after visible menu.
    $visibleMenu.after($hiddenMenu);

    // Append a clearfix element to hidden menu to combat its zero-height
    // issue caused by its floated children.
    $hiddenMenu.append($('<div>').css('clear', 'both'));

    // Make more button toggle hidden menu visibility.
    $moreBt.click(function() {
      if ($hiddenMenu.is(':visible')) {
        $hiddenMenu.slideUp();
      } else {
        $hiddenMenu.slideDown();
      }
    });

    // Throttle window resize events and handle it.
    $(window).resize(function() {
      clearTimeout(timeout);

      timeout = setTimeout(arrangeMenuItems, 300);
    });

    arrangeMenuItems();
  };
})(jQuery);
