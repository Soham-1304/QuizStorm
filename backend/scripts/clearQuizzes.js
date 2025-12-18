const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');
const Question = require('../src/models/Question');
require('dotenv').config();

async function clearQuizzes() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizstorm';
        console.log('Connecting to:', uri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Localhost');

        await mongoose.connect(uri);
        console.log('🌱 Connected to MongoDB');

        const deletedQuizzes = await Quiz.deleteMany({});
        console.log(`🗑️  Deleted ${deletedQuizzes.deletedCount} quizzes`);

        const deletedQuestions = await Question.deleteMany({});
        console.log(`🗑️  Deleted ${deletedQuestions.deletedCount} questions`);

        console.log('✅ Database cleared successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Clearing failed:', err);
        process.exit(1);
    }
}

clearQuizzes();