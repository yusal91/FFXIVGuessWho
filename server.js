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

// Helper function to process questions
function processQuestion(question, targetCharacter, remainingCharacters) {
    const lowerQuestion = question.toLowerCase();
    const targetName = targetCharacter.name.toLowerCase();
    
    // Handle direct guess questions
    if (lowerQuestion.includes('is it') || lowerQuestion.includes('are they') || lowerQuestion.includes('does') || lowerQuestion.includes('is your character')) {
        // Extract the guessed name from the question
        const guessMatch = lowerQuestion.match(/(?:is it|are they|is your character)\s+([^?.!]+)/);
        if (guessMatch) {
            const guessedName = guessMatch[1].trim();
            // Check if the guessed name matches any part of the target character name
            const isCorrect = targetName.includes(guessedName.toLowerCase()) || 
                            guessedName.toLowerCase().includes(targetName);
            
            if (isCorrect) {
                return {
                    answer: 'Yes',
                    isGuess: true,
                    isCorrect: true,
                    remainingCharacters: remainingCharacters.filter(char => 
                        char.name.toLowerCase().includes(guessedName.toLowerCase()) || 
                        guessedName.toLowerCase().includes(char.name.toLowerCase())
                    )
                };
            } else {
                return {
                    answer: 'No',
                    isGuess: true,
                    isCorrect: false,
                    remainingCharacters: remainingCharacters.filter(char => 
                        !char.name.toLowerCase().includes(guessedName.toLowerCase()) && 
                        !guessedName.toLowerCase().includes(char.name.toLowerCase())
                    )
                };
            }
        }
    }
    
    // Handle gender questions
    if (lowerQuestion.includes('male') || lowerQuestion.includes('boy') || lowerQuestion.includes('man') || 
        lowerQuestion.includes('female') || lowerQuestion.includes('girl') || lowerQuestion.includes('woman')) {
        const maleCharacters = ['alphinaud', 'thancred', 'urianger', 'estinien', 'aymeric', 'haurchefant', 'raubahn', 'hien', 'graha tia', 'emet-selch', 'crystal exarch', 'zenos', 'cid', 'nero', 'gaius', 'papalymo'];
        const isMale = maleCharacters.some(name => targetName.includes(name));
        
        const askingAboutMale = lowerQuestion.includes('male') || lowerQuestion.includes('boy') || lowerQuestion.includes('man');
        const answer = askingAboutMale ? isMale : !isMale;
        
        return {
            answer: answer ? 'Yes' : 'No',
            isGuess: false,
            remainingCharacters: remainingCharacters.filter(char => {
                const charIsMale = maleCharacters.some(name => char.name.toLowerCase().includes(name));
                return askingAboutMale ? charIsMale : !charIsMale;
            })
        };
    }
    
    // Handle race questions
    if (lowerQuestion.includes('elezen') || lowerQuestion.includes('miqo') || lowerQuestion.includes('lalafel') || 
        lowerQuestion.includes('hyur') || lowerQuestion.includes('roegadyn') || lowerQuestion.includes('au ra')) {
        
        const races = {
            elezen: ['alphinaud', 'alisaie', 'estinien', 'aymeric', 'haurchefant'],
            miqo: ['yshtola', 'g\'raha tia', 'y\'shtola'],
            lalafel: ['tataru', 'papalymo', 'krile'],
            hyur: ['lyse', 'minfilia', 'ryne', 'fordola', 'yda', 'cid', 'nero'],
            roegadyn: ['raubahn', 'merlwyb'],
            'au ra': ['estinien', 'sad-u never']
        };
        
        for (const [race, names] of Object.entries(races)) {
            if (lowerQuestion.includes(race)) {
                const hasRace = names.some(name => targetName.includes(name));
                return {
                    answer: hasRace ? 'Yes' : 'No',
                    isGuess: false,
                    remainingCharacters: remainingCharacters.filter(char => {
                        const charHasRace = names.some(name => char.name.toLowerCase().includes(name));
                        return hasRace ? charHasRace : !charHasRace;
                    })
                };
            }
        }
    }
    
    // Handle scion questions
    if (lowerQuestion.includes('scion') || lowerQuestion.includes('scions of the seventh dawn')) {
        const scions = ['alphinaud', 'alisaie', 'y\'shtola', 'thancred', 'urianger', 'tataru', 'minfilia', 'papalymo', 'yda', 'estinien', 'g\'raha tia', 'krile'];
        const isScion = scions.some(name => targetName.includes(name));
        
        return {
            answer: isScion ? 'Yes' : 'No',
            isGuess: false,
            remainingCharacters: remainingCharacters.filter(char => {
                const charIsScion = scions.some(name => char.name.toLowerCase().includes(name));
                return isScion ? charIsScion : !charIsScion;
            })
        };
    }
    
    // Default answer for unrecognized questions
    return {
        answer: 'No',
        isGuess: false,
        remainingCharacters: remainingCharacters
    };
}

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
                    { id: socket.id, username, character: null },
                    { id: opponent.id, username: opponent.data.username, character: null }
                ],
                characters: [...ffxivCharacters],
                currentTurn: socket.id, // Start with the player who just joined
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
                currentTurn: { id: game.currentTurn, username: game.players.find(p => p.id === game.currentTurn).username }
            });
        }
    });

    // Handle question
    socket.on('ask-question', (data) => {
        const game = games.get(data.gameId);
        if (!game) return;

        // Verify it's this player's turn
        if (game.currentTurn !== socket.id) {
            socket.emit('error', { message: "It's not your turn!" });
            return;
        }

        const opponent = game.players.find(p => p.id !== socket.id);
        if (!opponent || !opponent.character) return;

        // Process the question
        const result = processQuestion(data.question, opponent.character, game.characters);
        
        // Update game state
        game.characters = result.remainingCharacters;
        
        // Switch turns
        game.currentTurn = opponent.id;
        
        // Send response to both players
        io.to(data.gameId).emit('question-result', {
            question: data.question,
            askedBy: socket.data.username,
            answer: result.answer,
            remainingCharacters: game.characters,
            currentTurn: { id: game.currentTurn, username: opponent.username }
        });

        // Check win condition for correct guess
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
        
        // Check win condition if only one character left
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