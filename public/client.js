class FFXIVGuessWhoGame {
        constructor() {
        this.socket = io();
        this.currentGame = null;
        this.setupEventListeners();
        this.setupSocketListeners();
        this.setupTurnNotifications(); // ← ADD THIS LINE
    }

    setupTurnNotifications() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                40% { transform: translate(-50%, -50%) scale(1); }
                60% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
            .turn-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #ffcc00, #e6b800);
                color: #1a2a6c;
                padding: 20px 40px;
                border-radius: 15px;
                font-size: 1.8rem;
                font-weight: bold;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
                text-align: center;
                animation: fadeInOut 2s ease-in-out;
                border: 3px solid #1a2a6c;
                text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    showTurnNotification(playerName) {
        const notification = document.createElement('div');
        notification.className = 'turn-notification';
        notification.textContent = `${playerName} Turn!`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }

    setupEventListeners() {
        // Login screen
        document.getElementById('find-match-btn').addEventListener('click', () => this.findMatch());
        document.getElementById('username-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findMatch();
        });

        // Waiting screen
        document.getElementById('cancel-search').addEventListener('click', () => this.cancelSearch());

        // Game screen
        document.getElementById('send-question').addEventListener('click', () => this.sendQuestion());
        document.getElementById('question-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendQuestion();
        });

        // Game over screen
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());

        // Character panel
        document.getElementById('panel-toggle').addEventListener('click', () => this.togglePanel());
    }

    setupSocketListeners() {
        this.socket.on('waiting', (message) => {
            this.showScreen('waiting-screen');
            console.log('Waiting for opponent...');
        });

        this.socket.on('game-start', (data) => {
            this.currentGame = data;
            this.showScreen('character-selection');
            this.renderCharacterSelection(data.characters);
        });

        this.socket.on('game-ready', (data) => {
            this.showScreen('game-screen');
            this.initializeGame(data);
        });

        this.socket.on('question-result', (data) => {
            this.handleQuestionResult(data);
        });

        this.socket.on('game-over', (data) => {
            this.showGameOver(data);
        });

        this.socket.on('opponent-disconnected', () => {
            alert('Your opponent has returned to their home world. Returning to main menu.');
            this.showScreen('login-screen');
        });
    }

    findMatch() {
        const username = document.getElementById('username-input').value.trim();
        if (!username) {
            alert('Please enter your Warrior of Light name');
            return;
        }

        this.socket.emit('find-match', username);
        this.showScreen('waiting-screen');
    }

    cancelSearch() {
        this.showScreen('login-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    renderCharacterSelection(characters) {
        const grid = document.getElementById('characters-grid');
        grid.innerHTML = '';

        characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <img src="${character.image}" alt="${character.name}" class="character-icon">
                <div class="character-name">${character.name}</div>
            `;
            
            card.addEventListener('click', () => this.selectCharacter(character, card));
            grid.appendChild(card);
        });
    }

    selectCharacter(character, card) {
        // Visual feedback
        document.querySelectorAll('.character-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');

        this.selectedCharacter = character;
        this.updateCharacterPanel();

        // Send selection to server
        this.socket.emit('select-character', {
            gameId: this.currentGame.gameId,
            character: character
        });
    }

    updateCharacterPanel() {
        const panel = document.getElementById('character-panel');
        const image = document.getElementById('selected-character-image');
        const name = document.getElementById('selected-character-name');
        const display = document.getElementById('selected-character-display');

        if (this.selectedCharacter) {
            image.src = this.selectedCharacter.image;
            name.textContent = this.selectedCharacter.name;
            display.style.display = 'flex';
            panel.style.display = 'block';
        } else {
            display.style.display = 'none';
        }
    }

    togglePanel() {
        document.getElementById('character-panel').classList.toggle('panel-collapsed');
    }

    initializeGame(data) {
        // FIX: Find which player is YOU and which is OPPONENT
        const currentPlayer = data.players.find(p => p.id === this.socket.id);
        const opponent = data.players.find(p => p.id !== this.socket.id);
        
        // Update player info - CORRECTLY assign You vs Opponent
        document.getElementById('player1-info').innerHTML = `
            <strong>You</strong><br>
            ${currentPlayer.username}<br>
            <em>Your character: ???</em>
        `;
        
        document.getElementById('player2-info').innerHTML = `
            <strong>Opponent</strong><br>
            ${opponent.username}<br>
            <em>Their character: ???</em>
        `;

        // Initialize character board
        this.renderCharacterBoard(this.currentGame.characters);
        this.updateTurnIndicator(data.currentTurn);
    }

    renderCharacterBoard(characters) {
        const board = document.getElementById('characters-board');
        board.innerHTML = '';

        characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <img src="${character.image}" alt="${character.name}" class="character-icon">
                <div class="character-name">${character.name}</div>
            `;
            board.appendChild(card);
        });

        document.getElementById('remaining-count').textContent = characters.length;
        document.getElementById('eliminated-count').textContent = 24 - characters.length;
    }

    updateTurnIndicator(currentTurn) {
        const indicator = document.getElementById('turn-indicator');
        const questionInput = document.getElementById('question-input');
        const sendButton = document.getElementById('send-question');

        // Update player turn highlights
        document.querySelectorAll('.player-info').forEach(info => {
            info.classList.remove('current-turn');
        });

        if (currentTurn.id === this.socket.id) {
            indicator.textContent = "Your turn! Ask a question about your opponent's character.";
            questionInput.disabled = false;
            sendButton.disabled = false;
            document.getElementById('player1-info').classList.add('current-turn');
        } else {
            indicator.textContent = "Opponent's turn. Waiting for their question...";
            questionInput.disabled = true;
            sendButton.disabled = true;
            document.getElementById('player2-info').classList.add('current-turn');
        }
    }

    sendQuestion() {
        const questionInput = document.getElementById('question-input');
        const question = questionInput.value.trim();

        if (!question) return;

        this.socket.emit('ask-question', {
            gameId: this.currentGame.gameId,
            question: question
        });

        // Add question to chat
        this.addChatMessage(`You: ${question}`, 'question');

        questionInput.value = '';
    }

    handleQuestionResult(data) {
        // Add answer to chat
        this.addChatMessage(`${data.askedBy} asked: "${data.question}"`, 'question');
        this.addChatMessage(`Answer: ${data.answer}`, 'answer');

        // Update character board
        this.renderCharacterBoard(data.remainingCharacters);

        // Show turn notification - ONLY when it becomes YOUR turn
        if (data.currentTurn.id === this.socket.id) {
            this.showTurnNotification("✨ YOUR TURN!");
            // Optional: Add a subtle screen flash
            document.body.style.backgroundColor = '#2a3c6c';
            setTimeout(() => {
                document.body.style.backgroundColor = '';
            }, 300);
        }

        // Update turn
        this.updateTurnIndicator(data.currentTurn);
    }

    addChatMessage(message, type = 'system') {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

        showGameOver(data) {
        const resultDiv = document.getElementById('game-result');
        if (data.winner) {
            const currentPlayer = this.currentGame.players.find(p => p.id === this.socket.id);
            
            if (data.winner === currentPlayer.username) {
                resultDiv.textContent = `🎉 VICTORY! You win! The character was ${data.character.name}`;
                resultDiv.style.color = '#4CAF50';
            } else {
                resultDiv.textContent = `💔 Defeat! ${data.winner} wins! The character was ${data.character.name}`;
                resultDiv.style.color = '#ff4444';
            }
        }
        this.showScreen('game-over-screen');
    }

    playAgain() {
        this.showScreen('login-screen');
        
        // Reset all game state
        this.currentGame = null;
        this.selectedCharacter = null;
        
        // Clear character panel
        const characterPanel = document.getElementById('character-panel');
        if (characterPanel) {
            characterPanel.style.display = 'none';
            characterPanel.classList.remove('panel-collapsed');
        }
        
        document.getElementById('selected-character-image').src = '';
        document.getElementById('selected-character-name').textContent = 'None Selected';
        document.getElementById('selected-character-display').style.display = 'none';
        
        // Clear game UI elements
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.innerHTML = '';
        
        const questionInput = document.getElementById('question-input');
        if (questionInput) {
            questionInput.value = '';
            questionInput.disabled = true;
        }
        
        const sendButton = document.getElementById('send-question');
        if (sendButton) sendButton.disabled = true;
        
        // Reset login form
        document.getElementById('username-input').value = '';
        
        console.log('Game reset complete - ready for new game!');
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FFXIVGuessWhoGame();
});