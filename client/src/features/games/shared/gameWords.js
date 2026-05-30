export const EASY_WORDS = [
  "cat","dog","sun","run","top","red","cup","hat","map","web",
  "fox","box","pen","fig","fly","gem","hen","ink","jam","key",
  "log","mud","net","oak","paw","rag","saw","tin","van","wax",
  "zen","bug","cod","dew","eel","fan","gap","hay","ivy","jaw",
];

export const MEDIUM_WORDS = [
  "apple","beach","clock","dance","eagle","flame","grape","honey",
  "ivory","jewel","karma","lemon","magic","night","ocean","piano",
  "queen","river","storm","tiger","ultra","voice","water","xenon",
  "yacht","zebra","brave","crisp","depot","elect","frost","gloom",
  "hurry","image","joker","kneel","lunar","mocha","nerve","orbit",
];

export const HARD_WORDS = [
  "absolute","boundary","calendar","diameter","enormous","festival",
  "grateful","hospital","industry","judgment","keyboard","language",
  "magazine","notebook","original","platform","quantity","republic",
  "shoulder","together","umbrella","vacation","whatever","yourself",
  "champion","decision","engineer","fountain","guidance","headline",
];

export const EXPERT_WORDS = [
  "accomplish","background","calculator","department","environment",
  "frequently","government","helicopter","information","javascript",
  "kilometers","literature","manufacture","navigation","opportunity",
  "population","quarantine","restaurant","scholarship","temperature",
  "underneath","vocabulary","wilderness","experience","fascinating",
];

export const ZOMBIE_WORDS = [
  "brains","attack","undead","hunger","moan","crawl","shamble","lurk",
  "devour","infect","rotting","groan","plague","virus","zombie","horde",
  "corpse","flesh","terror","dread","nightmare","curse","venom","decay",
];

export const SPACE_WORDS = [
  "laser","orbit","comet","alien","probe","quasar","nebula","pulsar",
  "photon","warp","shield","torpedo","cluster","galaxy","meteor","void",
  "cosmos","nova","stellar","eclipse","asteroid","plasma","thrust","boost",
];

export function getWordPool(difficulty) {
  if (difficulty === "easy")   return EASY_WORDS;
  if (difficulty === "hard")   return HARD_WORDS;
  if (difficulty === "expert") return EXPERT_WORDS;
  return MEDIUM_WORDS;
}

export function randomWord(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomId() {
  return Math.random().toString(36).slice(2, 9);
}
