import { useState } from "react";
import "./QuizPlayer.css";

export default function QuizPlayer() {

const questions=[

{
question:"What is 5 × 6 ?",
options:["20","25","30","35"],
answer:2
},

{
question:"Which colour is made by mixing Blue and Yellow?",
options:["Purple","Green","Orange","Red"],
answer:1
},

{
question:"Who painted the Mona Lisa?",
options:[
"Picasso",
"Leonardo da Vinci",
"Van Gogh",
"Michelangelo"
],
answer:1
}

];

const [current,setCurrent]=useState(0);
const [score,setScore]=useState(0);
const [finished,setFinished]=useState(false);

const answerQuestion=(index)=>{

if(index===questions[current].answer){

setScore(score+1);

}

if(current+1===questions.length){

setFinished(true);

}
else{

setCurrent(current+1);

}

};

if(finished){

return(

<div className="quizFinish">

<h1>Quiz Completed 🎉</h1>

<h2>

Your Score

</h2>

<h3>

{score} / {questions.length}

</h3>

<button>

Continue Learning

</button>

</div>

);

}

return(

<div className="quizPage">

<div className="quizCard">

<h4>

Question {current+1} of {questions.length}

</h4>

<h2>

{questions[current].question}

</h2>

<div className="options">

{questions[current].options.map((option,index)=>(

<button
key={index}
onClick={()=>answerQuestion(index)}
>

{option}

</button>

))}

</div>

</div>

</div>

);

}