import "./ResultModal.css"

function ResultModal({result,onClose}){

if(!result) return null

return(

<div className="result-overlay">

<div className="result-card">

<h2>Typing Test Complete</h2>

<p>WPM: {result.wpm}</p>

<p>Accuracy: {result.accuracy}%</p>

<p>Characters: {result.characters}</p>

<p>Time: {result.time}s</p>

<button onClick={onClose}>
Close
</button>

</div>

</div>

)

}

export default ResultModal