/* global abbrTouch */

function ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function perfmark(callback, key) {
  performance.mark('mark_' + key + '_start');
  callback();
  performance.mark('mark_' + key + '_end');
  performance.measure(
    'mark_' + key,
    'mark_' + key + '_start',
    'mark_' + key + '_end'
  );
}

(function darkModeSwitcher() {
  var labels = document.querySelectorAll('.color-mode-labels label');
  labels.forEach(function(label) {
    label.addEventListener('click', function() {
      localStorage.setItem('dark_mode', this.dataset.value);
    });
  });
})();

(function switchlang() {
  perfmark(function() {
    // Detect user language and redirect, if first time, to the right page ----------------
    try {
      var lang_user;
      lang_user = localStorage.getItem('lang_user');
      if (!lang_user) {
        lang_user = (
          window.navigator.userLanguage ||
          (window.navigator.languages.length > 0 &&
            window.navigator.languages[0]) ||
          window.navigator.language
        ).slice(0, 2);
        localStorage.setItem('lang_user', lang_user);
        var lang_site = document.getElementsByTagName('html')[0].lang;
        if (lang_user != lang_site) {
          window.location = document.querySelector(
            '[hreflang][rel="alternate"]'
          ).href;
        }
      }
    } catch (e) {}

    document.addEventListener(
      'click',
      function(event) {
        if (event.target.matches('[lang][href*="/"]')) {
          localStorage.setItem('lang_user', event.target.getAttribute('lang'));
        }
      },
      false
    );
  }, 'switchlang');
})();

ready(function() {
  perfmark(function() {
    window.initEasyToggleState();
  }, 'easy_toggle');

  (function(abbrTouch) {
    var tooltipTimeout;

    function getTooltipElement() {
      var tooltip = document.querySelector('#abbr-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'abbr-tooltip';
        // Technically this is duplicate content, just exposing it on mobile
        tooltip.setAttribute('aria-hidden', 'true');
        document.body.appendChild(tooltip);
      }
      return tooltip;
    }

    function updateTooltip(tooltip, term, expandedTerm) {
      var text = term + ': ' + expandedTerm;
      tooltip.innerHTML = text;
      tooltip.classList.add('visible');

      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }

      var timeoutLength = text.length * 120;
      tooltipTimeout = setTimeout(function() {
        tooltip.classList.remove('visible');
      }, timeoutLength);
    }

    perfmark(function() {
      abbrTouch(document.querySelector('article'), function(target, title) {
        var tooltip = getTooltipElement();
        // Ensure the tooltip is ready so that the initial transition works
        setTimeout(function() {
          updateTooltip(tooltip, target.innerHTML, title);
        }, 0);
      });
    }, 'abbrTouch');
  })(abbrTouch);

  function decorate_footnotes() {
    var lang = document.getElementsByTagName('html')[0].getAttribute('lang'),
      alternatives = {
        to: {
          en: 'footnote',
          fr: 'note de bas de page'
        },
        back: {
          en: 'return to the text',
          fr: 'retour au texte'
        }
      };

    var i,
      textnotes = [...document.querySelectorAll('.footnote-ref a')],
      footnotes = [...document.getElementsByClassName('footnote-backref')];
    for (i = 0; i < textnotes.length; i++) {
      textnotes[i].setAttribute('title', alternatives.to[lang]);
    }
    for (i = 0; i < footnotes.length; i++) {
      footnotes[i].setAttribute('title', alternatives.back[lang]);
    }
  }
  decorate_footnotes();
});
