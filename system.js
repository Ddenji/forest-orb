const gameUiThemes = {
  'yume': [
    '0000000000009',
    '0000000000010',
    '0000000000011'
  ],
  '2kki': [
    'system1',
    'system2',
    'system3',
    'system4',
    'system5',
    'system0',
    'systemyaguruma',
    'systemrenge',
    'system-b',
    'system-g',
    'system-i',
    'system-iiii2',
    'system-k',
    'system-n',
    'system-o',
    'system-r',
    'system-hw',
    'system_Ca0',
    'Yeris_System_Rainbow',
    'system_Suzume_choco',
    'menu 20',
    'menu 21',
    '2i9_sys1',
    '2i9_sys2',
    '2i9_sys3',
    'Noil-menu25',
    'Noil-menu26',
    'Noil-menu27',
    'RioSystem1-28',
    'RioSystem2-29',
    'Nuaahs_menu',
    'RioSystem3',
    'RioSystem4',
    'system_nantai_33',
    'system_Nulsdodage_Digital',
    'system-lav',
    'Kon_sys_1',
    'Kon_sys_2',
    '2i9_sys4',
    'system_K4_April2021',
    'Nulsdodage_Mono',
    'Kon_sys_3',
    'Kon_sys_4',
    'Kon_sys_5',
    'Kon_sys_6',
    'RioSystem5',
    'system_E_eye',
    'Kong_SystemFC',
    'natl_sys_PinkRibbon'
  ],
  'flow': [
    'system',
    'FCシムテム',
    'systemdot',
    'systemorange',
    'system flower',
    'systemsugar',
    'system rust',
    'systemsmile'
  ],
  'prayers': [
    'grey-and-chartreuse',
    'chartreuse',
    'customsystem'
  ],
  'deepdreams': [
    'system_sterling',
    'system_arabian',
    'system_crystalline',
    'system_kaleidoscope',
    'system_rainbow',
    'system_spiderlily'
  ],
  'someday': [
    'green',
    '8bit',
    'blue',
    'clock',
    'edible',
    'rainbow',
    'threeoneone',
    'turquoise'
  ],
  'amillusion': [
    'fleur-2',
    'fleur',
    'bullemenu',
    'menulabyrinthe',
    'rosas menu',
    'system EPACSE',
    'MenuChance',
    'tournesol'
  ],
  'unevendream': [
    '1247-0',
    '1247-0t',
    '1247-0k',
    '1247-pc98'
  ],
  'braingirl': [
    'analog',
    'Vanilla',
    'Licorice',
    'Tobacco',
    'Chalkboard',
    'Acryllic',
    'Copper',
    'Psychedelic',
    'Spacecraft',
    'Floorgum',
    'moss',
    'Carpet',
    'Raspberry'
  ]
}[gameId];

const gameFullBgUiThemes = {
  'yume': [ '0000000000010' ],
  '2kki': [],
  'flow': [],
  'prayers': [ 'grey-and-chartreuse', 'chartreuse', 'customsystem' ],
  'deepdreams': [],
  'someday': [],
  'amillusion': [ 'fleur' ],
  'unevendream': [],
  'braingirl': []
}[gameId];

const gameLogoBlendModeOverrides = {
  'deepdreams': 'soft-light',
  'someday': 'hard-light',
  'amillusion': 'screen',
  'unevendream': 'color',
  'braingirl': 'color'
};

const hasUiThemes = gameUiThemes.length > 0;

function setSystemName(name) {
  systemName = name.replace(/'/g, '');
  if (playerData[-1])
    playerData[-1].systemName = name;
  if (connStatus === 1)
    addOrUpdatePlayerListEntry(systemName, playerName, -1);
}

// EXTERNAL
function onUpdateSystemGraphic(name) {
  if (gameUiThemes.indexOf(name.replace(/'/g, '')) > -1) {
    setSystemName(name);
    const lastAutoButton = document.querySelector('.uiThemeItem.auto');
    if (lastAutoButton)
      lastAutoButton.remove();
    const uiThemeModalContent = document.querySelector('#uiThemesModal .modalContent');
    const autoUiThemeOption = getUiThemeOption('auto');
    autoUiThemeOption.onclick = onSelectUiTheme;
    uiThemeModalContent.prepend(autoUiThemeOption);
    locI18next.init(i18next)('.uiThemeItem.auto label');
    if (config.uiTheme === 'auto')
      setUiTheme('auto');
  }
}

function getDefaultUiTheme() {
  return gameUiThemes[0];
}

function setUiTheme(value, isInit) {
  const isAuto = value === 'auto';
  const uiTheme = isAuto ? systemName || getDefaultUiTheme() : value;
  if (gameUiThemes.indexOf(uiTheme) === -1)
    return;
  if (hasUiThemes)
    config.uiTheme = value;
  getBaseBgColor(uiTheme, function (color) {
    getFontShadow(uiTheme, function (shadow) {
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--base-bg-color', color)
      rootStyle.setProperty('--shadow-color', shadow);
      rootStyle.setProperty('--container-bg-image-url', `url('images/ui/${gameId}${hasUiThemes ? '/' + uiTheme : ''}/containerbg.png')`);
      rootStyle.setProperty('--border-image-url', `url('images/ui/${gameId}${hasUiThemes ? '/' + uiTheme : ''}/border.png')`);
      document.getElementById('dropShadow').children[0].setAttribute('flood-color', shadow);
      const lastSelectedThemeContainer = document.querySelector('.uiThemeContainer.selected');
      const newSelectedTheme = document.querySelector(`.uiTheme[data-ui-theme="${value}"]`);
      if (lastSelectedThemeContainer)
        lastSelectedThemeContainer.classList.remove('selected');
      if (newSelectedTheme)
        newSelectedTheme.parentElement.classList.add('selected');
      const useFullBg = hasUiThemes && gameFullBgUiThemes.indexOf(uiTheme) > -1;
      const containers = document.querySelectorAll('.container');
      const modals = document.querySelectorAll('.modal');
      for (let container of containers)
        container.classList.toggle('fullBg', useFullBg);
      for (let modal of modals)
        modal.classList.toggle('fullBg', useFullBg);
      document.getElementById('header').classList.toggle('fullBg', useFullBg);
      document.querySelector('body').classList.toggle('fullBg', useFullBg);
      if (!isInit) {
        document.querySelector('.fontStyle').onchange();
        onUpdateChatboxInfo();
        if (hasUiThemes)
          updateConfig(config);
      }
    });
  });
}

function setFontStyle(fontStyle, isInit) {
  const isAuto = config.uiTheme == 'auto';
  const uiTheme = (isAuto ? systemName : config.uiTheme) || getDefaultUiTheme();
  if (gameUiThemes.indexOf(uiTheme) === -1)
    return;
  config.fontStyle = fontStyle;
  const defaultAltFontStyleIndex = 1;
  const defaultFallbackAltFontStyleIndex = 3;
  getFontColors(uiTheme, fontStyle, function (baseColors) {
    const altFontStyle = fontStyle !== defaultAltFontStyleIndex ? defaultAltFontStyleIndex : defaultAltFontStyleIndex - 1;
    const altColorCallback = function (altColors) {
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--base-color', getColorRgba(baseColors[8]));
      rootStyle.setProperty('--alt-color', getColorRgba(altColors[8]));
      rootStyle.setProperty('--base-gradient', `linear-gradient(to bottom, ${getGradientText(baseColors)})`);
      rootStyle.setProperty('--base-gradient-b', `linear-gradient(to bottom, ${getGradientText(baseColors, true)})`);
      rootStyle.setProperty('--alt-gradient', `linear-gradient(to bottom, ${getGradientText(altColors)})`);
      rootStyle.setProperty('--alt-gradient-b', `linear-gradient(to bottom, ${getGradientText(altColors, true)})`);
      rootStyle.setProperty('--base-color-image-url', `url('images/ui/${gameId}${hasUiThemes ? '/' + uiTheme : ''}/font${fontStyle + 1}.png')`);
      updateSvgGradient(document.getElementById('baseGradient'), baseColors);
      updateSvgGradient(document.getElementById('altGradient'), altColors);
      if (!isInit)
        updateConfig(config);
    };
    getFontColors(uiTheme, altFontStyle, function (altColors) {
      if (altColors[8][0] !== baseColors[8][0] || altColors[8][1] !== baseColors[8][1] || altColors[8][2] !== baseColors[8][2])
        altColorCallback(altColors);
      else {
        const fallbackAltFontStyle = fontStyle !== defaultFallbackAltFontStyleIndex ? defaultFallbackAltFontStyleIndex : defaultFallbackAltFontStyleIndex - 1;
        getFontColors(uiTheme, fallbackAltFontStyle, altColorCallback);
      }
    });
  });
}

function populateUiThemes() {
  const modalContent = document.querySelector('#uiThemesModal .modalContent');
  modalContent.innerHTML = '';
  if (hasUiThemes)
    modalContent.appendChild(getUiThemeOption('auto'));
  for (let uiTheme of gameUiThemes)
    modalContent.appendChild(getUiThemeOption(uiTheme));
}

function getUiThemeOption(uiTheme) {
  const isAuto = uiTheme === 'auto';
  if (isAuto)
    uiTheme = systemName || getDefaultUiTheme();

  const item = document.createElement('div');
  item.classList.add('uiThemeItem');
  if (isAuto)
    item.classList.add('auto');
  
  const container = document.createElement('div');
  container.classList.add('uiThemeContainer');

  const option = document.createElement('div');
  option.classList.add('uiTheme');
  if (gameFullBgUiThemes.indexOf(uiTheme) > -1)
    option.classList.add('fullBg');
  option.dataset.uiTheme = isAuto ? 'auto' : uiTheme;
  option.style.backgroundImage = `url('images/ui/${gameId}/${uiTheme}/containerbg.png')`;
  option.style.borderImage = `url('images/ui/${gameId}/${uiTheme}/border.png') 10 repeat`;

  const arrowUp = document.createElement('img');
  arrowUp.src = `images/ui/${gameId}/${uiTheme}/arrowup.png`;
  option.appendChild(arrowUp);

  const arrowDown = document.createElement('img');
  arrowDown.src = `images/ui/${gameId}/${uiTheme}/arrowdown.png`;
  option.appendChild(arrowDown);

  container.appendChild(option);

  if (isAuto) {
    const autoLabel = document.createElement('label');
    autoLabel.dataset.i18n = '[html]modal.uiTheme.auto';
    item.appendChild(autoLabel);
  }

  item.appendChild(container);

  return item;
}

let uiThemeBgColors = {};
let uiThemeFontShadows = {};
let uiThemeFontColors = {};

function getFontColors(uiTheme, fontStyle, callback) {
  if (!uiThemeFontColors[uiTheme])
    uiThemeFontColors[uiTheme] = {};
  let colors = uiThemeFontColors[uiTheme][fontStyle];
  if (colors)
    return callback(colors);
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    const data = context.getImageData(0, 0, 1, 16).data;
    const colors = [];
    for (let i = 0; i < data.length; i += 4) {
      colors.push([ data[i], data[i + 1], data[i + 2] ]);
    }
    uiThemeFontColors[uiTheme][fontStyle] = colors;
    callback(colors);
    canvas.remove();
  };
  img.src = 'images/ui/' + gameId + (hasUiThemes ? '/' + uiTheme : '') + '/font' + (fontStyle + 1) + '.png';
}

function getFontShadow(uiTheme, callback) {
  let pixel = uiThemeFontShadows[uiTheme];
  if (pixel)
    return callback(getColorRgba(pixel));
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    pixel = context.getImageData(0, 8, 1, 1).data;
    uiThemeFontShadows[uiTheme] = [ pixel[0], pixel[1], pixel[2] ];
    callback(getColorRgba(pixel));
    canvas.remove();
  };
  img.src = 'images/ui/' + gameId + (hasUiThemes ? '/' + uiTheme : '') + '/fontshadow.png';
}

function getBaseBgColor(uiTheme, callback) {
  const img = new Image();
  let pixel = uiThemeBgColors[uiTheme];
  if (pixel)
    return callback(getColorRgba(pixel));
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    pixel = context.getImageData(0, 0, 1, 1).data;
    const pixel2 = context.getImageData(4, 4, 1, 1).data;
    const pixel3 = context.getImageData(8, 8, 1, 1).data;
    const r = Math.round((pixel[0] + pixel2[0] + pixel3[0]) / 3);
    const g = Math.round((pixel[1] + pixel2[1] + pixel3[1]) / 3);
    const b = Math.round((pixel[2] + pixel2[2] + pixel3[2]) / 3);
    uiThemeBgColors[uiTheme] = [ r, g, b ];
    callback('rgba(' + r + ', ' + g + ', ' + b + ', 1)');
    canvas.remove();
  };
  img.src = 'images/ui/' + gameId + (hasUiThemes ? '/' + uiTheme : '') + '/containerbg.png';
}

function getGradientText(colors, smooth) {
  let lastColor = colors[0];
  let ret = `${getColorRgba(lastColor)} 0 `;
  colors.forEach(function (color, c) {
    if (color[0] !== lastColor[0] || color[1] !== lastColor[1] || color[2] !== lastColor[2]) {
      const percent = Math.floor(((c + 1) / colors.length) * 10000) / 100;
      ret += `${percent}%, ${getColorRgba(color)} `;
      if (!smooth)
        ret += `${percent}% `;
      lastColor = color;
    }
  });
  ret += '100%';
  return ret;
}

function updateSvgGradient(gradient, colors) {
  gradient.innerHTML = '';
  let lastColor = colors[0];
  gradient.appendChild(getSvgGradientStop(lastColor, 0));
  colors.forEach(function (color, c) {
    if (color[0] !== lastColor[0] || color[1] !== lastColor[1] || color[2] !== lastColor[2]) {
      const offset = Math.floor(((c + 1) / colors.length) * 10000) / 100;
      gradient.appendChild(getSvgGradientStop(color, offset));
      lastColor = color;
    }
  });
}

function getSvgGradientStop(color, offset) {
  const ret = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  ret.setAttribute('stop-color', getColorRgba(color));
  ret.setAttribute('offset', `${offset}%`);
  return ret;
}

function addSystemSvgGradient(systemName, colors) {
  const gradientId = `baseGradient_${systemName.replace(' ', '_')}`;
  if (!document.getElementById(gradientId)) {
    const svgDefs = document.getElementById('svgDefs');
    const svgGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    svgGradient.id = gradientId;
    svgGradient.setAttribute('x1', '0%');
    svgGradient.setAttribute('y1', '0%');
    svgGradient.setAttribute('x2', '0%');
    svgGradient.setAttribute('y2', '100%');
    updateSvgGradient(svgGradient, colors);
    svgDefs.appendChild(svgGradient);
  }
}

function addSystemSvgDropShadow(systemName, color) {
  const dropShadowFilterId = `dropShadow_${systemName.replace(' ', '_')}`;
  if (!document.getElementById(dropShadowFilterId)) {
    const svgDefs = document.getElementById('svgDefs');
    const svgDropShadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    svgDropShadowFilter.id = dropShadowFilterId;

    const svgDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    svgDropShadow.setAttribute('dx', '1');
    svgDropShadow.setAttribute('dy', '1');
    svgDropShadow.setAttribute('stdDeviation', '0.2');
    svgDropShadow.setAttribute('flood-color', color);

    svgDropShadowFilter.appendChild(svgDropShadow);
    svgDefs.appendChild(svgDropShadowFilter);
  }
}

function getColorRgba(color) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
}