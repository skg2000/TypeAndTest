const easyWords = [
"cat","dog","sun","pen","cup","hat","run","top",
"red","blue","tree","milk","book","fish","road"
]

const mediumWords = [
"typing","keyboard","practice","speed","accuracy",
"software","learning","internet","challenge",
"development","technology","performance"
]

const hardWords = [
"implementation","architecture","sophisticated",
"extraordinary","synchronization",
"characterization","responsibility",
"communication","transformation"
]

const quotes = [
"The only way to do great work is to love what you do",
"Success usually comes to those who are too busy to be looking for it",
"The future depends on what you do today",
"Do something today that your future self will thank you for"
]

const codeSnippets = [
"const sum = (a,b) => a + b;",
"function greet(name){ return `Hello ${name}` }",
"for(let i=0;i<10;i++){ console.log(i) }",
"const user = {name:'John', age:25};",
"if(score > 90){ console.log('Excellent') }"
]

function getWordCount(time){

if(time === 15) return 25
if(time === 30) return 50
if(time === 60) return 90

return 40

}

export default function generateText(time,mode){

if(mode === "quotes"){
return quotes[Math.floor(Math.random()*quotes.length)]
}

if(mode === "code"){
return codeSnippets[Math.floor(Math.random()*codeSnippets.length)]
}

let words = mediumWords

if(mode === "easy") words = easyWords
if(mode === "hard") words = hardWords

const wordCount = getWordCount(time)

let result = []

for(let i=0;i<wordCount;i++){

const randomWord =
words[Math.floor(Math.random()*words.length)]

result.push(randomWord)

}

return result.join(" ")

}