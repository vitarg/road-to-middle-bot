require('dotenv').config();
const { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { getRandomQuestion, getCorrectAnswer, checkIsRandom } = require('./utils');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (context) => {
    const keyboard = new Keyboard()
        .text('HTML')
        .text('CSS')
        .row()
        .text('JavaScript')
        .text('React')
        .row()
        .text('Случайный вопрос')
        .resized();

    await context.reply(
        'Привет, этот бот я создал, чтобы подготовиться к собеседованиям на позицию Middle Frontend Developer'
    );

    await context.reply('Выбери тему', {
        reply_markup: keyboard,
    });
});

bot.hears(['HTML', 'CSS', 'JavaScript', 'React', 'Случайный вопрос'], async (context) => {
    const topic = checkIsRandom(context.message.text);
    const question = getRandomQuestion(topic);

    let inlineKeyboard;

    if (question.hasOptions) {
        const buttonRows = question.options.map((option) => {
            return [
                InlineKeyboard.text(
                    option.text,
                    JSON.stringify({
                        type: `${topic}-option`,
                        isCorrect: option.isCorrect,
                        questionId: question.id,
                    })
                ),
            ];
        });

        inlineKeyboard = InlineKeyboard.from(buttonRows);
    } else {
        inlineKeyboard = new InlineKeyboard().text(
            'Узнать ответ',
            JSON.stringify({
                questionId: question.id,
                type: topic,
            })
        );
    }

    await context.reply(question.text, {
        reply_markup: inlineKeyboard,
    });
});

bot.on('callback_query:data', async (context) => {
    const callbackData = JSON.parse(context.callbackQuery.data);

    if (!callbackData.type.includes('option')) {
        const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);
        await context.reply(answer, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        await context.answerCallbackQuery();
        return;
    }

    if (callbackData.isCorrect) {
        await context.reply('Верно ✅');
        await context.answerCallbackQuery();
        return;
    }

    const answer = getCorrectAnswer(callbackData.type.split('-')[0], callbackData.questionId);
    await context.reply(`Не верно ❌\nПравильный ответ: ${answer}`);
    await context.answerCallbackQuery();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e);
    } else {
        console.error('Unknown error:', e);
    }
});

bot.start();
