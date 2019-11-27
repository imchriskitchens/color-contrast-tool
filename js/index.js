const bg_group_label = bg_group.querySelector('label');
const font_group_label = font_group.querySelector('label');


// ------------------------------------------------------- RANDOM COLORS ON START

const randNum0 = (N) => Math.floor(Math.random() * (N)); // increase passing results
const randNum1 = () => Math.floor(Math.random() * (116)) + 140; // increase passing results

// decrease the number of dark brown results
const randColor0 = () => `rgb(${randNum0(36)}, ${randNum0(16)}, ${randNum0(76)})`;
const randColor1 = () => `rgb(${randNum1()}, ${randNum1()}, ${randNum1()})`;


// ------------------------------------------------------------------------------

const colorUtil = {
  isHEX: /(^#[a-f\d]{6}$)|(^#[a-f\d]{3}$)/i,
  isRGB: /^rgb\((\s*\d{1,3}\s*),(\s*\d{1,3}\s*),(\s*\d{1,3}\s*)\)$/i,
  isHSL: /^hsl\((\s*\d{1,3}\s*),(\s*\d{1,3}%\s*),(\s*\d{1,3}%\s*)\)$/i,

  hexString({ r, g, b }) { return `#${r}${g}${b}` /**/ .toUpperCase() /**/ ; },
  rgbString({ r, g, b }) { return `rgb(${r}, ${g}, ${b})`; },
  hslString({ h, s, l }) { return `hsl(${h}, ${s}%, ${l}%)`; },

  clampRGB(value) {
    let [r, g, b] = value.match(/-?\d+/g);
    [r, g, b] = new Uint8ClampedArray([r, g, b]);
    return colorUtil.rgbString({ r, g, b });
  },

  rgbToHEX(value, { data } = false) {
    let [r, g, b] = value.match(/\d+/g);
    [r, g, b] = [r, g, b].map((n) => parseInt(n, 10).toString(16));
    [r, g, b] = [r, g, b].map((n) => n.length === 1 ? `0${n}` : n);
    return (data) ? ([r, g, b]) : colorUtil.hexString({ r, g, b });
  },

  rgbToHSL(value, { data } = false) {
    let [r, g, b] = (Array.isArray(value)) ? value: value.match(/\d+/g);
    [r, g, b] = [r, g, b].map((v) => v / 255);
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let c = cmax - cmin;
    let [h, s, l] = [0, 0, (cmax + cmin) * 0.5];
    if (c !== 0) {
      h = // condition hue value
        (cmax === r) ? ((g - b) / c) % 6 :
        (cmax === g) ? (b - r) / c + 2 :
        (r - g) / c + 4; // (cmax === b)
      s = c / (1 - Math.abs(cmax + cmin - 1));
    }
    [h, s, l] = [h * 60, s * 100, l * 100];
    if (h < 0) h += 360; // neg hue correction
    [h, s, l] = [h, s, l].map((n) => parseInt(n));
    return (data) ? ([h, s, l]) : colorUtil.hslString({ h, s, l });
  },

  hslToRGB(value, { data } = false) {
    let [h, s, l] = value.match(/\d+/g);
    [h, s, l] = [h / 60, s / 100, l / 100];
    let c = s * (1 - Math.abs(2 * l - 1));
    let x = c * (1 - Math.abs(h % 2 - 1));
    let m = l - c / 2;
    [c, x, m] = [(c + m), (x + m), m].map((v) => Math.round(v * 255));
    [c, x, m] = [c, x, m].map((v) => (v < 1) ? 0 : v);
    let [r, g, b] = [[c, x, m], [x, c, m], [m, c, x], [m, x, c], [x, m, c], [c, m, x]][Math.floor(h) % 6];
    return (data) ? ([r, g, b]) : colorUtil.rgbString({ r, g, b });
  },

  hslToHEX(value, { data } = false) {
    let [r, g, b] = colorUtil.hslToRGB(value, { data: true });
    [r, g, b] = [r, g, b].map((n) => parseInt(n, 10).toString(16));
    [r, g, b] = [r, g, b].map((n) => n.length === 1 ? `0${n}` : n);
    return (data) ? ([r, g, b]) : colorUtil.hexString({ r, g, b });
  },

  hexToRGB(value, { data } = false) {
    value = value.replace("#", "");
    value = (value.length === 3) ? ("0x" + ([...value]).map((ch) =>
      `${ch}${ch}`).join("")) : `0x${value}`;
    const [r, g, b] = [(value >> 16), (value >> 8), value].map((n) => n & 255);
    return (data) ? ([r, g, b]) : colorUtil.rgbString({ r, g, b });
  },

  hexToHSL(value) {
    const [r, g, b] = colorUtil.hexToRGB(value, { data: true });
    return colorUtil.rgbToHSL([r, g, b]);
  },

  autoContrast(value) {
    let [r, g, b] = value.match(/\d+/g);
   [r, g, b] = [r * 0.2126, g * 0.7152, b * 0.0722];
    return (r + g + b) >= 128 ? "black" : "white";
  },

  getContrast(colorA, colorB) {
    const lin_sRGB = (v) => (v < 0.04045) ?
      (v / 12.92) : ((v + 0.055) / 1.055) ** 2.4;

    const LUM = (value) => {
      let [r, g, b] = value.match(/\d+/g);
      [r, g, b] = [r, g, b].map(v => lin_sRGB(v / 255));
      [r, g, b] = [r * 0.2126, g * 0.7152, b * 0.0722];
      return [r, g, b].reduce((a, b) => a + b);
    }

    const [L1, L2] = [LUM(colorA), LUM(colorB)];
    const compare = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    return (compare != undefined) ?
      compare.toPrecision((compare >= 10) ? 4 : 3) : (L1 === L2) ? 1 : 21;
  },
};

// ------------------------------------------------------------------------

const setBgGroup = (c) => {
  bg_color.value = c;
  bg_group.style.background = c;
  preview.style.background = c;
  bg_group_label.style.color = colorUtil.autoContrast(c);
}
setBgGroup(randColor0());


const setFontGroup = (c) => {
  font_color.value = c;
  font_group.style.background = c;
  previewText.style.color = c;
  font_group_label.style.color = colorUtil.autoContrast(c);
}
setFontGroup(randColor1());


// ------------------------------------------------------------------------

const getResult = () => {
  const compStyles = window.getComputedStyle(previewText);
  const fontSize = compStyles.getPropertyValue("font-size").replace("px", '');

  const [ratioAA, ratioAAA] = (Number(fontSize) > 24) ? [3, 4.5] : [4.5, 7];
  const testAA = (value) => (value > ratioAA) ? "PASS" : "FAIL";
  const testAAA = (value) => (value > ratioAAA) ? "PASS" : "FAIL";

  const [colorOne, colorTwo] = ([bg_color, font_color]).map(({ value }) => {
    return colorUtil.isHEX.test(value) ?
      colorUtil.hexToRGB(value) : colorUtil.clampRGB(value);
  });

  const contrastValue = colorUtil.getContrast(colorOne, colorTwo);

  return {
    colors: [colorOne, colorTwo],
    contrast: contrastValue,
    testAA: testAA(contrastValue),
    testAAA: testAAA(contrastValue)
  };
}

// ------------------------------------------------------------------------

const submit = () => {

  const setAA = (grade) => {
    if (grade === "PASS") {
      if (passAA.hasAttribute('hidden'))
        passAA.removeAttribute('hidden');
      failAA.setAttribute("hidden", "true");
    } else {
      passAA.setAttribute("hidden", "true");
      if (failAA.hasAttribute('hidden'))
        failAA.removeAttribute('hidden');
    }
  }

  const setAAA = (grade) => {
    if (grade === "PASS") {
      if (passAAA.hasAttribute('hidden'))
        passAAA.removeAttribute('hidden');
      failAAA.setAttribute("hidden", "true");
    } else {
      passAAA.setAttribute("hidden", "true");
      if (failAAA.hasAttribute('hidden'))
        failAAA.removeAttribute('hidden');
    }
  }

  const setRatio = (value) => {
    ratio.textContent = `Ratio: ${value}`;
  }

  const result = getResult();
  setAA(result.testAA);
  setAAA(result.testAAA);
  setRatio(result.contrast);
  setBgGroup(result.colors[0]);
  setFontGroup(result.colors[1]);
}

submit();

bg_color.addEventListener("change", () => submit(), false);
font_color.addEventListener("change", () => submit(), false);


//