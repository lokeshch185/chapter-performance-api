const mongoose = require('mongoose');

const yearWiseQuestionCountSchema = new mongoose.Schema({
  2019: { type: Number, default: 0 },
  2020: { type: Number, default: 0 },
  2021: { type: Number, default: 0 },
  2022: { type: Number, default: 0 },
  2023: { type: Number, default: 0 },
  2024: { type: Number, default: 0 },
  2025: { type: Number, default: 0 }
}, { _id: false });

const chapterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  chapter: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  yearWiseQuestionCount: {
    type: yearWiseQuestionCountSchema,
    required: [true, 'Year-wise question count is required']
  },
  questionSolved: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  isWeakChapter: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for frequently filtered fields
chapterSchema.index({ subject: 1 });
chapterSchema.index({ class: 1 });
chapterSchema.index({ unit: 1 });
chapterSchema.index({ status: 1 });
chapterSchema.index({ isWeakChapter: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter; 