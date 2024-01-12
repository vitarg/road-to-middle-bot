const questions = require('./questions.json');

const checkIsRandom = (topic) => {
    if (topic !== 'Случайный вопрос') return topic;

    const topics = Object.keys(questions);
    return topics[Math.floor(Math.random() * topics.length)];
};

const getRandomQuestion = (topic) => {
    let currentTopic = questions[topic.toLowerCase()];
    return currentTopic[Math.floor(Math.random() * currentTopic.length)];
};

const getCorrectAnswer = (topic, id) => {
    const currentQuestion = questions[topic.toLowerCase()].find((question) => question.id === id);

    if (!currentQuestion.hasOptions) {
        return currentQuestion.answer;
    }

    return currentQuestion.options.find((option) => option.isCorrect).text;
};

module.exports = { getRandomQuestion, getCorrectAnswer, checkIsRandom };
