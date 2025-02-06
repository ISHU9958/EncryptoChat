const mongoose =require('mongoose');

const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  tocontent: String,
  fromcontent: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  isForward: { type: Boolean, default: false },
  memberSeen:{
    type:[String],
    default:[],
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports=Message;