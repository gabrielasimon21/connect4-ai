var playerRed = "R";
var playerYellow = "Y";
var currPlayer = playerRed;

var gameOver = false;
var board;

var rows = 6;
var columns = 7;
var currColumns = 7;

window.onload = function() {
    setGame();
}

function setGame() {
    board = []
    currColumns = [5, 5, 5, 5, 5, 5, 5]

    for (let r = 0; r < rows; r++){
        let row = []
        for (let c = 0; c < columns; c++){
            //js
            row.push(' ');

            //HTML
            // <div id="0-0" class = "tile"><div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.addEventListener("click", setPiece);
            document.getElementById("board").append(tile);        
        }
        board.push(row);
    }
}

function setPiece() {
    if (gameOver) {
        return;
    }

    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    r = currColumns[c];
    if (r < 0) {
        return;
    }

    board[r][c] = currPlayer
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    if (currPlayer == playerRed) {
       tile.classList.add("red-piece");
       currPlayer = playerYellow;
    } 


    r -= 1; //uptading the row height
    currColumns[c] = r; //uptade the array

    checkWinner();

    // Se o jogo não acabou e o jogador atual é amarelo (yellow), faça a jogada do computador após um pequeno atraso
    if (!gameOver && currPlayer == playerYellow) {
        setTimeout(computerMove, 500); // Chama a função computerMove após 500 milissegundos (0.5 segundo)
    }
}

function computerMove() {
    if (gameOver) {
        return;
    }

    // Serializa o tabuleiro em JSON
    let boardJson = JSON.stringify(board);

    // Solicita a coluna para o movimento do jogador amarelo ao servidor Flask, junto com o estado atual do tabuleiro
    fetch("/aiMove", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: boardJson // Envia o estado atual do tabuleiro no corpo da requisição
    })
    .then(response => response.json())
    .then(data => {
        let c = data.column;
        let r = currColumns[c];

        // Atualiza o tabuleiro e a interface
        board[r][c] = currPlayer;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.classList.add("yellow-piece");

        r -= 1; // Atualiza a altura da linha
        currColumns[c] = r; // Atualiza o array de colunas atuais

        checkWinner();

        // Muda para o próximo jogador
        currPlayer = playerRed;
    })
    .catch(error => {
        console.error("Erro ao obter o movimento do jogador amarelo:", error);
    });
}






function checkWinner() {
    //horizontally --> sliding window
    for (let r = 0; r < rows; r++){
        for (let c = 0; c < columns - 3; c++){
            if (board[r][c] != ' '){
                if (board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    //vertically
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows-3; r++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    //anti diagonally
    for (let r = 0; r < rows-3; r++) {
        for (let c = 0; c < columns-3; c++){
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2] == board[r+3][c+3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
        
    }

    //diagonally
    for (let r=3; r < rows; r++) {
        for (let c = 0; c < columns; c++){
            if (board[r][c] != ' '){
                if (board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

}

function setWinner(r, c) {
    let winner = document.getElementById("winner");
    if (board[r][c] == playerRed) {
        winner.innerText = "Red Wins";
    } else {
        winner.innerText = "Yellow Wins";
    }

    gameOver = true;
}

