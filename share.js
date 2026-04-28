/* === pattaya-gym.com share helpers === */
window.PG = window.PG || {};

PG.share = function (network) {
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(document.title.split(' | ')[0] || 'Pattaya Gym');
  var links = {
    whatsapp: 'https://wa.me/?text=' + title + '%20' + url,
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
    twitter:  'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
    line:     'https://social-plugins.line.me/lineit/share?url=' + url,
    telegram: 'https://t.me/share/url?url=' + url + '&text=' + title,
    email:    'mailto:?subject=' + title + '&body=' + url
  };
  if (network === 'copy') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href).then(function () { PG.toast('Link copied to clipboard'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      PG.toast('Link copied to clipboard');
    }
    return;
  }
  if (network === 'native' && navigator.share) {
    navigator.share({ title: document.title, url: window.location.href }).catch(function () {});
    return;
  }
  window.open(links[network], '_blank', 'noopener,width=600,height=520');
};

PG.toast = function (msg) {
  var t = document.createElement('div');
  t.className = 'pg-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('show'); });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 300);
  }, 2200);
};
