class Game {

    /* <== HTML ELEMENTS ==> */
    gameText;
    resetButton;
    board;
    buttons;
    /* <===================> */

    /* <== BOARD VARIABLES ==> */
    row = 3;
    column = 3;
    boardSize = this.row * this.column;
    boardData = Array.from({length: this.row}, () => Array.from({length: this.column}, () => ' ')); // 2D ARRAY FOR THE BOARD
    /* <=====================> */

    /* <== ASSETS VARIABLES ==> */
    popSE = './assets/sounds/pop.mp3';
    /* <======================> */

    /* <== GAMEPLAY VARIABLES ==> */
    PlayersTurn = true;
    PlayersLetter = 'X';
    OpponentsLetter = 'O';
    endGame = false;
    endGameType = -2;
    /* <========================> */

    constructor(board, gameText, resetButton) {
        
        /* <== INITIALIZATION ==> */
        this.gameText = gameText;
        this.resetButton = resetButton;
        this.board = board;

        for (let index = 0; index < this.boardSize; ++index) {
            const button = document.createElement('div');
            button.classList.add(index);
            button.id = "button"+index;
            const matrix = this.convertToRowColumn(index);
            button.innerText = this.boardData[matrix.row][matrix.column];
            this.board.appendChild(button);
        }
        this.buttons = this.board.querySelectorAll("div");

        this.updateBoardTexture(false);
        /* <====================> */

        /* <== GAMEPLAY ==> */
        this.buttons.forEach((button, index) => {
            const matrix = this.convertToRowColumn(index);
            button.addEventListener("click", () => {
                if (this.isButtonActive(button)) {
                    this.updateBoardData(matrix.row, matrix.column);
                    if (!this.endGame) {
                        this.temporyInactive(true);
                        setTimeout(() => {
                            this.cpuTurn();
                            if (!this.endGame) this.temporyInactive(false);
                        }, 500);
                    }
                }
            });
        });
        /* <==============> */
    }

    playPopSound(url) {
        const sound = new Audio(url);
        sound.play();
    }

    updateBoardData(row, column) {
        if (this.validRowColumn(row, column)) {
            this.boardData[row][column] = (this.PlayersTurn) ? this.PlayersLetter : this.OpponentsLetter;
            this.updateBoardTexture(true, row, column);
        }
    }

    updateBoardTexture(performMove, row, column) {
        if (performMove) {
            const index = this.convertToIndex(row, column);
            if (this.validIndex(index)) {
                const button = this.board.querySelector("#button"+index);
                if (this.PlayersTurn) {
                    button.innerText = this.boardData[row][column];
                    button.style.backgroundColor = "#edc14a";
                } else {
                    button.innerText = this.boardData[row][column];
                    button.style.backgroundColor = "#d74368ff";
                }
                this.playPopSound(this.popSE);
                button.classList.add('tile-clicked');
                button.classList.add('inactive');
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
            this.resetButton.style.display = "block";
            this.buttons.forEach(button => { button.classList.add('inactive'); });
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

    isButtonActive(button) { return !button.classList.contains('inactive') && !this.endGame; }

    temporyInactive(inactive) {
        this.buttons.forEach(button => {
            if (this.isButtonActive(button)) button.style.pointerEvents = (inactive) ? "none" : "auto";
        });
    }

    isWinner(board, player) {
        if (player === this.PlayersLetter || player === this.OpponentsLetter) {
            const b = board;
            /* ROW WINNER */
            for (let r = 0; r < this.row; r++) { if (b[r].every(c => c === player)) return true; }
            /* COLUMN WINNER */
            for (let c = 0; c < this.row; c++) { if (b.every(row => row[c] === player)) return true; }
            /* DIAGONAL WINNER */
            if (b.every((row, i) => row[i] === player)) return true;
            /* ANTI-DIAGONAL WINNER */
            if (b.every((row, i) => row[this.row - 1 - i] === player)) return true;
        }
        return false;
    }

    isFilled(board) { return !board.flat().includes(' '); }

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
            this.PlayersTurn = !this.PlayersTurn;
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