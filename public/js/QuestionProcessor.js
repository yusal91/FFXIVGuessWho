// QuestionProcessor.js - Server Version
const { Gender, Race, Affiliation, Job } = require('./CharacterEnums');

class QuestionProcessor {
    constructor(characterDatabase) {
        this.db = characterDatabase;
    }

    // ... (same methods as the browser version)
    processQuestion(question, targetCharacter, currentCharacters) {
        const lowerQuestion = question.toLowerCase();
        
        if (this.isGuessQuestion(lowerQuestion)) {
            return this.processGuess(lowerQuestion, targetCharacter, currentCharacters);
        }

        if (this.isGenderQuestion(lowerQuestion)) {
            return this.processGenderQuestion(lowerQuestion, targetCharacter, currentCharacters);
        }

        if (this.isRaceQuestion(lowerQuestion)) {
            return this.processRaceQuestion(lowerQuestion, targetCharacter, currentCharacters);
        }

        if (this.isJobQuestion(lowerQuestion)) {
            return this.processJobQuestion(lowerQuestion, targetCharacter, currentCharacters);
        }

        if (this.isAffiliationQuestion(lowerQuestion)) {
            return this.processAffiliationQuestion(lowerQuestion, targetCharacter, currentCharacters);
        }

        return {
            answer: "No",
            remainingCharacters: currentCharacters
        };
    }

    // ... (all the same helper methods as before)
    isGuessQuestion(question) {
        return question.includes('is it') || question.includes('are they') || 
               question.includes('is your character');
    }

    processGuess(question, targetCharacter, currentCharacters) {
        const guessedName = this.extractNameFromGuess(question);
        if (!guessedName) {
            return {
                answer: "No",
                remainingCharacters: currentCharacters
            };
        }

        const isCorrect = targetCharacter.name.toLowerCase().includes(guessedName) || 
                         guessedName.includes(targetCharacter.name.toLowerCase());

        const remainingCharacters = isCorrect ? 
            currentCharacters.filter(char => char.name.toLowerCase().includes(guessedName)) :
            currentCharacters.filter(char => !char.name.toLowerCase().includes(guessedName));

        return {
            answer: isCorrect ? 'Yes' : 'No',
            isGuess: true,
            isCorrect: isCorrect,
            remainingCharacters: remainingCharacters
        };
    }

    isGenderQuestion(question) {
        return question.includes('male') || question.includes('female') || 
               question.includes('boy') || question.includes('girl') ||
               question.includes('man') || question.includes('woman');
    }

    processGenderQuestion(question, targetCharacter, currentCharacters) {
        const isMaleQuestion = question.includes('male') || question.includes('boy') || question.includes('man');
        const isCorrect = isMaleQuestion ? 
            targetCharacter.gender === Gender.MALE : 
            targetCharacter.gender === Gender.FEMALE;

        const remainingCharacters = currentCharacters.filter(char => 
            isMaleQuestion ? char.gender === Gender.MALE : char.gender === Gender.FEMALE
        );

        return {
            answer: isCorrect ? 'Yes' : 'No',
            remainingCharacters: remainingCharacters
        };
    }

    isRaceQuestion(question) {
        const races = Object.values(Race);
        return races.some(race => question.includes(race));
    }

    processRaceQuestion(question, targetCharacter, currentCharacters) {
        const races = Object.values(Race);
        const mentionedRace = races.find(race => question.includes(race));
        
        if (!mentionedRace) {
            return { 
                answer: "No", 
                remainingCharacters: currentCharacters 
            };
        }

        const isCorrect = targetCharacter.race === mentionedRace;
        const remainingCharacters = currentCharacters.filter(char => 
            isCorrect ? char.race === mentionedRace : char.race !== mentionedRace
        );

        return {
            answer: isCorrect ? 'Yes' : 'No',
            remainingCharacters: remainingCharacters
        };
    }

    isJobQuestion(question) {
        const jobs = Object.values(Job);
        return jobs.some(job => question.includes(job.toLowerCase().replace('_', ' ')));
    }

    processJobQuestion(question, targetCharacter, currentCharacters) {
        const jobs = Object.values(Job);
        const mentionedJob = jobs.find(job => 
            question.includes(job.toLowerCase().replace('_', ' '))
        );
        
        if (!mentionedJob) {
            return { 
                answer: "No", 
                remainingCharacters: currentCharacters 
            };
        }

        const isCorrect = targetCharacter.hasJob(mentionedJob);
        const remainingCharacters = currentCharacters.filter(char => 
            isCorrect ? char.hasJob(mentionedJob) : !char.hasJob(mentionedJob)
        );

        return {
            answer: isCorrect ? 'Yes' : 'No',
            remainingCharacters: remainingCharacters
        };
    }

    isAffiliationQuestion(question) {
        return question.includes('scion') || question.includes('garlean');
    }

    processAffiliationQuestion(question, targetCharacter, currentCharacters) {
        const isScionQuestion = question.includes('scion');
        const isCorrect = isScionQuestion ? 
            targetCharacter.isScion : 
            targetCharacter.affiliation === Affiliation.GARLEAN;

        const remainingCharacters = currentCharacters.filter(char => 
            isScionQuestion ? char.isScion : char.affiliation === Affiliation.GARLEAN
        );

        return {
            answer: isCorrect ? 'Yes' : 'No',
            remainingCharacters: remainingCharacters
        };
    }

    extractNameFromGuess(question) {
        const match = question.match(/(?:is it|are they|is your character)\s+([^?.!]+)/);
        return match ? match[1].trim().toLowerCase() : '';
    }
}

module.exports = QuestionProcessor;