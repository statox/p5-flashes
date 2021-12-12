let input;
let grid;
let scaleY;
let scaleX;
let flashesCount;
let stepCount;
let lastTick;
const D = 700;
const MAX_ENERGY = 10;
let pastConfigurations;

function bigRandomGrid(size) {
    pastConfigurations = new Set();
    const g = [];
    for (let y = 0; y < size; y++) {
        g.push([]);
        for (let x = 0; x < size; x++) {
            g[y].push(random(0, MAX_ENERGY));
        }
    }
    return g;
}

function setup() {
    pastConfigurations = new Set();
    grid = bigRandomGrid(100);

    lastTick = millis();
    flashesCount = 0;
    part2Found = false;
    stepCount = 0;
    scaleY = D / grid.length;
    scaleX = D / grid[0].length;

    const myCanvas = createCanvas(D, D);
    myCanvas.parent('canvasDiv');
    noStroke();
}

function colorByFlashLevel(level) {
    if (level === 0) {
        // return '#fff9cc';
        return '#777049';
    }
    // return map(level, 1, MAX_ENERGY, 0, 205);
    return map(level, 1, MAX_ENERGY, 0, 30);
}

function draw() {
    background(10);

    doUpdate();
    checkLoop();
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const c = colorByFlashLevel(grid[y][x]);
            fill(c);
            circle(x * scaleX + scaleX / 2, y * scaleY + scaleY / 2, scaleX, scaleY);
        }
    }
}

const xyToStr = (x, y) => `${x};${y}`;

function checkLoop() {
    const gridAsStr = grid.join(',');
    if (pastConfigurations.has(gridAsStr)) {
        document.getElementById('noLoopSpan').innerText = '';
        document.getElementById('loopSpan').innerText = 'LOOP DETECTED';
        setTimeout(() => {
            document.getElementById('noLoopSpan').innerText = 'No loop detected for now';
            document.getElementById('loopSpan').innerText = '';
            stepCount = 0;
            flashesCount = 0;
            grid = bigRandomGrid(100);
        }, 3000);
    }
    pastConfigurations.add(gridAsStr);
}

function doUpdate() {
    stepCount++;
    const previousGrid = grid.map((l) => [...l]);
    flashesCount += doStep(grid);

    if (stepCount % 75 === 0) {
        for (let _ = 0; _ < 1000; _++) {
            const rx = Math.floor(random(grid[0].length - 1));
            const ry = Math.floor(random(grid.length - 1));
            console.log({rx, ry});
            grid[ry][rx] = random(MAX_ENERGY);
        }
    }

    document.getElementById('stepSpan').innerText = stepCount;
    document.getElementById('flashesSpan').innerText = flashesCount;
}

//function getNeighbors(x, y) {
//    const n = [];
//    y > 0 && x > 0 && n.push({x: x - 1, y: y - 1});
//    y > 0 && n.push({x: x, y: y - 1});
//    y > 0 && x < grid[y].length - 1 && n.push({x: x + 1, y: y - 1});
//
//    x > 0 && n.push({x: x - 1, y});
//    x < grid[y].length - 1 && n.push({x: x + 1, y});
//
//    y < grid.length - 1 && x > 0 && n.push({x: x - 1, y: y + 1});
//    y < grid.length - 1 && n.push({x: x, y: y + 1});
//    y < grid.length - 1 && x < grid[y].length - 1 && n.push({x: x + 1, y: y + 1});
//    return n;
//}

function getNeighbors2n(x, y) {
    const n = [];
    n.push({x: x - 2, y: y - 2});
    n.push({x: x - 1, y: y - 2});
    n.push({x: x, y: y - 2});
    n.push({x: x + 1, y: y - 2});
    n.push({x: x + 2, y: y - 2});

    n.push({x: x - 2, y: y - 1});
    n.push({x: x - 2, y: y - 1});
    n.push({x: x - 2, y});
    n.push({x: x + 2, y});
    n.push({x: x + 2, y: y + 1});
    n.push({x: x + 2, y: y + 1});

    n.push({x: x - 2, y: y + 2});
    n.push({x: x - 1, y: y + 2});
    n.push({x: x, y: y - 2});
    n.push({x: x + 1, y: y + 2});
    n.push({x: x + 2, y: y + 2});

    return n.map(({x, y}) => {
        if (x < 0) x = x + grid[0].length;
        if (x >= grid[0].length) x = x - grid[0].length;

        if (y < 0) y = y + grid.length;
        if (y >= grid.length) y = y - grid.length;

        return {x, y};
    });
}

function getNeighbors1n(x, y) {
    const n = [];
    n.push({x: x - 1, y: y - 1});
    n.push({x: x, y: y - 1});
    n.push({x: x + 1, y: y - 1});

    n.push({x: x - 1, y});
    n.push({x: x + 1, y});

    n.push({x: x - 1, y: y + 1});
    n.push({x: x, y: y + 1});
    n.push({x: x + 1, y: y + 1});

    return n.map(({x, y}) => {
        if (x < 0) x = x + grid[0].length;
        if (x >= grid[0].length) x = x - grid[0].length;

        if (y < 0) y = y + grid.length;
        if (y >= grid.length) y = y - grid.length;

        return {x, y};
    });
}

function doStep(lines) {
    const flashed = new Set();
    const toFlash = [];

    for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines.length; x++) {
            lines[y][x] += 1;
            if (lines[y][x] > MAX_ENERGY) {
                toFlash.push({x, y});
            }
        }
    }

    while (toFlash.length) {
        const {x, y} = toFlash.shift();
        if (flashed.has(xyToStr(x, y))) {
            continue;
        }
        flashed.add(xyToStr(x, y));

        for (const n of getNeighbors1n(x, y)) {
            if (lines[n.y][n.x] > MAX_ENERGY) {
                continue;
            }
            lines[n.y][n.x] += 1;
            if (lines[n.y][n.x] > MAX_ENERGY) {
                toFlash.push(n);
            }
        }
    }

    for (const str of flashed) {
        const [x, y] = str.split(';').map(Number);
        lines[y][x] = 0;
    }

    return flashed.size;
}
