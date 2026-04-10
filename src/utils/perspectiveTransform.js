// Perspective Transform - mapuje 4 punkty źródłowe na 4 punkty docelowe
// Źródło: https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript

/**
 * Oblicza macierz perspective transform która mapuje sourcePoints na destPoints
 * @param {Array} sourcePoints - 4 punkty źródłowe [{x, y}, ...]
 * @param {Array} destPoints - 4 punkty docelowe [{x, y}, ...]
 * @returns {Array} - Macierz 3x3 spłaszczona do 9 elementów
 */
export function getPerspectiveTransform(sourcePoints, destPoints) {
  const src = sourcePoints;
  const dst = destPoints;

  // Budujemy układ równań liniowych: A * h = b
  const A = [];
  const b = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;

    // Równanie dla x
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);

    // Równanie dla y
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }

  // Rozwiąż układ równań metodą eliminacji Gaussa
  const h = solveLinearSystem(A, b);
  h.push(1); // h8 = 1

  // Macierz 3x3 w formacie [h0, h1, h2, h3, h4, h5, h6, h7, h8]
  return h;
}

/**
 * Rozwiązuje układ równań liniowych A * x = b metodą eliminacji Gaussa
 */
function solveLinearSystem(A, b) {
  const n = b.length;
  const augmented = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Znajdź pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Zamień wiersze
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Eliminuj kolumnę
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

/**
 * Transformuje punkt używając macierzy perspective
 * @param {number} x - współrzędna x punktu źródłowego
 * @param {number} y - współrzędna y punktu źródłowego
 * @param {Array} matrix - Macierz 3x3 (9 elementów)
 * @returns {Object} - {x, y} punkt po transformacji
 */
export function transformPoint(x, y, matrix) {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = matrix;

  const w = h6 * x + h7 * y + h8;
  const transformedX = (h0 * x + h1 * y + h2) / w;
  const transformedY = (h3 * x + h4 * y + h5) / w;

  return { x: transformedX, y: transformedY };
}

/**
 * Renderuje obraz z perspective transform na canvas
 * @param {CanvasRenderingContext2D} ctx - Kontekst canvas
 * @param {HTMLImageElement} img - Obraz źródłowy
 * @param {Object} sourceCorners - Narożniki na obrazie źródłowym {topLeft, topRight, bottomRight, bottomLeft}
 * @param {Object} destCorners - Narożniki docelowe w SVG {topLeft, topRight, bottomRight, bottomLeft}
 */
export function drawPerspectiveImage(ctx, img, sourceCorners, destCorners) {
  // Konwertuj corners na tablice punktów (kolejność: TL, TR, BR, BL)
  const srcPoints = [
    sourceCorners.topLeft,
    sourceCorners.topRight,
    sourceCorners.bottomRight,
    sourceCorners.bottomLeft
  ];

  const dstPoints = [
    destCorners.topLeft,
    destCorners.topRight,
    destCorners.bottomRight,
    destCorners.bottomLeft
  ];

  // Oblicz macierz transformacji
  const matrix = getPerspectiveTransform(srcPoints, dstPoints);

  // Znajdź bounding box punktów docelowych
  const allX = dstPoints.map(p => p.x);
  const allY = dstPoints.map(p => p.y);
  const minX = Math.floor(Math.min(...allX));
  const maxX = Math.ceil(Math.max(...allX));
  const minY = Math.floor(Math.min(...allY));
  const maxY = Math.ceil(Math.max(...allY));

  // Utwórz temporary canvas dla transformacji
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = maxX - minX;
  tempCanvas.height = maxY - minY;

  const imageData = tempCtx.createImageData(tempCanvas.width, tempCanvas.height);
  const data = imageData.data;

  // Narysuj obraz na temporary canvas
  const imgCanvas = document.createElement('canvas');
  const imgCtx = imgCanvas.getContext('2d');
  imgCanvas.width = img.width;
  imgCanvas.height = img.height;
  imgCtx.drawImage(img, 0, 0);
  const imgData = imgCtx.getImageData(0, 0, img.width, img.height);

  // Oblicz odwrotną macierz (dest -> source)
  const invMatrix = getPerspectiveTransform(dstPoints, srcPoints);

  // Dla każdego piksela w obszarze docelowym
  for (let dy = 0; dy < tempCanvas.height; dy++) {
    for (let dx = 0; dx < tempCanvas.width; dx++) {
      // Przekształć współrzędne docelowe na źródłowe
      const srcPoint = transformPoint(dx + minX, dy + minY, invMatrix);
      const sx = Math.round(srcPoint.x);
      const sy = Math.round(srcPoint.y);

      // Jeśli punkt jest w granicach obrazu źródłowego
      if (sx >= 0 && sx < img.width && sy >= 0 && sy < img.height) {
        const srcIdx = (sy * img.width + sx) * 4;
        const dstIdx = (dy * tempCanvas.width + dx) * 4;

        // Kopiuj piksele
        data[dstIdx] = imgData.data[srcIdx];         // R
        data[dstIdx + 1] = imgData.data[srcIdx + 1]; // G
        data[dstIdx + 2] = imgData.data[srcIdx + 2]; // B
        data[dstIdx + 3] = imgData.data[srcIdx + 3]; // A
      }
    }
  }

  // Rysuj przetransformowany obraz
  tempCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(tempCanvas, minX, minY);
}
