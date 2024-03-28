const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.querySelectorAll(".jsColor");
const range = document.getElementById("jsRange");
const drawBtn = document.getElementById("jsDraw");
const saveBtn = document.getElementById("jsSave");
const undoBtn = document.getElementById("jsUndo");
const eraseBtn = document.getElementById("jsErase");
const fillBtn = document.getElementById("jsFill");

const INITIAL_COLOR = "#000000";
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

ctx.strokeStyle = INITIAL_COLOR;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
ctx.lineWidth = 2.5;
ctx.lineCap = "round"; // 선의 끝을 둥글게 처리

let isDrawing = false;
let eraserMode = false;
let lastX = 0;
let lastY = 0;
let lines = []; // 선의 정보를 저장할 배열

function onMouseMove(event) {
    if (!isDrawing) return;
    const x = event.offsetX;
    const y = event.offsetY;
    draw(lastX, lastY, x, y);
    lastX = x;
    lastY = y;
}

function onMouseDown(event) {
    isDrawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
    startDrawing(lastX, lastY);
    // 새로운 선을 위한 새 배열 추가
    lines.push([{ x: lastX, y: lastY }]);
}

function onMouseUp(event) {
    isDrawing = false;
}

function draw(x1, y1, x2, y2) {
    if (!isDrawing) return; // isDrawing 체크 추가
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // 현재 선에 점 추가
    lines[lines.length - 1].push({ x: x2, y: y2 });
}

function startDrawing(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function undo() {
    if (lines.length > 0) {
        lines.pop(); // 마지막으로 추가된 선을 제거
        redrawCanvas();
    }
}

function fillShape() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 각 열마다 교차점의 수를 세기 위한 배열 생성
    const intersections = new Array(canvas.width).fill(0);

    // 각 픽셀의 교차점 수 계산
    for (let y = 0; y < canvas.height; y++) {
        let inside = false; // 도형 내부 여부 플래그
        let lastPixelInside = false; // 이전 픽셀이 도형 내부에 있는지 여부

        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const isBlack = data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0;

            if (isBlack) {
                if (!inside) {
                    inside = true;
                    if (!lastPixelInside) {
                        intersections[x]++;
                    }
                } else {
                    if (!lastPixelInside) {
                        intersections[x]--;
                    }
                    inside = false;
                }
            }

            lastPixelInside = inside;
        }
    }

    // 교차점을 기준으로 스캔라인 채우기
    let inside = false;
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;

            // 교차점이 홀수인 경우 도형 내부에 있음
            if (intersections[x] % 2 === 1) {
                inside = !inside;
            }

            // 도형 내부에 있을 때 픽셀 채우기
            if (inside) {
                data[index] = 255; // 빨간색
                data[index + 1] = 0; // 녹색
                data[index + 2] = 0; // 파란색
                data[index + 3] = 255; // 알파 채널 (불투명)
            }
        }
    }

    // 이미지 데이터를 캔버스에 다시 그립니다.
    ctx.putImageData(imageData, 0, 0);
}

function redrawCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // lines 배열에 저장된 모든 선 다시 그리기
    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        line.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    });
}

function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    ctx.strokeStyle = color;
}

function handleRangeChange(event) {
    const size = event.target.value;
    ctx.lineWidth = size;
}

function handleDrawClick() {
    isDrawing = true; // 그림 그리기 시작
}

function handleEraserClick() {
    eraserMode = !eraserMode; // 지우개 모드를 토글
    if (eraserMode) {
        ctx.strokeStyle = "white"; // 지우개 모드일 때는 흰색으로 설정
    } else {
        ctx.strokeStyle = INITIAL_COLOR; // 그리기 모드일 때는 초기 색상으로 설정
    }
}

function handleFillClick() {
    fillShape();
}

function handleCM(event) {
    event.preventDefault();
}

function handleSaveClick() {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "PaintJS[EXPORT]";
    link.click();
}

if (canvas) {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("contextmenu", handleCM); // 우클릭 방지
}

Array.from(colors).forEach(color =>
    color.addEventListener("click", handleColorClick));

if (range) {
    range.addEventListener("input", handleRangeChange);
}

if (drawBtn) {
    drawBtn.addEventListener("click", handleDrawClick);
}

if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveClick);
}

if (undoBtn) {
    undoBtn.addEventListener("click", undo);
}

if (eraseBtn) {
    eraseBtn.addEventListener("click", handleEraserClick);
}

if (fillBtn) {
    fillBtn.addEventListener("click", handleFillClick); // fillBtn에 클릭 이벤트 추가
}
