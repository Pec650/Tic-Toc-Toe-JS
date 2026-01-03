class Game {
    /* <== HTML ELEMENTS ==> */
    gameText;
    undoButton;
    resetButton;
    board;
    buttons;
    /* <===================> */

    /* <== ASSETS VARIABLES ==> */
    popSE = "./assets/sounds/pop.mp3";
    undoPopSE = "./assets/sounds/pop2.mp3";
    winPopSE = "./assets/sounds/winpop.mp3";
    tiePopSE = "./assets/sounds/tiepop.mp3";
    /* <======================> */

    /* <== BOARD VARIABLES ==> */
    row = 3;
    column = 3;
    boardSize = this.row * this.column;
    boardData = Array.from({length: this.row}, () => Array.from({length: this.column}, () => ' ')); // 2D ARRAY FOR THE BOARD
    /* <=====================> */

    /* <== GAMEPLAY VARIABLES ==> */
    HistoryData = new Stack();
    InitialPlayerTurn = true; // CONSTANT, IT DETERMINES IF PLAYER IS FIRST TO PLAY
    PlayersTurn = this.InitialPlayerTurn;
    PlayersLetter = 'X';
    OpponentsLetter = 'O';
    CPUInterval = null;
    WinnerTiles = null;
    endGame = false;
    endGameType = -2;
    /* <========================> */

    constructor(board, gameText, undoButton, resetButton) {
        
        /* <== INITIALIZATION ==> */
        this.gameText = gameText;
        
        this.undoButton = undoButton;
        this.updateButton(this.undoButton, false);
        this.resetButton = resetButton;
        this.updateButton(this.resetButton, false);

        this.board = board;

        for (let index = 0; index < this.boardSize; ++index) {
            const button = document.createElement("div");
            button.classList.add(index);
            button.classList.add("active");
            button.id = "button"+index;
            const matrix = this.convertToRowColumn(index);
            button.innerText = this.boardData[matrix.row][matrix.column];
            this.board.appendChild(button);
        }
        this.buttons = this.board.querySelectorAll("div");

        this.updateBoardTexture(false);
        /* <====================> */

        /* <== GAMEPLAY ==> */
        this.cpuPlays();
        
        this.buttons.forEach((button, index) => {
            const matrix = this.convertToRowColumn(index);
            button.addEventListener("click", () => {
                if (this.isButtonActive(button) && this.PlayersTurn) {
                    this.updateButton(this.undoButton, true);
                    this.updateButton(this.resetButton, true);
                    this.updateBoardData(matrix.row, matrix.column);
                    this.cpuPlays();
                }
            });
        });
        /* <==============> */
    }

    resetCPUInterval() {
        if (this.CPUInterval != null) {
            clearTimeout(this.CPUInterval);
            this.CPUInterval = null;
        }
    }

    cpuPlays() {
        if (!this.PlayersTurn && !this.endGame) {
            this.resetCPUInterval();
            this.temporyInactive(true);
            this.CPUInterval = setTimeout(() => {
                this.cpuTurn();
                if (!this.endGame) this.temporyInactive(false);
            }, 500);
        }
    }

    updateBoardData(row, column) {
        if (this.validRowColumn(row, column) && this.boardData[row][column] == ' ') {
            this.playSound(this.popSE);
            this.boardData[row][column] = (this.PlayersTurn) ? this.PlayersLetter : this.OpponentsLetter;
            this.updateHistoryData(this.PlayersTurn, row, column);
            this.updateBoardTexture(true, row, column);
        }
    }

    updateBoardTexture(performMove, row, column) {
        if (performMove) {
            const index = this.convertToIndex(row, column);
            if (this.validIndex(index)) {
                const button = this.board.querySelector("#button"+index);
                this.updateButton(button, false);
                if (this.PlayersTurn) {
                    button.innerText = this.boardData[row][column];
                    button.classList.add("xTile");
                } else {
                    button.innerText = this.boardData[row][column];
                    button.classList.add("oTile");
                }
                this.PlayersTurn = !this.PlayersTurn;
            }
        }
        
        this.updateGameText();
    }

    updateGameText() {
        this.endGameType = this.terminatingState(this.boardData);
        this.endGame = this.isTerminatingState(this.boardData);

        if (this.endGame) {
            switch(this.endGameType) {
                case -1:
                    this.gameText.firstElementChild.innerText = this.PlayersLetter + " WINS";
                    this.gameText.style.backgroundColor = "#edc14a";
                    break;
                case 0:
                    this.gameText.firstElementChild.innerText = "TIE";
                    this.gameText.style.backgroundColor = "#555368";
                    break;
                case 1:
                    this.gameText.firstElementChild.innerText = this.OpponentsLetter + " WINS";
                    this.gameText.style.backgroundColor = "#d74368ff";
                    break;
            }
            this.buttons.forEach(button => {
                button.classList.remove("active"); 
            });
            const delay = (this.endGameType != 0) ? 250 : 50;
            let i = 0;
            for (const index of this.WinnerTiles) {
                if (this.endGame) {
                    setTimeout(() => {
                        if (this.endGame) {
                            const button = this.board.querySelector("#button"+index);
                            button.classList.add("end-game");
                            if (this.endGameType != 0) {
                                this.playSound(this.winPopSE);
                            } else {
                                this.playSound(this.tiePopSE);
                            }
                            setTimeout(() => { button.classList.remove("end-game")}, 400);
                        }
                    }, i * delay);
                    ++i;
                } else break;
            }
        } else {
            if (this.PlayersTurn) {
                this.gameText.firstElementChild.innerText = this.PlayersLetter + " TURN";
                this.gameText.style.backgroundColor = "#edc14a";
            } else {
                this.gameText.firstElementChild.innerText = this.OpponentsLetter + " TURN";
                this.gameText.style.backgroundColor = "#d74368ff";
            }
        }
    }

    updateHistoryData(isPlayerTurn, row, column) {
        const newHistory = {
            playerTurn: isPlayerTurn,
            row: row,
            column: column
        };
        this.HistoryData.push(newHistory);
    }

    undoGameData() {
        this.endGame = false;
        this.endGameType = -2;
        const undoLimit = (this.PlayersTurn) ? 2 : 1;
        for (let i = 0; i < undoLimit && !this.HistoryData.isEmpty(); ++i) {
            const lastHistory = this.HistoryData.pop();
            if (lastHistory != null) {
                this.resetCPUInterval();
                const row = lastHistory.row;
                const column = lastHistory.column;
                this.boardData[row][column] = ' ';
                this.PlayersTurn = lastHistory.playerTurn;
                this.clearButton(row, column);
                this.updateGameText();
                this.cpuPlays();
            }
        }
        this.temporyInactive(false);
        this.playSound(this.undoPopSE);
        if (this.HistoryData.isEmpty()) {
            this.updateButton(this.undoButton, false);
            this.updateButton(this.resetButton, false);
        }
    }

    resetGame() {
        this.endGame = false;
        this.endGameType = -2;
        this.HistoryData.reset();
        this.resetCPUInterval();
        for (let index = 0; index < this.boardSize; ++index) {
            const matrix = this.convertToRowColumn(index);
            this.boardData[matrix.row][matrix.column] = ' ';
            this.PlayersTurn = this.InitialPlayerTurn;
            this.clearButton(matrix.row, matrix.column);
        }
        this.temporyInactive(false);
        this.playSound(this.undoPopSE);
        this.updateGameText();
        this.updateButton(this.undoButton, false);
        this.updateButton(this.resetButton, false);
        this.cpuPlays();
    }

    clearButton(row, column) {
        const index = this.convertToIndex(row, column);
        const button = this.board.querySelector("#button"+index);
        button.innerText = ' ';
        button.classList.remove("end-game");
        button.classList.remove("inactive");
        button.classList.remove("xTile");
        button.classList.remove("oTile");
        button.classList.add("active");
        button.classList.add("undo-tile");
        setTimeout(() => { button.classList.remove("undo-tile"); }, 200);
    }

    updateButton(button, active) {
        if (active) {
            button.classList.remove("inactive");
            button.classList.add("active");
        }  else {
            button.classList.remove("active");
            button.classList.add("inactive");
            button.classList.add("tile-clicked");
            setTimeout(() => { button.classList.remove("tile-clicked"); }, 200);
        }
    }

    isButtonActive(button) { return !button.classList.contains("inactive") && !this.endGame; }

    temporyInactive(inactive) {
        this.buttons.forEach(button => {
            if (this.isButtonActive(button)) {
                if (inactive) button.classList.remove("active");
                else button.classList.add("active");
            }
            button.classList.remove("end-game");
        });
    }

    isWinner(board, player) {
        if (player === this.PlayersLetter || player === this.OpponentsLetter) {
            const winConditions = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            for (const win of winConditions) {
                let hasWon = true;
                for (const index of win) {
                    const matrix = this.convertToRowColumn(index);
                    if (board[matrix.row][matrix.column] != player) {
                        hasWon = false;
                        break;
                    }
                }
                if (hasWon) {
                    this.WinnerTiles = win;
                    return true;
                }
            }
        }
        this.WinnerTiles = null;
        return false;
    }

    isFilled(board) { 
        if (!board.flat().includes(' ')) {
            this.WinnerTiles = Array.from({ length: this.boardSize }, (_, i) => i);
            return true;
        } else {
            this.WinnerTiles = null;
            return false;
        }
    }

    terminatingState(board) {
        if (this.isWinner(board, this.PlayersLetter)) return -1;
        if (this.isWinner(board, this.OpponentsLetter)) return 1;
        if (this.isFilled(board)) return 0;
        return -2;
    }

    isTerminatingState(board) {
        return this.terminatingState(board) != -2;
    }

    cpuTurn() {
        const bestMove = this.getBestMove(this.boardData, !this.PlayersTurn);
        if (this.validIndex(bestMove)) {
            const matrix = this.convertToRowColumn(bestMove);
            this.updateBoardData(matrix.row, matrix.column);
        } else {
            let row = 0, column = 0;
            for (; row < this.row; ++row) {
                for (; column < this.column; ++column) {
                    if (this.boardData[row][column] == ' ') break;
                }
            }
            if (this.validRowColumn(row, column)) this.updateBoardData(row, column);
            else this.PlayersTurn = !this.PlayersTurn;
        }
    }

    getBestMove(board, isMaxPlayer) {
        let bestVal = (isMaxPlayer) ? -Infinity : Infinity;
        let bestMoveIdx = -1;
        for (let index = 0; index < this.boardSize; ++index) {
            const curBoard = this.nextMove(board, index, isMaxPlayer);
            if (curBoard != null) {
                const moveVal = this.minimax(curBoard, !isMaxPlayer);
                if (isMaxPlayer) {
                    if (moveVal > bestVal) {
                        bestVal = moveVal;
                        bestMoveIdx = index;
                    }
                    if (bestVal == 1) return bestMoveIdx;
                } else {
                    if (moveVal < bestVal) {
                        bestVal = moveVal;
                        bestMoveIdx = index;
                    }
                    if (bestVal == -1) return bestMoveIdx;
                }
            }
        }
        return bestMoveIdx;
    }

    nextMove(board, index, isMaxPlayer) {
        if (this.validIndex(index)) {
            const curBoard = board.map(row => [...row]);
            const matrix = this.convertToRowColumn(index);
            if (curBoard[matrix.row][matrix.column] == ' ') {
                curBoard[matrix.row][matrix.column] = (isMaxPlayer) ? this.OpponentsLetter : this.PlayersLetter;
                return curBoard;
            }
        }
        return null;
    }

    minimax(board, isMaxPlayer) {
        if (this.isTerminatingState(board)) {
            return this.terminatingState(board);
        }

        if (isMaxPlayer) {
            let bestVal = -Infinity;
            for (let index = 0; index < this.boardSize; ++index) {
                const curBoard = this.nextMove(board, index, true);
                if (curBoard != null) {
                    const value = this.minimax(curBoard, false);
                    bestVal = this.max(bestVal, value);
                }
            }
            return bestVal;
        } else {
            let bestVal = Infinity;
            for (let index = 0; index < this.boardSize; ++index) {
                const curBoard = this.nextMove(board, index, false);
                if (curBoard != null) {
                    const value = this.minimax(curBoard, true);
                    bestVal = this.min(bestVal, value);
                }
            }
            return bestVal;
        }
    }

    playSound(url) {
        const sound = new Audio(url);
        sound.play();
    }

    convertToIndex(row, column) {
        return row * this.column + column;
    }

    convertToRowColumn(index) {
        return {
            row: Math.floor(index / this.row),
            column: index % this.column
        };
    }

    validIndex(index) {
        return index >= 0 && index < this.boardSize;
    }

    validRowColumn(row, column) {
        const index = this.convertToIndex(row, column);
        return this.validIndex(index);
    }

    max (a, b) { return (a > b) ? a : b; }
    min (a, b) { return (a < b) ? a : b; }
}

class Stack {
    stack = [];

    push(data) {
        this.stack.push(data);
    }

    pop() {
        let data = null;
        if (!this.isEmpty()) {
            data = this.stack.pop();
        }
        return data;
    }

    isEmpty() {
        return this.stack.length == 0;
    }

    reset() {
        this.stack.length = 0;
    }
}