require('dotenv').config();

const mongoose = require('mongoose');
const Question = require('./src/models/Question');

const sampleQuestions = [
  {
    questionText: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctOptionIndex: 2,
    category: 'geography',
    difficulty: 'easy',
  },
  {
    questionText: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctOptionIndex: 1,
    category: 'science',
    difficulty: 'easy',
  },
  {
    questionText: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctOptionIndex: 3,
    category: 'geography',
    difficulty: 'easy',
  },
  {
    questionText: 'In what year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctOptionIndex: 2,
    category: 'history',
    difficulty: 'medium',
  },
  {
    questionText: 'What is the chemical symbol for Gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctOptionIndex: 2,
    category: 'science',
    difficulty: 'medium',
  },
  {
    questionText: 'Who wrote "Romeo and Juliet"?',
    options: ['Jane Austen', 'William Shakespeare', 'Charles Dickens', 'Mark Twain'],
    correctOptionIndex: 1,
    category: 'literature',
    difficulty: 'easy',
  },
  {
    questionText: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correctOptionIndex: 2,
    category: 'mathematics',
    difficulty: 'easy',
  },
  {
    questionText: 'Which country has the most populous city in the world?',
    options: ['USA', 'China', 'India', 'Japan'],
    correctOptionIndex: 2,
    category: 'geography',
    difficulty: 'hard',
  },
  {
    questionText: 'What is the speed of light?',
    options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'],
    correctOptionIndex: 0,
    category: 'science',
    difficulty: 'hard',
  },
  {
    questionText: 'How many strings does a violin have?',
    options: ['4', '5', '6', '8'],
    correctOptionIndex: 0,
    category: 'music',
    difficulty: 'easy',
  },
];

async function seedQuestions() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is required');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    const inserted = await Question.insertMany(sampleQuestions);
    console.log(`✅ Inserted ${inserted.length} sample questions`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error seeding questions:', err);
    process.exit(1);
  }
}

seedQuestions();
