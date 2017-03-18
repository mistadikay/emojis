/*
 * Emoji cheat sheet
 */
$(document).ready(function() {
  try {
    if(document.flashtest && document.flashtest.PercentLoaded()>=0){
      // Flash was able to load the test swf and is working
      initZeroClipboard();
    } else {
      initJsClipboard();
    }
  } catch (e) {
    initJsClipboard();
  }

  function initZeroClipboard(){
    ZeroClipboard.config({
      forceHandCursor: true,
      hoverClass: "hover"
    });
    var clipboardclient = new ZeroClipboard();

    clipboardclient.on('ready', function( readyEvent ) {
      $('ul').on('mouseover', 'div', function() {
        try {
          clipboardclient.clip(this);
        } catch(e) { }
      });

      clipboardclient.on('copy', function(evt) {
        var clipboard = evt.clipboardData;
        clipboard.setData("text/plain", $(evt.target).text().trim());
      });

      clipboardclient.on('aftercopy', function(evt) {
        var highlightedElement = evt.target;
        $(highlightedElement).addClass('copied');
        setTimeout(function(){
          $(highlightedElement).removeClass('copied');
        },800);

        _gaq.push(['_trackEvent', 'Emojis', 'Copy', text]);
      });
    });

    clipboardclient.on( 'error', function(event) {
      ZeroClipboard.destroy();
      initJsClipboard();
    });
  }

  var jsClipboardSupported = true; // we can't check if this is true unless the user tries once
  function initJsClipboard() {
    $('ul').on('click', 'div', function() {
      try {
        if(jsClipboardSupported) {
          var selection = getSelection();
          selection.removeAllRanges();

          var range = document.createRange();
          range.selectNodeContents(this);
          selection.addRange(range);

          var highlightedElement = $(this);
          if(document.execCommand('copy')==true) { // this will silently fail on IE11 when access is denied
            $(highlightedElement).addClass('copied');
            _gaq.push(['_trackEvent', 'Emojis', 'Copy', $(this).text().trim()]);
            setTimeout(function(){
              $(highlightedElement).removeClass('copied');
            },800);
          } else {
            // copying was not successfull or denied by the user or browser preferences
            // see Firefox about:config "dom.allow_cut_copy"
            $(highlightedElement).addClass('clipboardError');
            setTimeout(function(){
              $(highlightedElement).removeClass('clipboardError');
            },6000);

            jsClipboardSupported = false;
          }
          selection.removeAllRanges();
        }
      } catch(e) { }
    });
  }

  function isElementMatching(element, needle) {
    var alternative = element.attr("data-alternative-name");
    return ($(element).text().toLowerCase().indexOf(needle) >= 0) ||
      (alternative != null && alternative.toLowerCase().indexOf(needle) >= 0);
  }

  function highlightElements(needle) {
    if (needle.length == 0) {
      highlightAll();
      return;
    }
    needle = needle.toLowerCase();
    $(".emojis li").each(function (index, el) {
      if (isElementMatching($('.name', el), needle)) {
        $(el).show();
      } else {
        $(el).hide();
      }
    });
  }

  function highlightAll() {
    $(".emojis li").show();
  }

  $("#header .search").keyup(function(e) {
    if (e.keyCode == 27) { // ESC
      $(this).val('').blur();
      highlightAll();
    }
  });
  $("#header .search").on("change paste keyup", function() {
    highlightElements($("#header .search").val());
  });
  $("#header .search").focus();

  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://apis.google.com/js/plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);

  $.ajax({ url: 'https://api.github.com/emojis' })
    .done(function(emojis) {
      if (!emojis || typeof emojis !== 'object' || 'length' in emojis) {
        return $("#emojis").html('Unexpected response from Github');
      }

      var $emojis = Object.keys(emojis).map(function(name) {
        return '<li><div><img src="' + emojis[name] + '">:<span class="name" data-alternative-name="' + name + '">' + name + '</span>:</div></li>\n';
      });

      $("#emojis").html($emojis)
    })
    .fail(function(error) {
      $("#emojis").html('Error: <pre>' + error.responseText + '</pre>');
    });
});
