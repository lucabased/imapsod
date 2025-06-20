import mongoose from 'mongoose';

const ImapConfigSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
  },
  imap_server: {
    type: String,
    required: true,
  },
  imap_port: {
    type: Number,
    required: true,
  },
  imap_tls: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.models.ImapConfig || mongoose.model('ImapConfig', ImapConfigSchema);
