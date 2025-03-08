const gameCells = document.querySelectorAll('.gamecell');
const resetButton = document.querySelector('main button');
const turnIndicator = document.querySelector('#turn-indicator');
const namesDialog = document.querySelector('.names-dialog');
const namesForm = document.querySelector('#names-form');
const resultDialog = document.querySelector('.result-dialog');
const resultMessage = document.querySelector('#result-message');
const playAgainButton = document.querySelector('#play-again-button');

// Player Factory Function
const Player = (name, symbol) => {
    const getSymbol = () => symbol;
    const getName = () => name;
    return { getSymbol, getName };
};

// Game Initialization after player names being chosen
function gameInitialization(player1, player2) {
    const gameBoard = (() => {
        let gameBoardArray = Array(9).fill(null);

        const addToArray = (symbol, position) => {
            gameBoardArray[position] = symbol;
        };

        const clearArray = () => {
            gameBoardArray.fill(null);
        };

        const getGameBoardRows = () => {
            const rows = [];
            for (let i = 0; i < 9; i += 3) {
                rows.push(gameBoardArray.slice(i, i + 3));
            }
            return rows;
        };

        const getGameBoardColumns = () => {
            const columns = [[], [], []];
            for (let i = 0; i < 9; i++) {
                columns[i % 3].push(gameBoardArray[i]);
            }
            return columns;
        };

        const getGameBoardDiagonals = () => {
            return [
                [gameBoardArray[0], gameBoardArray[4], gameBoardArray[8]],
                [gameBoardArray[2], gameBoardArray[4], gameBoardArray[6]]
            ];
        };

        const areItemsOfArrayEqual = (arr) => {
            const firstItem = arr[0];
            if (firstItem === null) return false;
            return arr.every(item => item === firstItem);
        };

        const checkWinner = () => {
            const gameRows = getGameBoardRows();
            const gameColumns = getGameBoardColumns();
            const gameDiagonals = getGameBoardDiagonals();
            const gameCombinations = [...gameRows, ...gameColumns, ...gameDiagonals];

            for (const combination of gameCombinations) {
                if (areItemsOfArrayEqual(combination)) {
                    return {
                        hasSomeoneWon: true,
                        winnerSymbol: combination[0],
                        tie: false
                    };
                }
            }

            if (!gameBoardArray.includes(null)) {
                return {
                    hasSomeoneWon: false,
                    winnerSymbol: null,
                    tie: true
                };
            }

            return {
                hasSomeoneWon: false,
                winnerSymbol: null,
                tie: false
            };
        };

        return { addToArray, clearArray, checkWinner };
    })();

    const displayController = (() => {
        const addPlayerSymbol = (target, symbol) => {
            target.textContent = symbol;
        };

        const changePlayerTurnTitle = (message) => {
            turnIndicator.textContent = message;
        };

        const showResultDialog = (message) => {
            resultMessage.textContent = message;
            resultDialog.showModal();
        };

        const cleanGameboard = () => {
            gameCells.forEach(cell => cell.textContent = '');
        };

        return { addPlayerSymbol, changePlayerTurnTitle, showResultDialog, cleanGameboard };
    })();

    const game = ((firstPlayer, secondPlayer) => {
        let currentPlayer = firstPlayer;
        let gameEnded = false;

        // Initialization of PlayerTurnTitle
        displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);

        const makePlayerMove = (cell, player) => {
            if (cell.textContent !== '') return true;

            displayController.addPlayerSymbol(cell, player.getSymbol());
            gameBoard.addToArray(player.getSymbol(), cell.dataset.position);
            return false;
        };

        const parseSymbolToPlayer = (symbol) => {
            if (symbol === firstPlayer.getSymbol()) return firstPlayer;
            if (symbol === secondPlayer.getSymbol()) return secondPlayer;
            throw new Error('Invalid symbol provided');
        };

        const processGameResult = () => {
            const result = gameBoard.checkWinner();
            if (result.hasSomeoneWon) {
                const winnerPlayer = parseSymbolToPlayer(result.winnerSymbol);
                displayController.showResultDialog(`${winnerPlayer.getName()} Wins!`);
                gameEnded = true;
            } else if (result.tie) {
                displayController.showResultDialog("It's a Tie!");
                gameEnded = true;
            }
        };

        const changePlayerTurn = () => {
            if (gameEnded) return;
            currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
            displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
        };

        const doPlayerTurn = (e) => {
            if (gameEnded) return;

            const isCellTaken = makePlayerMove(e.target, currentPlayer);
            if (isCellTaken) return;

            processGameResult();
            changePlayerTurn();
        };

        const cleanGame = () => {
            displayController.cleanGameboard();
            gameBoard.clearArray();
            currentPlayer = firstPlayer;
            displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
            gameEnded = false;
            resultDialog.close();
        };

        return { doPlayerTurn, cleanGame };
    })(player1, player2);

    // Event Listeners
    resetButton.addEventListener('click', game.cleanGame);
    playAgainButton.addEventListener('click', game.cleanGame);

    gameCells.forEach(cell => {
        cell.addEventListener('click', game.doPlayerTurn);
    });
}

// Show Names Dialog and Initialize Game
namesDialog.showModal();
namesForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const player1Name = document.querySelector('#name1').value.trim();
    const player2Name = document.querySelector('#name2').value.trim();

    if (player1Name && player2Name) {
        const player1 = Player(player1Name, 'X');
        const player2 = Player(player2Name, 'O');
        namesDialog.close();
        gameInitialization(player1, player2);
    }
});