let revealedCount ;
let nonMineCells;
let firstClick;

// Get the game board element from the HTML
const gameBoard = document.getElementById("game-board");

let board = [];

// Initialize the game when the page loads
createGrid();

// Restart game
document.getElementById('start-button').addEventListener('click', restartGame);

// Function to create the game grid
function createGrid() {
  gameBoard.innerHTML = "";  // Clear any existing content

  // Set game parameters based on difficulty
  const difficulty = document.getElementById("difficulty").value;

  if (difficulty === "easy") {
    rows = 8;
    cols = 10;
    totalMines = 10;
  } else if (difficulty === "medium") {
    rows = 14;
    cols = 18;
    totalMines = 35;
  } else if (difficulty === "hard") {
    rows = 20;
    cols = 24;
    totalMines = 90;
  }

  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
  gameBoard.style.gridTemplateRows = `repeat(${rows}, 30px)`;

  firstClick = true;
  let flagsLeft = totalMines;
  revealedCount = 0
  nonMineCells = rows * cols - totalMines;  // Total cells without mines

  document.getElementById("mines-count").textContent = totalMines;
  flagsLeft = totalMines;

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      // Create a button for each cell
      const cell = document.createElement("button");
      cell.classList.add("cell");
      gameBoard.appendChild(cell);  // Add button to the grid container
      // Store the button reference in the board array for later use
      board[r][c] = {
        element: cell,  // Link button to board data
        isMine: false,
        isRevealed: false,  // Whether this cell has been revealed
        isFlagged: false
      };
            
      // Add click event to handle normal clicks
      cell.addEventListener('click', () => handleClick(r, c));
            
      // Add right-click event to flag the cell
      cell.addEventListener('contextmenu', (event) => {
      event.preventDefault();  // Prevent the default context menu
      toggleFlag(r, c, flagsLeft);  // Toggle flag on right-click
      });
    }
  }
}

// Function to randomly place mines
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Ensure that a mine is not placed in the first clicked cell
      if (r === firstRow && c === firstCol) {
        continue;
      }

      if (!board[r][c].isMine) {
        board[r][c].isMine = true;
        minesPlaced++;
      }
    }
}

function handleClick(r, c) {
  if (firstClick) {
    firstClick = false;  // Set to false after the first click
    placeMines(r, c);  // Place mines, ensuring the clicked cell doesn't have one
  }

  if (board[r][c].isRevealed) return;  // Ignore clicks on already revealed cells
  
  board[r][c].isRevealed = true;
  revealedCount++ ;
  const cell = board[r][c].element;
  cell.style.backgroundColor = '#b0b0b0';

  if (board[r][c].isMine) {
    cell.textContent = "💣";  // Display mine
    revealAllMines();  // Reveal all mines on game over
    alert("Game Over! 💔");  // Simple alert for game over
  } else {
    const adjacentMines = countAdjacentMines(r, c);
    cell.textContent = adjacentMines > 0 ? adjacentMines : "";  // Show number or empty
    cell.disabled = true;  // Disable the button once revealed
    
    if (adjacentMines === 0) {
      revealEmptyCells(r, c);  // Optionally, reveal neighboring cells if no adjacent mines
    }

    //check for win
    if (revealedCount === nonMineCells) {
      alert("Congratulations! You won! 🎉");
      disableBoard();
      document.getElementById("mines-count").textContent = 0;
    }
  }

    
}

function countAdjacentMines(r, c) {
    let mineCount = 0;
  
    // Check all 8 surrounding cells
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        // Skip the cell itself
        if (rowOffset === 0 && colOffset === 0) continue;
  
        const newRow = r + rowOffset;
        const newCol = c + colOffset;
  
        // Check if the new row and column are within bounds
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          // If the neighboring cell is a mine, increment the count
          if (board[newRow][newCol].isMine) {
            mineCount++;
          }
        }
      }
    }
  
    return mineCount;  // Return the total count of adjacent mines
}

// Restart game function
function restartGame() {
    board = [];
    createGrid();
    
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
      cell.textContent = '';
      cell.disabled = false;
    });
}

function revealEmptyCells(r,c) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            // Skip the current cell itself , the ones out of bound , and the already revealed ones
            const newRow = r + rowOffset;
            const newCol = c + colOffset;
            if (rowOffset === 0 && colOffset === 0) continue;
            if (newRow<0 || newRow>=rows || newCol<0 || newCol>=cols) continue;
            if (board[newRow][newCol].isRevealed) continue;
            
            // Recursively reveal the neighbors
            handleClick(newRow, newCol);
        }
    }
}

function revealAllMines() {
    // Loop through every cell on the board
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = board[r][c].element;
            cell.disabled = true;  // Disable the cell (no further interaction)
            // Check if the cell contains a mine
            if (board[r][c].isMine) {
                // Reveal the mine by setting its text content to a bomb emoji (💣)
                cell.textContent = "💣";
            }
        }
    }
}

function toggleFlag(r, c, flagsLeft) {
  const cell = board[r][c].element;
  if (board[r][c].isRevealed) return;  // Don't allow flagging on revealed cells

  if (board[r][c].isFlagged) {
    // If the cell is already flagged, unflag it
    cell.textContent = '';  // Clear the flag symbol
    board[r][c].isFlagged = false;
    flagsLeft ++ ;
  } else {
    // Flag the cell
    cell.textContent = '🚩';  // Display the flag symbol
    board[r][c].isFlagged = true;
    flagsLeft --;
  }

  // Update the UI to show the number of flags left
  document.getElementById("mines-count").textContent = flagsLeft;

}

function disableBoard() {
  // Loop through every cell on the board
  for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
          const cell = board[r][c].element;
          cell.disabled = true;  // Disable the cell (no further interaction)
      }
  }
}