/*eslint-env jquery*/
// Staticman comment replies
// modified from Wordpress https://core.svn.wordpress.org/trunk/wp-includes/js/comment-reply.js
// Released under the GNU General Public License - https://wordpress.org/about/gpl/
// Completly snatched from Michael Rose's MadeMistake blog post https://mademistakes.com/articles/improving-jekyll-static-comments/
$('.reply-to').on('click', function(event) {
  var $this = $(this);

  var commId = $this.data('commId'),
    parentId = $this.data('parentId'),
    respondId = $this.data('respondId'),
    postId = $this.data('postId');

  var div,
    element,
    style,
    cssHidden,
    comm = $('#' + commId)[0],
    respond = $('#' + respondId)[0],
    cancel = $('#cancel-comment-reply-link')[0],
    parent = $('#comment-replying-to')[0],
    post = $('#comment-post-slug')[0];
  var commentForm = $('#' + respondId + ' form')[0];

  if (!comm || !respond || !cancel || !parent || !commentForm) {
    return;
  }

  postId = postId || false;

  if ($('#sm-temp-form-div').length <= 0) {
    div = document.createElement('div');
    div.id = 'sm-temp-form-div';
    div.style.display = 'none';
    respond.parentNode.insertBefore(div, respond);
  }

  comm.parentNode.insertBefore(respond, comm.nextSibling);
  if (post && postId) {
    post.value = postId;
  }
  parent.value = parentId;
  cancel.style.display = '';

  cancel.onclick = function() {
    var temp = $('#' + 'sm-temp-form-div')[0],
      respond = $('#' + respondId)[0];

    if (!temp || !respond) {
      return;
    }

    $('#comment-replying-to').value = null;
    temp.parentNode.insertBefore(respond, temp);
    temp.parentNode.removeChild(temp);
    this.style.display = 'none';
    this.onclick = null;
    return false;
  };

  /*
   * Set initial focus to the first form focusable element.
   * Try/catch used just to avoid errors in IE 7- which return visibility
   * 'inherit' when the visibility value is inherited from an ancestor.
   */
  try {
    var inputs = commentForm.querySelectorAll('input,textarea'),
      ilen = inputs.length;
    for (var i = 0; i < ilen; i++) {
      element = inputs[i];
      cssHidden = false;

      // Modern browsers.
      if ('getComputedStyle' in window) {
        style = window.getComputedStyle(element);
        // IE 8.
      } else if (document.documentElement.currentStyle) {
        style = element.currentStyle;
      }

      /*
       * For display none, do the same thing jQuery does. For visibility,
       * check the element computed style since browsers are already doing
       * the job for us. In fact, the visibility computed style is the actual
       * computed value and already takes into account the element ancestors.
       */
      if (
        (element.offsetWidth <= 0 && element.offsetHeight <= 0) ||
        style.visibility === 'hidden'
      ) {
        cssHidden = true;
      }

      // Skip form elements that are hidden or disabled.
      if ('hidden' === element.type || element.disabled || cssHidden) {
        continue;
      }

      element.focus();
      // Stop after the first focusable element.
      break;
    }
  } catch (er) {}

  event.preventDefault();
});

$('#comment-form').on('submit', function submitForm(event) {
  // Stop form from submitting
  event.preventDefault();

  // Disable to prevent multiple submit
  var $form = $(this);
  var $submitBtn = $form.find('#comment-form-submit'),
    $input_timestamp = $form.find('#comment-timestamp'),
    $input_guid = $form.find('#comment-guid');

  $submitBtn.attr('disabled', 'disabled');
  $input_timestamp.val(new Date().getTime());
  $input_guid.val(
    (function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return (
        s4() +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        s4() +
        s4()
      );
    })()
  );

  var type = $form.attr('method'),
    url = $form.attr('action'),
    data = $form.serialize(),
    contentType = 'application/x-www-form-urlencoded';

  $.ajax({
    type: type,
    url: url,
    data: data,
    contentType: contentType,
    success: function() {
      $form.find('input, textarea').val('');
      $submitBtn.attr('disabled', null);
      $form.find('.info').addClass('hidden');
      $form.find('.info.success').removeClass('hidden');
    },
    error: function() {
      $submitBtn.attr('disabled', null);
      $form.find('.info').addClass('hidden');
      $form.find('.info.fail').removeClass('hidden');
    }
  });
});
