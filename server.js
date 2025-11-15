const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import the new character system - FIXED PATH
const CharacterDatabase = require('./public/js/CharacterDatabase');
const QuestionProcessor = require('./public/js/QuestionProcessor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

// Initialize character system
const characterDB = new CharacterDatabase();
const questionProcessor = new QuestionProcessor(characterDB);

// Use the character database instead of hardcoded array
const ffxivCharacters = characterDB.getAllCharacters();

// Game state
const waitingPlayers = [];
const games = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('find-match', (username) => {
        socket.data.username = username;
        
        if (waitingPlayers.length > 0) {
            const opponent = waitingPlayers.shift();
            const gameId = `${socket.id}-${opponent.id}`;
            
            const game = {
                id: gameId,
                players: [
                    { id: socket.id, username, character: null },
                    { id: opponent.id, username: opponent.data.username, character: null }
                ],
                characters: [...ffxivCharacters],
                currentTurn: socket.id,
                status: 'character-selection'
            };
            
            games.set(gameId, game);
            socket.join(gameId);
            opponent.join(gameId);
            
            io.to(gameId).emit('game-start', {
                gameId,
                players: game.players,
                characters: game.characters
            });
        } else {
            waitingPlayers.push(socket);
            socket.emit('waiting', 'Looking for an opponent in Eorzea...');
        }
    });

    socket.on('select-character', (data) => {
        const game = games.get(data.gameId);
        if (!game) return;

        const player = game.players.find(p => p.id === socket.id);
        if (player) {
            // Find the full character object from database
            const selectedChar = characterDB.getCharacterById(data.character.id);
            player.character = selectedChar;
        }

        const bothSelected = game.players.every(p => p.character);
        if (bothSelected) {
            game.status = 'playing';
            io.to(data.gameId).emit('game-ready', {
                players: game.players,
                currentTurn: { id: game.currentTurn, username: game.players.find(p => p.id === game.currentTurn).username }
            });
        }
    });

    socket.on('ask-question', (data) => {
        const game = games.get(data.gameId);
        if (!game) return;

        if (game.currentTurn !== socket.id) {
            socket.emit('error', { message: "It's not your turn!" });
            return;
        }

        const opponent = game.players.find(p => p.id !== socket.id);
        if (!opponent || !opponent.character) return;

        // Use the enhanced question processor
        const result = questionProcessor.processQuestion(
            data.question, 
            opponent.character, 
            game.characters
        );
        
        // Update game state
        game.characters = result.remainingCharacters;
        game.currentTurn = opponent.id;
        
        io.to(data.gameId).emit('question-result', {
            question: data.question,
            askedBy: socket.data.username,
            answer: result.answer,
            remainingCharacters: game.characters,
            currentTurn: { id: game.currentTurn, username: opponent.username }
        });

        // Check win conditions
        if (result.isGuess && result.isCorrect) {
            io.to(data.gameId).emit('game-over', {
                winner: socket.data.username,
                winnerId: socket.id,
                character: opponent.character,
                players: game.players
            });
            games.delete(data.gameId);
            return;
        }
        
        if (game.characters.length === 1) {
            const winner = game.players.find(p => p.character.name === game.characters[0].name);
            if (winner) {
                io.to(data.gameId).emit('game-over', {
                    winner: winner.username,
                    winnerId: winner.id,
                    character: winner.character,
                    players: game.players
                });
                games.delete(data.gameId);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitingIndex !== -1) {
            waitingPlayers.splice(waitingIndex, 1);
        }
        
        for (let [gameId, game] of games) {
            const playerInGame = game.players.find(p => p.id === socket.id);
            if (playerInGame) {
                const opponent = game.players.find(p => p.id !== socket.id);
                if (opponent) {
                    io.to(opponent.id).emit('opponent-disconnected');
                }
                games.delete(gameId);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Final Fantasy XIV Guess Who Server running on port ${PORT}`);
});