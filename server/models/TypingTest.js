import mongoose from "mongoose";

const TypingTestSchema = new mongoose.Schema({

  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  wpm:Number,

  accuracy:Number,

  mistakes:Number,

  duration:Number,

  createdAt:{
    type:Date,
    default:Date.now
  }

})

export default mongoose.model("TypingTest", TypingTestSchema);