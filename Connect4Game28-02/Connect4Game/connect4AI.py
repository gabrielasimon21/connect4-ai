from flask import Flask, render_template, request, jsonify
import random
import json

app = Flask(__name__, template_folder='static')

playerRed = "R"
playerYellow = "Y" #This is AI
rows = 6
columns = 7

def heuristic(board):
    scoreAI = 0
    scoreOpp = 0
    
    #Linha com 1 (Proprio Jogador)
    scoreAI += 1 * possibleWins(board, 1, playerYellow)
    
    #Linha com 2 (Proprio Jogador)
    
    scoreAI += 4 * possibleWins(board, 2, playerYellow)
    
    #Linha com 3 (Proprio Jogador)
    scoreAI += 40 * possibleWins(board, 3, playerYellow)
    
    #Linha com 4 (Proprio Jogador)
    scoreAI += 100 * possibleWins(board, 4, playerYellow)
    
    #Linha com 1 (Inimigo)
    scoreOpp += 0 * possibleWins(board, 1, playerRed)
    
    #Linha com 2 Inimigo)
    scoreOpp += 20 * possibleWins(board, 2, playerRed)
    
    #Linha com 3 (Inimigo)
    scoreOpp += 1000 * possibleWins(board, 3, playerRed)
    
    #Linha com 4 (Inimigo)
    #scoreOpp += 1000 * possibleWins(board, 4, playerRed)
   
    return scoreAI - scoreOpp

def possibleWins(board, lineSize, player):
    occurrences = 0
    opponent = " "
    if player == playerRed:
        opponent = playerYellow
    else:
        opponent = playerRed
        
    #Possibilidades Vertical
    for column in range(columns):
        for row in range(rows-3):
            groupOf4 = [board[row + i][column] for i in range(4)]
            
            pieceType = {"R": 0, "Y": 0, " ": 0}
            for piece in groupOf4:
                pieceType[piece] += 1
            
            if pieceType[opponent] != 0:
                continue
            else:
                if pieceType[player] == lineSize:
                    occurrences += 1
    
    #Possibilidades Horizontais                
    for row in range(rows):
        for column in range(columns-3):
            groupOf4 = [board[row][column + i] for i in range(4)]
            
            pieceType = {"R": 0, "Y": 0, " ": 0}
            for piece in groupOf4:
                pieceType[piece] += 1
            
            if pieceType[opponent] != 0:
                continue
            else:
                if pieceType[player] == lineSize:
                    occurrences += 1
    
    #Possibilidades Diagnonais
    for row in range(rows-3):
        for column in range(columns-3):
            groupOf4 = [board[row + i][column + i] for i in range(4)]
            
            pieceType = {"R": 0, "Y": 0, " ": 0}
            for piece in groupOf4:
                pieceType[piece] += 1
            
            if pieceType[opponent] != 0:
                continue
            else:
                if pieceType[player] == lineSize:
                    occurrences += 1
    
    #Possibilidades Diagnonais Inversa
    for row in range(rows-3):
        for column in range(3, columns):
            groupOf4 = [board[row + i][column - i] for i in range(4)]
            
            pieceType = {"R": 0, "Y": 0, " ": 0}
            for piece in groupOf4:
                pieceType[piece] += 1
            
            if pieceType[opponent] != 0:
                continue
            else:
                if pieceType[player] == lineSize:
                    occurrences += 1

    return occurrences

def availableMoves(board):
    available_coordinates = []
    for col in range(7):
        for row in range(5, -1, -1):
            if board[row][col] == ' ':
                available_coordinates.append(f"{row}-{col}")
                break
    return available_coordinates

def ai_move(board):
    available_cols = availableMoves(board)
    best_score = float('-inf')
    best_column = None
    scores = {}  # Dicionário para armazenar as pontuações de cada coluna
    for col in available_cols:
        board_copy = [row[:] for row in board]
        row, column = map(int, col.split("-"))
        board_copy[row][column] = playerYellow
        score = heuristic(board_copy)
        scores[col] = score  # Armazena a pontuação calculada para esta coluna
        if score > best_score:
            best_score = score
            best_column = column
    return best_column, scores  # Retorna a melhor coluna e o dicionário de pontuações


@app.route("/")
def home():
    return render_template("connect4.html")

@app.route("/aiMove", methods=["POST"])
def get_move():
    board = request.json
    
    
    column, scores = ai_move(board)  # Obtém a melhor coluna e o dicionário de pontuações
    print("Pontuações:", scores)  # Imprime o dicionário de pontuações
    return jsonify({"column": column})


if __name__ == "__main__":
    app.run(debug=True)


