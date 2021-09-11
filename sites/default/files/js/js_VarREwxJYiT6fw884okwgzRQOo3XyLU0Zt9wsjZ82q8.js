
(function ($) {
  Drupal.behaviors.LoginToboggan = {
    attach: function (context, settings) {
      $('#toboggan-login', context).once('toggleboggan_setup', function () {
        $(this).hide();
        Drupal.logintoboggan_toggleboggan();
      });
    }
  };

  Drupal.logintoboggan_toggleboggan = function() {
    $("#toboggan-login-link").click(
      function () {
        $("#toboggan-login").slideToggle("fast");
        this.blur();
        return false;
      }
    );
  };
})(jQuery);

;
(function($){
/**
 * To make a form auto submit, all you have to do is 3 things:
 *
 * ctools_add_js('auto-submit');
 *
 * On gadgets you want to auto-submit when changed, add the ctools-auto-submit
 * class. With FAPI, add:
 * @code
 *  '#attributes' => array('class' => array('ctools-auto-submit')),
 * @endcode
 *
 * If you want to have auto-submit for every form element,
 * add the ctools-auto-submit-full-form to the form. With FAPI, add:
 * @code
 *   '#attributes' => array('class' => array('ctools-auto-submit-full-form')),
 * @endcode
 *
 * If you want to exclude a field from the ctool-auto-submit-full-form auto submission,
 * add the class ctools-auto-submit-exclude to the form element. With FAPI, add:
 * @code
 *   '#attributes' => array('class' => array('ctools-auto-submit-exclude')),
 * @endcode
 *
 * Finally, you have to identify which button you want clicked for autosubmit.
 * The behavior of this button will be honored if it's ajaxy or not:
 * @code
 *  '#attributes' => array('class' => array('ctools-use-ajax', 'ctools-auto-submit-click')),
 * @endcode
 *
 * Currently only 'select', 'radio', 'checkbox' and 'textfield' types are supported. We probably
 * could use additional support for HTML5 input types.
 */

Drupal.behaviors.CToolsAutoSubmit = {
  attach: function(context) {
    // 'this' references the form element
    function triggerSubmit (e) {
      if ($.contains(document.body, this)) {
        var $this = $(this);
        if (!$this.hasClass('ctools-ajaxing')) {
          $this.find('.ctools-auto-submit-click').click();
        }
      }
    }

    // the change event bubbles so we only need to bind it to the outer form
    $('form.ctools-auto-submit-full-form', context)
      .add('.ctools-auto-submit', context)
      .filter('form, select, input:not(:text, :submit)')
      .once('ctools-auto-submit')
      .change(function (e) {
        // don't trigger on text change for full-form
        if ($(e.target).is(':not(:text, :submit, .ctools-auto-submit-exclude)')) {
          triggerSubmit.call(e.target.form);
        }
      });

    // e.keyCode: key
    var discardKeyCode = [
      16, // shift
      17, // ctrl
      18, // alt
      20, // caps lock
      33, // page up
      34, // page down
      35, // end
      36, // home
      37, // left arrow
      38, // up arrow
      39, // right arrow
      40, // down arrow
       9, // tab
      13, // enter
      27  // esc
    ];
    // Don't wait for change event on textfields
    $('.ctools-auto-submit-full-form input:text, input:text.ctools-auto-submit', context)
      .filter(':not(.ctools-auto-submit-exclude)')
      .once('ctools-auto-submit', function () {
        // each textinput element has his own timeout
        var timeoutID = 0;
        $(this)
          .bind('keydown keyup', function (e) {
            if ($.inArray(e.keyCode, discardKeyCode) === -1) {
              timeoutID && clearTimeout(timeoutID);
            }
          })
          .keyup(function(e) {
            if ($.inArray(e.keyCode, discardKeyCode) === -1) {
              timeoutID = setTimeout($.proxy(triggerSubmit, this.form), 500);
            }
          })
          .bind('change', function (e) {
            if ($.inArray(e.keyCode, discardKeyCode) === -1) {
              timeoutID = setTimeout($.proxy(triggerSubmit, this.form), 500);
            }
          });
      });
  }
}
})(jQuery);
;
(function ($) {

Drupal.behaviors.facetapi = {
  attach: function(context, settings) {
    // Iterates over facet settings, applies functionality like the "Show more"
    // links for block realm facets.
    // @todo We need some sort of JS API so we don't have to make decisions
    // based on the realm.
    if (settings.facetapi) {
      for (var index in settings.facetapi.facets) {
        if (null != settings.facetapi.facets[index].makeCheckboxes) {
          Drupal.facetapi.makeCheckboxes(settings.facetapi.facets[index].id);
        }
        if (null != settings.facetapi.facets[index].limit) {
          // Applies soft limit to the list.
          Drupal.facetapi.applyLimit(settings.facetapi.facets[index]);
        }
      }
    }
  }
}

/**
 * Class containing functionality for Facet API.
 */
Drupal.facetapi = {}

/**
 * Applies the soft limit to facets in the block realm.
 */
Drupal.facetapi.applyLimit = function(settings) {
  if (settings.limit > 0 && !$('ul#' + settings.id).hasClass('facetapi-processed')) {
    // Only process this code once per page load.
    $('ul#' + settings.id).addClass('facetapi-processed');

    // Ensures our limit is zero-based, hides facets over the limit.
    var limit = settings.limit - 1;
    $('ul#' + settings.id).find('li:gt(' + limit + ')').hide();

    // Adds "Show more" / "Show fewer" links as appropriate.
    $('ul#' + settings.id).filter(function() {
      return $(this).find('li').length > settings.limit;
    }).each(function() {
      $('<a href="#" class="facetapi-limit-link"></a>').text(Drupal.t(settings.showMoreText)).click(function() {
        if ($(this).siblings().find('li:hidden').length > 0) {
          $(this).siblings().find('li:gt(' + limit + ')').slideDown();
          $(this).addClass('open').text(Drupal.t(settings.showFewerText));
        }
        else {
          $(this).siblings().find('li:gt(' + limit + ')').slideUp();
          $(this).removeClass('open').text(Drupal.t(settings.showMoreText));
        }
        return false;
      }).insertAfter($(this));
    });
  }
}

/**
 * Constructor for the facetapi redirect class.
 */
Drupal.facetapi.Redirect = function(href) {
  this.href = href;
}

/**
 * Method to redirect to the stored href.
 */
Drupal.facetapi.Redirect.prototype.gotoHref = function() {
  window.location.href = this.href;
}

/**
 * Turns all facet links into checkboxes.
 * Ensures the facet is disabled if a link is clicked.
 */
Drupal.facetapi.makeCheckboxes = function(facet_id) {
  var $facet = $('#' + facet_id),
      $links = $('a.facetapi-checkbox', $facet);

  // Find all checkbox facet links and give them a checkbox.
  $links.once('facetapi-makeCheckbox').each(Drupal.facetapi.makeCheckbox);
  $links.once('facetapi-disableClick').click(function (e) {
    Drupal.facetapi.disableFacet($facet);
  });
}

/**
 * Disable all facet links and checkboxes in the facet and apply a 'disabled'
 * class.
 */
Drupal.facetapi.disableFacet = function ($facet) {
  // disabling the facets causes trouble when going back to the previous page,
  // so, bypassing this function
	return false;	
  
  $facet.addClass('facetapi-disabled');
  $('a.facetapi-checkbox').click(Drupal.facetapi.preventDefault);
  $('input.facetapi-checkbox', $facet).attr('disabled', true);
}

/**
 * Event listener for easy prevention of event propagation.
 */
Drupal.facetapi.preventDefault = function (e) {
  e.preventDefault();
}

/**
 * Replace an unclick link with a checked checkbox.
 */
Drupal.facetapi.makeCheckbox = function() {
  var $link = $(this),
      active = $link.hasClass('facetapi-active');

  if (!active && !$link.hasClass('facetapi-inactive')) {
    // Not a facet link.
    return;
  }

  // Derive an ID and label for the checkbox based on the associated link.
  // The label is required for accessibility, but it duplicates information
  // in the link itself, so it should only be shown to screen reader users.
  var id = this.id + '--checkbox',
      description = $link.find('.element-invisible').html(),
      label = $('<label class="element-invisible" for="' + id + '">' + description + '</label>'),
      checkbox = $('<input type="checkbox" class="facetapi-checkbox" id="' + id + '" />'),
      // Get the href of the link that is this DOM object.
      href = $link.attr('href'),
      redirect = new Drupal.facetapi.Redirect(href);

  checkbox.click(function (e) {
    Drupal.facetapi.disableFacet($link.parents('ul.facetapi-facetapi-checkbox-links'));
    redirect.gotoHref();
  });

  if (active) {
    checkbox.attr('checked', true);
    // Add the checkbox and label, hide the link.
    $link.before(label).before(checkbox).hide();
  }
  else {
    $link.before(label).before(checkbox);
  }
}

})(jQuery);
;
