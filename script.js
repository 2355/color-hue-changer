// @ts-check

const imageInput = document.getElementById("imageInput");
const hueSlider = document.getElementById("hueSlider");
const baseImage = document.getElementById("baseImage");
const modifiedImage = document.getElementById("modifiedImage");
const downloadButton = document.getElementById('downloadButton');
const downloadLink = document.getElementById('downloadLink');

let originalImage = null;

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    originalImage = URL.createObjectURL(file);
    baseImage.src = originalImage;
    modifiedImage.src = originalImage;
  }
});

hueSlider?.addEventListener("change", () => {
  if (originalImage) {
    const hueValue = hueSlider.value;
    changeHue(originalImage, hueValue).then((image) => {
      modifiedImage.src = image;
    });
  }
});

downloadButton.addEventListener('click', () => {
    const modifiedImageSrc = modifiedImage.src;
    downloadLink.href = modifiedImageSrc;
});

async function changeHue(imageUrl, hue) {
  const img = new Image();
  img.src = imageUrl;

  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const [h, s, v] = rgbToHsv(r, g, b);
        const [newR, newG, newB] = hsvToRgb(hue, s, v);
        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
      }

      ctx.putImageData(imageData, 0, 0);
      const modifiedImageUrl = canvas.toDataURL();
      resolve(modifiedImageUrl);
    };
  });
}

function rgbToHsv(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h, s, v;

    if (delta === 0) {
        h = 0;
    } else if (max === r) {
        h = ((g - b) / delta) % 6;
    } else if (max === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    if (h < 0) {
        h += 360;
    }

    s = max === 0 ? 0 : (delta / max) * 100;
    v = max * 100;

    return [h, s, v];
}

function hsvToRgb(h, s, v) {
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r, g, b;

    if (0 <= h && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (60 <= h && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (120 <= h && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (180 <= h && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (240 <= h && h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}
