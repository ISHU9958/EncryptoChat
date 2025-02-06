const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  members:{
    type:[String],
    required:true,
  },

  image:{
    type:String,
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

const Group = mongoose.model('groups', GroupSchema);

module.exports = Group;
