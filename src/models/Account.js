import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imapConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImapConfig',
  },
  status: {
    type: String,
    enum: ['unknown', 'working', 'burned'],
    default: 'unknown',
  },
});

export default mongoose.models.Account || mongoose.model('Account', AccountSchema);
