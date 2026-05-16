const mongoose=require('mongoose');

const   alertSchema=new mongoose.Schema({
    type: {
    type: String,
    required: true,
    enum: ['pacing', 'filler', 'keyword'] // Validates that the AI only returns these exact types
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },


},  {_id:false});


const sessionSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    index: true
    },
    startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  durationInSeconds: {
    type: Number,
    default: 0
  },
  fullTranscript: {
    type: [String], // An array of strings holding every finalized sentence
    default: []
  },
    alertsTriggered: [alertSchema]
}, {
  timestamps: true
})
module.exports=mongoose.model('Session',sessionSchema);


