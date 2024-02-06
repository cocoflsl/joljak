// drawBoard.js

const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.querySelectorAll(".jsColor");
const range = document.getElementById("jsRange");
const mode = document.getElementById("jsMode");
const saveBtn = document.getElementById("jsSave");
const undoBtn = document.getElementById("jsUndo");

const INITIAL_COLOR = "#000000";
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

ctx.strokeStyle = "#2c2c2c";
ctx.fillStyle = "white";
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
ctx.strokeStyle = INITIAL_COLOR;
ctx.fillStyle = INITIAL_COLOR;
ctx.lineWidth = 2.5;

let painting = false;
let filling = false;
let path = [];
let undoStack = [];
let lines = [];


function stopPainting() {
    painting = false;
    if (path.length > 0) {
        undoStack.push([...path]); // 좌표 배열을 복사하여 저장
        lines.push([...path]); // path를 lines 배열에 추가
        path = [];
    }
}

function startPainting() {
    painting = true;
}

function onMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (!painting) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
        path.push({x, y, color: ctx.strokeStyle, size: ctx.lineWidth});
    }
}

function undo() {
    if (lines.length > 0) {
        lines.pop(); // lines 배열에서 마지막 선 제거
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // lines 배열에 저장된 모든 선 다시 그리기
        lines.forEach(line => {
            ctx.strokeStyle = line[0].color;
            ctx.lineWidth = line[0].size;
            ctx.beginPath();
            ctx.moveTo(line[0].x, line[0].y);
            line.forEach(point => {
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            });
        });
    }
}

function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
}

function handleRangeChange(event) {
    const size = event.target.value;
    ctx.lineWidth = size;
}

function handleModeClick() {
    if (filling === true) {
        filling = false;
        mode.innerText = "채우기로 전환";
    } else {
        filling = true;
        mode.innerText = "그리기로 전환";
    }
}

function handleUndoClick() {
    undo();
}

function handleCanvasClick() {
    if (filling) {
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}

// 우클릭 방지
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
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });
}

Array.from(colors).forEach(color =>
    color.addEventListener("click", handleColorClick));

if (range) {
    range.addEventListener("input", handleRangeChange);
}

if (mode) {
    mode.addEventListener("click", handleModeClick);
}

if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveClick);
}

if (undoBtn) {
    undoBtn.addEventListener("click", undo);
}
