import TypingTest from "../models/TypingTest.js";

const saveResult =
async(req,res)=>{

try{

const test =
new TypingTest(req.body)

await test.save()

res.json({message:"Saved"})

}catch(err){

res.status(500).json(err)

}

}

export default saveResult;