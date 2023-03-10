import React, { Component } from "react";
import axios from 'axios';
import { useParams } from 'react-router-dom';

export function withRouter(Children) {
    return (props) => {
        const match = { params: useParams() };
        return <Children {...props} match={match} />
    }
}
class Quiz extends Component {
    constructor(props) {
        super(props);
        this.questionNr = 0;
        this.questionCount = 0;
        this.quizDone = false;
        // Start Timer 
        var sec = 0;
        function pad(val) { return val > 9 ? val : "0" + val; }
        setInterval(function () {
            document.getElementById("seconds").innerHTML = pad(++sec % 60);
            document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
        }, 1000);

        this.state = {
            question: 'Question?',
            option_a: 'optionA',
            option_b: 'optionB',
            option_c: 'optionC',
            option_d: 'optionD',
            selectedOption: null,
            totalSkillPoint: 0,
            correctAnswersCount: 0,
            wrongAnswersCount: 0,
            completion_time: 0,
            questionsObject: Object,
        };
        this.onChangeQuestion = this.onChangeQuestion.bind(this);
        this.nextFunction = this.nextFunction.bind(this);
        this.resultFunction = this.resultFunction.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:5000/questions')
            .then(response => {
                this.setState({
                    questionsObject: response.data,
                    question: response.data[0].question,
                    option_a: response.data[0].option_a,
                    option_b: response.data[0].option_b,
                    option_c: response.data[0].option_c,
                    option_d: response.data[0].option_d,
                });
                this.questionCount = Object.keys(response.data).length;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    componentDidUpdate(){
        if(this.quizDone){
            this.resultFunction();
        }
    }

    handleClick = (e) => {
        e.target.style.border = "2px solid #00FF00"
        if (e.target.id === "buttonA") {
            document.getElementById("buttonB").style.border = "0px";
            document.getElementById("buttonC").style.border = "0px";
            document.getElementById("buttonD").style.border = "0px";
            this.setState({
                selectedOption: 'A'
            });
        }
        else if (e.target.id === "buttonB") {
            document.getElementById("buttonA").style.border = "0px";
            document.getElementById("buttonC").style.border = "0px";
            document.getElementById("buttonD").style.border = "0px";
            this.setState({
                selectedOption: 'B'
            });
        }
        else if (e.target.id === "buttonC") {
            document.getElementById("buttonA").style.border = "0px";
            document.getElementById("buttonB").style.border = "0px";
            document.getElementById("buttonD").style.border = "0px";
            this.setState({
                selectedOption: 'C'
            });
        }
        else {
            document.getElementById("buttonA").style.border = "0px";
            document.getElementById("buttonB").style.border = "0px";
            document.getElementById("buttonC").style.border = "0px";
            this.setState({
                selectedOption: 'C'
            });
        }
    }

    // question cart change question by number
    onChangeQuestion(nr) {
        if (nr != null) {
            this.setState({
                question: this.state.questionsObject[nr].question,
                option_a: this.state.questionsObject[nr].option_a,
                option_b: this.state.questionsObject[nr].option_b,
                option_c: this.state.questionsObject[nr].option_c,
                option_d: this.state.questionsObject[nr].option_d,
            });
        }
    }

    nextFunction() {
        // if an option selected go to next 
        if (this.state.selectedOption != null) {
            const correct_answer = this.state.questionsObject[this.questionNr].correct_answer;
            const selectedOption = this.state.selectedOption;
            const questionSkillPoint = this.state.questionsObject[this.questionNr].skill_point;

            // Check question is correct
            if (selectedOption === correct_answer) {
                this.setState({
                    totalSkillPoint: this.state.totalSkillPoint + questionSkillPoint,
                    correctAnswersCount: this.state.correctAnswersCount + 1
                });
            }
            else {
                this.setState({
                    wrongAnswersCount: this.state.wrongAnswersCount + 1
                });
            }

            // Go next question , if question finish go to result page
            if (this.questionNr < this.questionCount - 1) {
                this.questionNr++;
                document.getElementById("buttonA").style.border = "0px";
                document.getElementById("buttonB").style.border = "0px";
                document.getElementById("buttonC").style.border = "0px";
                document.getElementById("buttonD").style.border = "0px";
                this.setState({
                    selectedOption: null
                });
                this.onChangeQuestion(this.questionNr);
            }
            else {
                // Save the minutes and finish the quiz
                const minutes = parseInt(document.getElementById("minutes").innerHTML);
                const seconds = parseInt(document.getElementById("seconds").innerHTML);
                this.setState({
                    completion_time: minutes*60 + seconds
                });
                this.quizDone =true;
            }
        }
        else {
            alert("Please answer the question!");
        }
    }

    // when quiz finish call this function to go to result page
    resultFunction() {

        const quizResult = {
            completed_quiz: true,
            total_skill_point: this.state.totalSkillPoint,
            correct_answer_count: this.state.correctAnswersCount,
            wrong_answer_count: this.state.wrongAnswersCount,
            completion_time: this.state.completion_time,
        }

        axios.post('http://localhost:5000/users/result/' + this.props.match.params.username, quizResult)
            .then(window.location = '/result/'+this.props.match.params.username)
            .catch((error) => {
                alert("Something went wrong! Error: " + error);
                window.location = '/quiz'
            });
    }

    render() {
        return (
            <div className="container">
                <div className="flex w-full justify-end pb-2">
                    <div className="w-16 h-10 flex items-center justify-center font-bold  bg-black text-white rounded-lg">
                        <span id="minutes"></span>:<span id="seconds"></span>
                    </div>
                </div>
                <div className=" text-white bg-black w-full pt-6 pb-6 px-6 rounded-xl">
                    <div className="flex w-full h-6 item-center justify-end">
                        ({this.questionNr + 1}/{this.questionCount})
                    </div>
                    <div className="flex flex-col w-full h-full items-center justify-center">
                        <div className="flex flex-row items-center pb-6">
                            <h3 className="text-danger">Q.</h3>
                            <h5 className="mt-1 ml-2">{this.state.question}</h5>
                        </div>
                        <div className="flex flex-col pb-6">
                            <button
                                id="buttonA"
                                onClick={this.handleClick}
                                className="py-2 px-4 rounded-lg mt-2 text-xl font-bold flex items-start">
                                A) {this.state.option_a}
                            </button>
                            <button
                                id="buttonB"
                                onClick={this.handleClick}
                                className="py-2 px-4 rounded-lg mt-2 text-xl font-bold  flex items-start">
                                B) {this.state.option_b}
                            </button>
                            <button
                                id="buttonC"
                                onClick={this.handleClick}
                                className="py-2 px-4 rounded-lg mt-2 text-xl font-bold  flex items-start">
                                C) {this.state.option_c}
                            </button>
                            <button
                                id="buttonD"
                                onClick={this.handleClick}
                                className="py-2 px-4 rounded-lg mt-2 text-xl font-bold  flex items-start">
                                D) {this.state.option_d}
                            </button>
                        </div>
                        <div className="w-full flex justify-end items-center">
                            <button
                                className="btn btn-success align-items-center"
                                onClick={this.nextFunction}
                            >
                                Next
                                <i className="fa fa-angle-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Quiz);