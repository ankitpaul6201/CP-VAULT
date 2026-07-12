(function() {
  const hours = new Date().getHours();
  const isLightTheme = hours >= 8 && hours < 17;
  if (isLightTheme) {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    const style = document.createElement('style');
    style.innerHTML = 'html, body { background-color: #d7dfd1 !important; }';
    document.head.appendChild(style);
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    const style = document.createElement('style');
    let bg = '#030712';
    if (hours >= 17 && hours < 19) bg = '#3d1a2c';
    else if (hours >= 5 && hours < 8) bg = '#483c4a';
    style.innerHTML = 'html, body { background-color: ' + bg + ' !important; }';
    document.head.appendChild(style);
  }
})();
