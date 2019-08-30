const main = document.getElementById('main');
const preview = document.getElementById('preview');
const txt = preview.querySelector('p');

// 
const bg_group = document.getElementById('bg_group');
const bg_group_lbls = bg_group.querySelectorAll('label');
const bg_color = document.getElementById('bg_color');

// 
const font_group = document.getElementById('font_group');
const font_group_lbls = font_group.querySelectorAll('label');
const font_color = document.getElementById('font_color');


// wcag group
const passAA = document.getElementById('passAA');
const failAA = document.getElementById('failAA');
const passAAA = document.getElementById('passAAA');
const failAAA = document.getElementById('failAAA');
const ratio = document.getElementById('ratio');


// ------------------------------------------------------- RANDOM COLORS ON START

const randNum0 = (N) => Math.floor(Math.random() * (N)); // increase passing results
const randNum1 = () => Math.floor(Math.random() * (116)) + 140; // increase passing results

// decrease the number of dark brown results
const randColor0 = () => `rgb(${randNum0(36)}, ${randNum0(16)}, ${randNum0(76)})`;
const randColor1 = () => `rgb(${randNum1()}, ${randNum1()}, ${randNum1()})`;

// ------------------------------------------------------------------------------


// auto contrast labels
function ccRGB(rgb) {
    let [r, g, b] = rgb.match(/\d+/g);
    [r, g, b] = [r * 0.2126, g * 0.7152, b * 0.0722];
    return (r + g + b) >= 128 ? "black" : "white";
}

// update all bg_group components
const setBgColors = (c) => {
    bg_color.value = c;
    bg_group.style.background = c;
    preview.style.background = c;
    bg_group_lbls.forEach(lbl => {
        lbl.style.color = ccRGB(c);
    });
}
setBgColors(randColor0());


// update all font_group components
const setFontColors = (c) => {
    font_color.value = c;
    font_group.style.background = c;
    txt.style.color = c;
    font_group_lbls.forEach(lbl => {
        lbl.style.color = ccRGB(c);
    });
}
setFontColors(randColor1());

const getsRGB = (v) => (v <= 0.03928) ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;

const LUM = (color) => {
    let [r, g, b] = color.match(/\d+/g);
    r = getsRGB(r / 255) * 0.2126;
    g = getsRGB(g / 255) * 0.7152;
    b = getsRGB(b / 255) * 0.0722;
    return r + g + b;
}

// "Contrast" was a term associated with fine art late 17th century, in the sense "juxtapose so as to bring out differences in form and color". (Etymology) Latin "contra-" against + "stare" stand.

const getContrast = (colorA, colorB) => {
    const L1 = (typeof colorA === 'string') ? LUM(colorA) : colorA;
    const L2 = (typeof colorB === 'string') ? LUM(colorB) : colorB;
    const compare = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    // truncate to two decimal places without rounding
    const contrast = compare.toString().match(/(?:\d*([.])\d{2})/);
		// 	"x == undefined also checks whether x is null" 
    if (contrast != undefined) return contrast[0];
    return (L1 === L2) ? 1 : 21;
}

// ------------------------------------------------------- ADDS HEX SUPPORT 

const isHEX = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i;

const convertHEX = (color) => {
    if (color.length < 6) {
        let [r, g, b] = color.match(/[0-9A-F]/ig);
        color = `${[r, r, g, g, b, b].join('')}`;
    }
    color = `0x${color.replace("#", '')}`;
    let [rr, gg, bb] = [color >> 16, color >> 8, color];
    [rr, gg, bb] = [rr & 255, gg & 255, bb & 255];
    return `rgb(${rr}, ${gg}, ${bb})`;
}

const getValue = (el) => {
    const inputValue = el.value;
    return (isHEX.test(inputValue)) ? convertHEX(inputValue) : inputValue;
}

// ------------------------------------------------------------------------
const para = document.querySelector("#preview p");
const compStyles = window.getComputedStyle(para);
const getFontSize = () => compStyles.getPropertyValue("font-size");

function result() {
  const fsize = Number(getFontSize().replace("px", ''));
  const [ratioAA, ratioAAA] = (fsize > 24) ? [3, 4.5] : [4.5, 7];

  const testAA = (val) => (Number(val) > ratioAA) ? "PASS" : "FAIL";
  const testAAA = (val) => (Number(val) > ratioAAA) ? "PASS" : "FAIL";

    const colorOne = getValue(bg_color);
    const colorTwo = getValue(font_color);
    const contrastValue = getContrast(colorOne, colorTwo);

    return {
        colors: [colorOne, colorTwo],
        contrast: contrastValue,
        testAA: testAA(contrastValue),
        testAAA: testAAA(contrastValue)
    };
}

// ------------------------------------------------------------------------

function submit() {

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

    const answer = result();
    setAA(answer.testAA);
    setAAA(answer.testAAA);
    setRatio(answer.contrast);
    setBgColors(answer.colors[0]);
    setFontColors(answer.colors[1]);
}

submit();

bg_color.addEventListener('change', submit);
font_color.addEventListener('change', submit);


//