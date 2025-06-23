import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    required: true,
    default: '#000000',
  },
});

export default mongoose.models.Tag || mongoose.model('Tag', TagSchema);
