class FFXIVGuessWhoGame {
    constructor() {
        this.socket = io();
        this.currentGame = null;
        this.selectedCharacter = null;
        this.isMyTurn = false;
        this.setupEventListeners();
        this.setupSocketListeners();
        this.setupTurnNotifications();
        this.setupGuidePanel(); // Add this line
    }

    setupTurnNotifications() 
    {
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

    showTurnNotification(message) 
    {
        const notification = document.createElement('div');
        notification.className = 'turn-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }

    setupEventListeners() 
    {
        document.getElementById('find-match-btn').addEventListener('click', () => this.findMatch());
        document.getElementById('username-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findMatch();
        });

        document.getElementById('cancel-search').addEventListener('click', () => this.cancelSearch());

        document.getElementById('send-question').addEventListener('click', () => this.sendQuestion());
        document.getElementById('question-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendQuestion();
        });

        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('panel-toggle').addEventListener('click', () => this.togglePanel());
    }

    setupSocketListeners() 
    {
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

        this.socket.on('turn-update', (data) => {
            console.log('Turn update received:', data);
            this.updateTurnIndicator(data.currentTurn);
        });

        this.socket.on('game-over', (data) => {
            this.showGameOver(data);
        });

        this.socket.on('opponent-disconnected', () => {
            alert('Your opponent has returned to their home world. Returning to main menu.');
            this.showScreen('login-screen');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            alert(`Error: ${error.message}`);
        });
    }

    // ADD THIS NEW METHOD FOR GUIDE PANEL
    setupGuidePanel() 
    {
        const guideToggle = document.getElementById('guide-toggle');
        const guidePanel = document.getElementById('guide-panel');
        
        if (guideToggle && guidePanel) {
            guideToggle.addEventListener('click', () => {
                guidePanel.classList.toggle('collapsed');
            });
            
            // Initialize as collapsed by default
            guidePanel.classList.add('collapsed');
        }
    }

    findMatch() 
    {
        const username = document.getElementById('username-input').value.trim();
        if (!username) {
            alert('Please enter your Warrior of Light name');
            return;
        }

        this.socket.emit('find-match', username);
        this.showScreen('waiting-screen');
    }

    cancelSearch() 
    {
        this.socket.emit('cancel-search');
        this.showScreen('login-screen');
    }

    showScreen(screenId) 
    {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        
        // ADD THIS LINE TO CONTROL GUIDE PANEL VISIBILITY
        this.toggleGuidePanel(screenId);
    }

    // ADD THIS NEW METHOD TO CONTROL GUIDE PANEL
    toggleGuidePanel(screenId) 
    {
        const guidePanel = document.getElementById('guide-panel');
        if (!guidePanel) return;
        
        // Show guide only on game screen and character selection
        const showOnScreens = ['game-screen', 'character-selection'];
        if (showOnScreens.includes(screenId)) {
            guidePanel.style.display = 'block';
        } else {
            guidePanel.style.display = 'none';
        }
    }

    renderCharacterSelection(characters) 
    {
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

    selectCharacter(character, card) 
    {
        document.querySelectorAll('.character-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');

        this.selectedCharacter = character;
        this.updateCharacterPanel();

        this.socket.emit('select-character', {
            gameId: this.currentGame.gameId,
            character: character
        });
    }

    updateCharacterPanel() 
    {
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

    togglePanel() 
    {
        document.getElementById('character-panel').classList.toggle('panel-collapsed');
    }

    initializeGame(data) 
    {
        const currentPlayer = data.players.find(p => p.id === this.socket.id);
        const opponent = data.players.find(p => p.id !== this.socket.id);
        
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

        this.renderCharacterBoard(this.currentGame.characters);
        this.updateTurnIndicator(data.currentTurn);
    }

    renderCharacterBoard(characters) 
    {
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

    updateTurnIndicator(currentTurn) 
    {
        const indicator = document.getElementById('turn-indicator');
        const questionInput = document.getElementById('question-input');
        const sendButton = document.getElementById('send-question');

        console.log('Updating turn indicator - current turn ID:', currentTurn.id, 'My ID:', this.socket.id);
        
        document.querySelectorAll('.player-info').forEach(info => {
            info.classList.remove('current-turn');
        });

        if (currentTurn.id === this.socket.id) {
            this.isMyTurn = true;
            indicator.textContent = "Your turn! Ask a question about your opponent's character.";
            questionInput.disabled = false;
            sendButton.disabled = false;
            document.getElementById('player1-info').classList.add('current-turn');
            setTimeout(() => questionInput.focus(), 100);
        } else {
            this.isMyTurn = false;
            indicator.textContent = "Opponent's turn. Waiting for their question...";
            questionInput.disabled = true;
            sendButton.disabled = true;
            document.getElementById('player2-info').classList.add('current-turn');
        }
    }

    sendQuestion() 
    {
        const questionInput = document.getElementById('question-input');
        const question = questionInput.value.trim();

        if (!question) {
            alert('Please enter a question');
            return;
        }

        if (!this.isMyTurn) {
            alert("It's not your turn!");
            return;
        }

        console.log('Sending question:', question);

        // Immediately disable input to prevent double sends
        questionInput.disabled = true;
        document.getElementById('send-question').disabled = true;

        this.socket.emit('ask-question', {
            gameId: this.currentGame.gameId,
            question: question
        });

        this.addChatMessage(`You: ${question}`, 'question');
        questionInput.value = '';
    }

    handleQuestionResult(data) 
    {
        console.log('Question result received:', data);

        this.addChatMessage(`${data.askedBy} asked: "${data.question}"`, 'question');
        this.addChatMessage(`Answer: ${data.answer}`, 'answer');

        if (data.remainingCharacters) {
            this.renderCharacterBoard(data.remainingCharacters);
        }

        // Update turn based on the result
        if (data.currentTurn) {
            this.updateTurnIndicator(data.currentTurn);
            
            if (data.currentTurn.id === this.socket.id) {
                this.showTurnNotification("✨ YOUR TURN!");
            }
        }
    }

    addChatMessage(message, type = 'system') 
    {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showGameOver(data) 
    {
        const resultDiv = document.getElementById('game-result');
        if (data.winner) {
            const isYouTheWinner = data.winnerId === this.socket.id;
            const winnerPlayer = data.players.find(player => player.id === data.winnerId);
            const winnerName = winnerPlayer ? winnerPlayer.username : 'Your opponent';
            
            if (isYouTheWinner) {
                resultDiv.textContent = `🎉 VICTORY! You win! The character was ${data.character.name}`;
                resultDiv.style.color = '#4CAF50';
            } else {
                resultDiv.textContent = `💔 Defeat! ${winnerName} wins! The character was ${data.character.name}`;
                resultDiv.style.color = '#ff4444';
            }
        } else {
            resultDiv.textContent = `Game Over! The character was ${data.character.name}`;
            resultDiv.style.color = '#ffcc00';
        }
        
        this.addChatMessage(`Game Over! ${data.character.name} was the character.`, 'system');
        this.showScreen('game-over-screen');
    }

    playAgain() 
    {
        this.showScreen('login-screen');
        this.currentGame = null;
        this.selectedCharacter = null;
        this.isMyTurn = false;
        
        const characterPanel = document.getElementById('character-panel');
        if (characterPanel) {
            characterPanel.style.display = 'none';
            characterPanel.classList.remove('panel-collapsed');
        }
        
        document.getElementById('selected-character-image').src = '';
        document.getElementById('selected-character-name').textContent = 'None Selected';
        document.getElementById('selected-character-display').style.display = 'none';
        
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.innerHTML = '';
        
        const questionInput = document.getElementById('question-input');
        if (questionInput) {
            questionInput.value = '';
            questionInput.disabled = true;
        }
        
        const sendButton = document.getElementById('send-question');
        if (sendButton) sendButton.disabled = true;
        
        document.getElementById('player1-info').innerHTML = '';
        document.getElementById('player2-info').innerHTML = '';
        
        const turnIndicator = document.getElementById('turn-indicator');
        if (turnIndicator) turnIndicator.textContent = '';
        
        document.getElementById('characters-grid').innerHTML = '';
        document.getElementById('characters-board').innerHTML = '';
        document.getElementById('username-input').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => { new FFXIVGuessWhoGame(); });