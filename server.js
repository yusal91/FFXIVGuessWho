const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// FFXIV Characters Data
const ffxivCharacters = [
    { id: 1, name: "Alphinaud", image: "/images/Alphinaud.png" },
    { id: 2, name: "Alisaie", image: "/images/Alisaie.png" },
    { id: 3, name: "Y'shtola", image: "/images/Yshtola.png" },
    { id: 4, name: "Thancred", image: "/images/Thancred.png" },
    { id: 5, name: "Urianger", image: "/images/Urianger.png" },
    { id: 6, name: "Tataru", image: "/images/Tataru.png" },
    { id: 7, name: "Estinien", image: "/images/Estinien.png" },
    { id: 8, name: "Aymeric", image: "/images/Aymeric.png" },
    { id: 9, name: "Haurchefant", image: "/images/Haurchefant.png" },
    { id: 10, name: "Lyse", image: "/images/Lyse.png" },
    { id: 11, name: "Raubahn", image: "/images/Raubahn.png" },
    { id: 12, name: "Hien", image: "/images/Hien.png" },
    { id: 13, name: "G'raha Tia", image: "/images/GrahaTia.png" },
    { id: 14, name: "Emet-Selch", image: "/images/Emet-Selch.png" },
    { id: 15, name: "Crystal Exarch", image: "/images/Crystal Exarch.png" },
    { id: 16, name: "Ryne", image: "/images/Ryne.png" },
    { id: 17, name: "Zenos", image: "/images/Zenos.png" },
    { id: 18, name: "Fordola", image: "/images/Fordola.png" },
    { id: 19, name: "Minfilia", image: "/images/Minfilia.png" },
    { id: 20, name: "Papalymo", image: "/images/Papalymo.png" },
    { id: 21, name: "Yda", image: "/images/Yda.png" },
    { id: 22, name: "Cid", image: "/images/Cid.png" },
    { id: 23, name: "Nero", image: "/images/Nero.png" },
    { id: 24, name: "Gaius", image: "/images/Gaius.png" }
];

// Game state
const waitingPlayers = [];
const games = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle player looking for match
    socket.on('find-match', (username) => {
        socket.data.username = username;
        
        if (waitingPlayers.length > 0) {
            // Match found - pair with waiting player
            const opponent = waitingPlayers.shift();
            const gameId = `${socket.id}-${opponent.id}`;
            
            // Create game room
            const game = {
                id: gameId,
                players: [
                    { id: socket.id, username, character: null, turn: true },
                    { id: opponent.id, username: opponent.data.username, character: null, turn: false }
                ],
                characters: [...ffxivCharacters],
                status: 'character-selection'
            };
            
            games.set(gameId, game);
            
            // Join both players to room
            socket.join(gameId);
            opponent.join(gameId);
            
            // Start game
            io.to(gameId).emit('game-start', {
                gameId,
                players: game.players,
                characters: game.characters
            });
            
            console.log(`FFXIV Game started: ${gameId}`);
        } else {
            // No match yet - add to waiting list
            waitingPlayers.push(socket);
            socket.emit('waiting', 'Looking for an opponent in Eorzea...');
            console.log('Player waiting:', username);
        }
    });

    // Handle character selection
    socket.on('select-character', (data) => {
        const game = games.get(data.gameId);
        if (!game) return;

        // Set character for player
        const player = game.players.find(p => p.id === socket.id);
        if (player) {
            player.character = data.character;
        }

        // Check if both players have selected characters
        const bothSelected = game.players.every(p => p.character);
        if (bothSelected) {
            game.status = 'playing';
            io.to(data.gameId).emit('game-ready', {
                players: game.players,
                currentTurn: game.players.find(p => p.turn)
            });
        }
    });

    // Handle question
    socket.on('ask-question', (data) => {
        const game = games.get(data.gameId);
        if (!game) return;

        // Verify it's this player's turn
        const currentPlayer = game.players.find(p => p.turn);
        if (currentPlayer.id !== socket.id) return;

        // Process question and eliminate characters
        const opponent = game.players.find(p => p.id !== socket.id);
        const answer = data.question.toLowerCase().includes(opponent.character.name.toLowerCase());
        
        // Eliminate characters based on answer
        if (answer) {
            // Keep only characters that match the question
            game.characters = game.characters.filter(char => 
                data.question.toLowerCase().includes(char.name.toLowerCase())
            );
        } else {
            // Remove characters that match the question
            game.characters = game.characters.filter(char => 
                !data.question.toLowerCase().includes(char.name.toLowerCase())
            );
        }

        // Switch turns
        game.players.forEach(p => p.turn = !p.turn);
        const newTurnPlayer = game.players.find(p => p.turn);

        // Send response
        io.to(data.gameId).emit('question-result', {
            question: data.question,
            askedBy: socket.data.username,
            answer: answer ? 'Yes' : 'No',
            remainingCharacters: game.characters,
            currentTurn: newTurnPlayer
        });

        // Check win condition
        if (game.characters.length === 1) {
            const winner = game.players.find(p => p.character.name === game.characters[0].name);
            io.to(data.gameId).emit('game-over', {
                winner: winner.username,
                character: winner.character
            });
            games.delete(data.gameId);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove from waiting list
        const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitingIndex !== -1) {
            waitingPlayers.splice(waitingIndex, 1);
        }
        
        // Handle game cleanup
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

// ✅ CRITICAL FOR RAILWAY - This must be at the bottom
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Final Fantasy XIV Guess Who Server running on port ${PORT}`);
});