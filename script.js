// import data


// Game state
let gameState = {
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    skippedCount: 0,
    maxSkips: 3,
    totalQuestions: 28,
    requiredCompleted: 25,
    selectedSubject: null
};

// DOM elements
const startScreen = document.getElementById('start-screen');
const subjectScreen = document.getElementById('subject-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const skipBtn = document.getElementById('skip-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionSpan = document.getElementById('current-question');
const skippedCountSpan = document.getElementById('skipped-count');
const correctCountQuizSpan = document.getElementById('correct-count-quiz');
const incorrectCountQuizSpan = document.getElementById('incorrect-count-quiz');
const progressFill = document.getElementById('progress');
const subjectsList = document.getElementById('subjects-list');

// Initialize game
function initGame() {
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.skippedCount = 0;
    gameState.selectedSubject = null;
    
    showScreen('start');
}

// Show specific screen
function showScreen(screenName) {
    startScreen.classList.remove('active');
    subjectScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    if (screenName === 'start') {
        startScreen.classList.add('active');
    } else if (screenName === 'subject') {
        subjectScreen.classList.add('active');
        loadSubjects();
    } else if (screenName === 'quiz') {
        quizScreen.classList.add('active');
        loadQuestion();
    } else if (screenName === 'results') {
        resultsScreen.classList.add('active');
        showResults();
    }
}

// Load subjects list
function loadSubjects() {
    subjectsList.innerHTML = '';
    //const myData = data;
    // Check if data exists
    if (typeof data === 'undefined') {
        console.error('Data is not defined!');
        subjectsList.innerHTML = '<p style="color: var(--error-color);">Ошибка: данные не загружены</p>';
        return;
    }
    
    console.log('Loading subjects, data type:', typeof data, 'isArray:', Array.isArray(data));
    console.log('Data keys:', typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : 'N/A');
    
    // Check if data is an object (new structure) or array (old structure)
    if (Array.isArray(data)) {
        // Old structure - show single subject
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card';
        subjectCard.innerHTML = `
            <div class="subject-icon">📚</div>
            <div class="subject-name">Общий тест</div>
            <div class="subject-count">${data.length} вопросов</div>
        `;
        subjectCard.addEventListener('click', () => {
            startQuizWithSubject('Общий тест', data);
        });
        subjectsList.appendChild(subjectCard);
    } else if (typeof data === 'object' && data !== null) {
        // New structure - show all subjects with questions
        const subjects = Object.keys(data);
        
        if (subjects.length === 0) {
            subjectsList.innerHTML = '<p style="color: var(--text-secondary);">Нет доступных предметов</p>';
            return;
        }
        
        subjects.forEach(subjectName => {
            const questions = data[subjectName];
            const hasZeroQuestions = questions.length === 0;
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            subjectCard.innerHTML = `
                <div class="subject-icon">📚</div>
                <div class="subject-name">${subjectName}</div>
                <div class="subject-count">${questions.length} вопросов</div>
            `;
            subjectCard.addEventListener('click', () => {
                if (!hasZeroQuestions) {
                    startQuizWithSubject(subjectName, questions);
                }
                else {
                    alert('Нет доступных вопросов для этого предмета');
                }
            });
            subjectsList.appendChild(subjectCard);
        });
    } else {
        console.error('Invalid data structure:', typeof data);
        subjectsList.innerHTML = '<p style="color: var(--error-color);">Ошибка: неверная структура данных</p>';
    }
}

// Start quiz with selected subject
function startQuizWithSubject(subjectName, questions) {
    gameState.selectedSubject = subjectName;
    
    // Select 28 random questions from selected subject
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    gameState.questions = shuffled.slice(0, gameState.totalQuestions);
    
    showScreen('quiz');
}

// Calculate correct answers count
function getCorrectAnswersCount() {
    let count = 0;
    gameState.answers.forEach(answer => {
        if (answer.selected && answer.selected === answer.correct) {
            count++;
        }
    });
    return count;
}

// Calculate completed answers count (not skipped)
function getCompletedAnswersCount() {
    let count = 0;
    gameState.answers.forEach(answer => {
        if (answer.selected && !answer.skipped) {
            count++;
        }
    });
    return count;
}

// Calculate incorrect answers count
function getIncorrectAnswersCount() {
    let count = 0;
    gameState.answers.forEach(answer => {
        if (answer.selected && !answer.skipped && answer.selected !== answer.correct) {
            count++;
        }
    });
    return count;
}

// Load current question
function loadQuestion() {
    const correctCount = getCorrectAnswersCount();
    const incorrectCount = getIncorrectAnswersCount();
    const question = gameState.questions[gameState.currentQuestionIndex];
    const questionNumber = Number(correctCount) + Number(incorrectCount) + 1;
    
    // Update progress
    const progress = (questionNumber / gameState.totalQuestions) * 100;
    progressFill.style.width = progress + '%';
    
    // Update question number
    currentQuestionSpan.textContent = questionNumber;
    
    // Update correct and incorrect answers count
    const completedCount = getCompletedAnswersCount();
    correctCountQuizSpan.textContent = correctCount;
    incorrectCountQuizSpan.textContent = incorrectCount;
    
    // Check if 25 questions completed - finish game
    if (completedCount >= gameState.requiredCompleted) {
        showScreen('results');
        return;
    }
    
    // Update skip counter
    skippedCountSpan.textContent = gameState.skippedCount;
    const isSkipDisabled = gameState.skippedCount >= gameState.maxSkips;
    skipBtn.disabled = isSkipDisabled;
    if (isSkipDisabled) {
        skipBtn.classList.add('disabled');
    } else {
        skipBtn.classList.remove('disabled');
    }
    
    // Set question text
    questionText.textContent = question.question;
    
    // Get options (some questions use "variants" instead of "options")
    const options = question.options || question.variants || {};
    
    // Clear and populate options
    optionsContainer.innerHTML = '';
    Object.keys(options).forEach(key => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.option = key;
        
        optionDiv.innerHTML = `
            <div class="option-label">${key}</div>
            <div class="option-text">${options[key]}</div>
        `;
        
        optionDiv.addEventListener('click', () => selectOption(key));
        optionsContainer.appendChild(optionDiv);
    });
    
    // Reset buttons
    nextBtn.disabled = true;
    const isLastQuestion = questionNumber === gameState.totalQuestions;
    const willComplete = completedCount + 1 >= gameState.requiredCompleted;
    nextBtn.textContent = (isLastQuestion || willComplete) ? 'Завершить' : 'Следующий вопрос';
}

// Select an option
function selectOption(selectedKey) {
    const question = gameState.questions[gameState.currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    // Remove previous selection
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Mark selected option
    const selectedOption = document.querySelector(`[data-option="${selectedKey}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Enable next button
    nextBtn.disabled = false;
    
    // Store answer
    gameState.answers[gameState.currentQuestionIndex] = {
        questionId: question.id,
        selected: selectedKey,
        correct: question.answer
    };
}

// Skip question
function skipQuestion() {
    if (gameState.skippedCount >= gameState.maxSkips) {
        return;
    }
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    gameState.answers[gameState.currentQuestionIndex] = {
        questionId: question.id,
        selected: null,
        correct: question.answer,
        skipped: true
    };
    
    gameState.skippedCount++;
    nextQuestion();
}

// Move to next question
function nextQuestion() {
    // Update correct and incorrect counts before moving to next question
    const completedCount = getCompletedAnswersCount();
    correctCountQuizSpan.textContent = getCorrectAnswersCount();
    incorrectCountQuizSpan.textContent = getIncorrectAnswersCount();
    
    // Check if 25 questions completed - finish game
    if (completedCount >= gameState.requiredCompleted) {
        showScreen('results');
        return;
    }
    
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= gameState.totalQuestions) {
        showScreen('results');
    } else {
        loadQuestion();
    }
}

// Show results
function showResults() {
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    
    // Calculate results
    gameState.answers.forEach(answer => {
        if (answer.skipped) {
            skippedCount++;
        } else if (answer.selected === answer.correct) {
            correctCount++;
        } else {
            incorrectCount++;
        }
    });
    
    // Update score cards
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('incorrect-count').textContent = incorrectCount;
    document.getElementById('skipped-result-count').textContent = skippedCount;
    
    // Calculate percentage based on required completed (25)
    const percentage = Math.round((correctCount / gameState.requiredCompleted) * 100);
    document.getElementById('percentage').textContent = percentage;
    
    // Update progress ring
    const circle = document.querySelector('.progress-ring-circle');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    // Show detailed results
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    
    gameState.answers.forEach((answer, index) => {
        const question = gameState.questions[index];
        const options = question.options || question.variants || {};
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        let statusClass = '';
        let statusText = '';
        let statusIcon = '';
        
        if (answer.skipped) {
            statusClass = 'skipped';
            statusText = 'Пропущено';
            statusIcon = '⏭️';
        } else if (answer.selected === answer.correct) {
            statusClass = 'correct';
            statusText = 'Правильно';
            statusIcon = '✅';
        } else {
            statusClass = 'incorrect';
            statusText = 'Неправильно';
            statusIcon = '❌';
        }
        
        resultItem.classList.add(statusClass);
        
        resultItem.innerHTML = `
            <div class="result-question">
                ${statusIcon} <strong>Вопрос ${index + 1}:</strong> ${question.question}
            </div>
            <div class="result-answer">
                ${answer.skipped ? 
                    `<div class="result-answer-item">
                        <span>Правильный ответ: <strong>${answer.correct}</strong> - ${options[answer.correct]}</span>
                    </div>` :
                    answer.selected === answer.correct ?
                    `<div class="result-answer-item correct-answer">
                        <span>✅ Ваш ответ: <strong>${answer.selected}</strong> - ${options[answer.selected]}</span>
                    </div>` :
                    `<div class="result-answer-item user-answer">
                        <span>❌ Ваш ответ: <strong>${answer.selected}</strong> - ${options[answer.selected]}</span>
                    </div>
                    <div class="result-answer-item correct-answer">
                        <span>✅ Правильный ответ: <strong>${answer.correct}</strong> - ${options[answer.correct]}</span>
                    </div>`
                }
                <div class="result-status ${statusClass}">
                    ${statusText}
                </div>
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });
}

// Event listeners
startBtn.addEventListener('click', () => {
    showScreen('subject');
});

backToStartBtn.addEventListener('click', () => {
    showScreen('start');
});

skipBtn.addEventListener('click', skipQuestion);

nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    nextQuestion();
});

restartBtn.addEventListener('click', () => {
    initGame();
});

// Initialize on load
initGame();

