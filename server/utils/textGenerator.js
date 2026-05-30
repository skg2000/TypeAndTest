const easyWords = [
  "cat","dog","sun","pen","cup","hat","run","top","red","blue","tree","milk",
  "book","fish","road","ball","hand","land","more","went","said","here","just",
  "know","take","into","time","year","your","good","some","them","see","other",
  "than","then","now","look","only","come","its","over","think","also","back",
  "after","use","two","how","our","work","first","well","way","even","new",
  "want","any","these","give","day","most","us","great","between","need","large",
  "often","hand","high","place","hold","real","life","few","north","open","seem"
]

const mediumWords = [
  "typing","keyboard","practice","speed","accuracy","software","learning",
  "internet","challenge","development","technology","performance","function",
  "variable","monitor","command","network","storage","compiler","database",
  "browser","program","system","process","module","server","client","object",
  "method","create","update","delete","return","string","number","boolean",
  "output","import","export","render","deploy","branch","commit","review",
  "secure","format","filter","search","manage","design","project","service",
  "install","testing","feature","product","version","release","support",
  "backend","frontend","request","response","session","comment","package",
  "snippet","console","display","window","screen","button","submit","toggle"
]

const hardWords = [
  "implementation","architecture","sophisticated","extraordinary","synchronization",
  "characterization","responsibility","communication","transformation","infrastructure",
  "authentication","authorization","configuration","documentation","visualization",
  "encapsulation","polymorphism","abstraction","inheritance","instantiation",
  "asynchronous","concurrency","optimization","parallelism","serialization",
  "deserialization","interoperability","microservices","containerization","orchestration",
  "cybersecurity","vulnerability","cryptography","obfuscation","decentralized",
  "observability","instrumentation","idempotency","reproducibility","deterministic"
]

const quotes = [
  "The only way to do great work is to love what you do",
  "Success usually comes to those who are too busy to be looking for it",
  "The future depends on what you do today",
  "Do something today that your future self will thank you for",
  "In the middle of every difficulty lies opportunity",
  "It does not matter how slowly you go as long as you do not stop",
  "The secret of getting ahead is getting started",
  "You miss one hundred percent of the shots you do not take",
  "Whether you think you can or you think you cannot you are right",
  "The best time to plant a tree was twenty years ago the second best time is now"
]

const codeSnippets = [
  "const sum = (a, b) => a + b",
  "function greet(name) { return `Hello ${name}` }",
  "for (let i = 0; i < 10; i++) { console.log(i) }",
  "const user = { name: 'John', age: 25 }",
  "if (score > 90) { console.log('Excellent') }",
  "const arr = [1, 2, 3].map(x => x * 2)",
  "async function fetchData(url) { const res = await fetch(url) }",
  "const sorted = items.sort((a, b) => a.name.localeCompare(b.name))",
  "class Animal { constructor(name) { this.name = name } }",
  "const filtered = users.filter(u => u.active && u.age > 18)"
]

function getWordCount(time) {
  if (time === 15) return 25
  if (time === 30) return 50
  if (time === 60) return 90
  return 40
}

export default function generateText(time, mode) {
  if (mode === "quotes") {
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  if (mode === "code") {
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
  }

  let words = mediumWords
  if (mode === "easy") words = easyWords
  if (mode === "hard") words = hardWords

  const wordCount = getWordCount(time)
  const result = []
  let lastWord = ""

  for (let i = 0; i < wordCount; i++) {
    let word
    // Avoid repeating the same word twice in a row
    do {
      word = words[Math.floor(Math.random() * words.length)]
    } while (word === lastWord && words.length > 1)
    result.push(word)
    lastWord = word
  }

  return result.join(" ")
}
