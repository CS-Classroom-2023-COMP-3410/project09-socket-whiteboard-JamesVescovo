document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');
  const colorInput = document.getElementById('color-input');
  const brushSizeInput = document.getElementById('brush-size');
  const brushSizeDisplay = document.getElementById('brush-size-display');
  const clearButton = document.getElementById('clear-button');
  const connectionStatus = document.getElementById('connection-status');
  const userCount = document.getElementById('user-count');

  // Set canvas dimensions
  function resizeCanvas() {
    // TODO: Set the canvas width and height based on its parent element
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // Redraw the canvas with the current board state when resized
    // TODO: Call redrawCanvas() function
    redrawCanvas();
  }

  // Initialize canvas size
  // TODO: Call resizeCanvas()
  resizeCanvas();
  // Handle window resize
  // TODO: Add an event listener for the 'resize' event that calls resizeCanvas
  window.addEventListener('resize', resizeCanvas);

  // Drawing variables
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Connect to Socket.IO server
  // TODO: Create a socket connection to the server at 'http://localhost:3000'
  const socket = io('http://localhost:3000');
  // TODO: Set up Socket.IO event handlers
  socket.on('connect', () => {
    connectionStatus.textContent = 'Connected';
  });
  socket.on('disconnect', () => {
    connectionStatus.textContent = 'Disconnected';
  });
  socket.on('boardState', (boardState) => {
    redrawCanvas(boardState);
  });
  socket.on('draw', (data) => {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
  });
  socket.on('clear', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
  socket.on('userCount', (count) => {
    userCount.textContent = count;
  });

  // Canvas event handlers
  // TODO: Add event listeners for mouse events (mousedown, mousemove, mouseup, mouseout)
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // Touch support (optional)
  // TODO: Add event listeners for touch events (touchstart, touchmove, touchend, touchcancel)
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('touchcancel', stopDrawing);

  // Clear button event handler
  // TODO: Add event listener for the clear button
  clearButton.addEventListener('click', clearCanvas);

  // Update brush size display
  // TODO: Add event listener for brush size input changes
  brushSizeInput.addEventListener('input', () => {
    const size = brushSizeInput.value;
    brushSizeDisplay.textContent = size;
  });

  // Drawing functions
  function startDrawing(e) {
    // TODO: Set isDrawing to true and capture initial coordinates
    e.preventDefault();
    const coords = getCoordinates(e);
    isDrawing = true;
    lastX = coords.x;
    lastY = coords.y;
  }

  function draw(e) {
    // TODO: If not drawing, return
    if (!isDrawing) return;
    // TODO: Get current coordinates
    const coords = getCoordinates(e);
    // TODO: Emit 'draw' event to the server with drawing data
    socket.emit('draw', {
      x0: lastX,
      y0: lastY,
      x1: coords.x,
      y1: coords.y,
      color: colorInput.value,
      size: brushSizeInput.value
    });
    // TODO: Update last position
    lastX = coords.x;
    lastY = coords.y;
  }

  function drawLine(x0, y0, x1, y1, color, size) {
    // TODO: Draw a line on the canvas using the provided parameters
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();
  }

  function stopDrawing() {
    // TODO: Set isDrawing to false
    isDrawing = false;
  }

  function clearCanvas() {
    // TODO: Emit 'clear' event to the server
    socket.emit('clear');
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function redrawCanvas(boardState = []) {
    // TODO: Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // TODO: Redraw all lines from the board state
    boardState.forEach(line => {
      drawLine(line.x0, line.y0, line.x1, line.y1, line.color, line.size);
    });
  }

  // Helper function to get coordinates from mouse or touch event
  function getCoordinates(e) {
    if (e.type.includes('touch')) {// Get first touch point
      const touch = e.touches[0] || e.changedTouches[0];
      // Get canvas position
      const rect = canvas.getBoundingClientRect();
      // Calculate coordinates relative to canvas
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {// Mouse event
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  }

  // Handle touch events
  function handleTouchStart(e) {
    // Prevent scrolling
    const coords = getCoordinates(e);
    isDrawing = true;
    lastX = coords.x;
    lastY = coords.y;
  }

  function handleTouchMove(e) {
    // TODO: Prevent default behavior and call draw
    e.preventDefault();
    draw(e);
  }
});
