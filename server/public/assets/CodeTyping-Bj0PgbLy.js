import{n as e,r as t,t as n}from"./index-Yj8byep1.js";var r=t(e(),1),i=n(),a=[{lang:`JavaScript`,icon:`🟨`,code:"const greet = (name) => {\n  return `Hello, ${name}!`;\n};"},{lang:`Python`,icon:`🐍`,code:`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`},{lang:`TypeScript`,icon:`🟦`,code:`interface User {
  id: number;
  name: string;
  email: string;
}`},{lang:`React JSX`,icon:`⚛️`,code:`function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}`},{lang:`Node.js`,icon:`🟩`,code:`const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(3000);`},{lang:`SQL`,icon:`🗄️`,code:`SELECT users.name, COUNT(orders.id)
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.name
HAVING COUNT(orders.id) > 0;`},{lang:`CSS`,icon:`🎨`,code:`.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 24px;
}`},{lang:`Bash`,icon:`💻`,code:`#!/bin/bash
for file in *.txt; do
  echo "Processing $file"
  wc -l "$file"
done`}];function o({onEnd:e}){let[t,n]=(0,r.useState)(`idle`),[o,s]=(0,r.useState)(0),[c,l]=(0,r.useState)(``),[u,d]=(0,r.useState)(!1),[f,p]=(0,r.useState)(null),[m,h]=(0,r.useState)(0),[g,_]=(0,r.useState)(100),[v,y]=(0,r.useState)(0),[b,x]=(0,r.useState)([]),[S,C]=(0,r.useState)(0),w=(0,r.useRef)(null),T=(0,r.useRef)(null),E=a[o],D=E.code;(0,r.useEffect)(()=>(u&&(w.current=setInterval(()=>C(e=>e+1),1e3)),()=>clearInterval(w.current)),[u]);let O=(e=0)=>{s(e),l(``),d(!1),p(null),h(0),_(100),y(0),C(0),n(`typing`),clearInterval(w.current),setTimeout(()=>T.current?.focus(),50)};return(0,i.jsxs)(`div`,{className:`ct-wrap`,children:[t===`idle`&&(0,i.jsxs)(`div`,{className:`ct-idle`,children:[(0,i.jsx)(`div`,{className:`ct-title`,children:`💻 Code Typing Challenge`}),(0,i.jsx)(`p`,{className:`ct-sub`,children:`Type real code snippets across 8 languages. Scored on speed AND syntax accuracy.`}),(0,i.jsx)(`div`,{className:`ct-lang-grid`,children:a.map((e,t)=>(0,i.jsxs)(`button`,{className:`ct-lang-btn`,onClick:()=>O(t),children:[e.icon,` `,e.lang]},t))}),(0,i.jsx)(`button`,{className:`ct-btn`,onClick:()=>O(0),children:`▶ Start with JavaScript`})]}),t===`typing`&&(0,i.jsxs)(`div`,{className:`ct-game`,children:[(0,i.jsxs)(`div`,{className:`ct-header`,children:[(0,i.jsxs)(`span`,{className:`ct-lang-badge`,children:[E.icon,` `,E.lang]}),(0,i.jsxs)(`div`,{className:`ct-live-stats`,children:[(0,i.jsxs)(`span`,{style:{color:`#facc15`},children:[`⚡ `,m,` WPM`]}),(0,i.jsxs)(`span`,{style:{color:`#22c55e`},children:[`🎯 `,g,`%`]}),(0,i.jsxs)(`span`,{style:{color:`#f87171`},children:[`❌ `,v]}),(0,i.jsxs)(`span`,{style:{color:`#38bdf8`},children:[`⏱ `,S,`s`]})]})]}),(0,i.jsx)(`div`,{className:`ct-progress-bar`,children:(0,i.jsx)(`div`,{className:`ct-progress-fill`,style:{width:`${c.length/D.length*100}%`}})}),(0,i.jsx)(`div`,{className:`ct-code-display`,onClick:()=>T.current?.focus(),children:(0,i.jsx)(`pre`,{className:`ct-pre`,children:D.split(``).map((e,t)=>{let n=`ct-char-pending`;return t<c.length?n=c[t]===e?`ct-char-correct`:`ct-char-incorrect`:t===c.length&&(n=`ct-char-cursor`),e===`
`?(0,i.jsx)(`span`,{className:n,children:e===`
`&&t>=c.length?`↵
`:`
`},t):(0,i.jsx)(`span`,{className:n,children:e},t)})})}),(0,i.jsx)(`textarea`,{ref:T,className:`ct-textarea`,value:c,onChange:e=>{let t=e.target.value;if(t.length>D.length)return;!u&&t.length===1&&(d(!0),p(Date.now())),l(t);let r=0;for(let e=0;e<t.length;e++)t[e]!==D[e]&&r++;if(y(r),_(t.length>0?Math.round((t.length-r)/t.length*100):100),f){let e=(Date.now()-f)/6e4,n=t.length-r;h(e>0?Math.max(0,Math.round(n/5/e)):0)}if(t.length>=D.length){clearInterval(w.current);let e=f?Math.round((t.length-r)/5/((Date.now()-f)/6e4)):0,i=t.length>0?Math.round((t.length-r)/t.length*100):100;x(t=>[...t,{lang:E.lang,wpm:e,accuracy:i,errors:r,time:S}]),n(`result`)}},spellCheck:!1,autoComplete:`off`,autoCorrect:`off`,autoCapitalize:`off`,placeholder:`Start typing the code above…`})]}),t===`result`&&(0,i.jsxs)(`div`,{className:`ct-idle`,children:[(0,i.jsxs)(`div`,{className:`ct-title`,style:{color:`#22c55e`},children:[`✅ `,E.lang,` Complete!`]}),(0,i.jsxs)(`div`,{className:`ct-result-stats`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`b`,{style:{color:`#facc15`},children:m}),(0,i.jsx)(`span`,{children:`WPM`})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`b`,{style:{color:`#22c55e`},children:[g,`%`]}),(0,i.jsx)(`span`,{children:`Accuracy`})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`b`,{style:{color:`#f87171`},children:v}),(0,i.jsx)(`span`,{children:`Errors`})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`b`,{style:{color:`#38bdf8`},children:[S,`s`]}),(0,i.jsx)(`span`,{children:`Time`})]})]}),b.length>1&&(0,i.jsx)(`div`,{className:`ct-score-list`,children:b.map((e,t)=>(0,i.jsxs)(`div`,{className:`ct-score-row`,children:[(0,i.jsxs)(`span`,{children:[a.find(t=>t.lang===e.lang)?.icon,` `,e.lang]}),(0,i.jsxs)(`span`,{style:{color:`#facc15`},children:[e.wpm,` WPM`]}),(0,i.jsxs)(`span`,{style:{color:`#22c55e`},children:[e.accuracy,`%`]})]},t))}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:10,flexWrap:`wrap`,justifyContent:`center`},children:[o+1<a.length&&(0,i.jsxs)(`button`,{className:`ct-btn`,onClick:()=>O(o+1),children:[`Next: `,a[o+1].icon,` `,a[o+1].lang,` →`]}),(0,i.jsx)(`button`,{className:`ct-btn ct-sec`,onClick:()=>n(`idle`),children:`Choose Language`}),e&&(0,i.jsx)(`button`,{className:`ct-btn ct-sec`,onClick:()=>e({scores:b}),children:`← Back`})]})]})]})}export{o as default};