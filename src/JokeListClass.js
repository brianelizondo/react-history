import React from "react";
import axios from "axios";
import JokeClass from "./JokeClass";
import loadingImage from "./loading.gif"
import "./JokeList.css";

class JokeListClass extends React.Component{
    static defaultProps = {
        numJokesToGet: 10
    }
    constructor(props) {
        super(props);
        this.state = { jokes: [] };
        this.generateNewJokes = this.generateNewJokes.bind(this);
        this.vote = this.vote.bind(this);
    }

    /* empty joke list and then call getJokes */
    generateNewJokes(){
        this.setState({ jokes: [] });
        window.localStorage.clear();
    }

    /* change vote for this id by delta (+1 or -1) */
    vote(id, delta) {
        this.setState(allJokes => ({
            jokes: allJokes.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
        }));

        let localJokes = JSON.parse(window.localStorage.getItem("jokes"));
        let newLocalJokes = localJokes.map(joke => (joke.id === id ? { ...joke, votes: joke.votes + delta } : joke ));
        window.localStorage.setItem("jokes", JSON.stringify(newLocalJokes));
    }

    /* get jokes from api */
    async getJokes(){
        let j;
        if(window.localStorage.getItem("jokes")){
            j = JSON.parse(window.localStorage.getItem("jokes"));
        }else{
            j = [...this.state.jokes];
        }
        let seenJokes = new Set();

        try {
            while (j.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com", {
                    headers: { Accept: "application/json" }
                });
                let { status, ...jokeObj } = res.data;
        
                if (!seenJokes.has(jokeObj.id)) {
                    seenJokes.add(jokeObj.id);
                    j.push({ ...jokeObj, votes: 0 });
                } else {
                    console.error("duplicate found!");
                }
            }
            this.setState({ jokes: j });
            window.localStorage.setItem("jokes", JSON.stringify(j));
        } catch (e) {
            console.log(e);
        }
    }

    /* get jokes if there are no jokes */
    componentDidMount(){
        if(this.state.jokes.length === 0){ this.getJokes() }
    }
    /* get new jokes if there are no jokes */
    componentDidUpdate(){
        if(this.state.jokes.length === 0){ this.getJokes() }
    }

    /* render: either loading spinner or list of sorted jokes. */
    render() {
        let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
        return (
            <div className="JokeList">
                <button className="JokeList-getmore" onClick={this.generateNewJokes}>Get New Jokes</button>

                { this.state.jokes.length < this.props.numJokesToGet ? (
                    <div className="JokeList-loading"><img src={ loadingImage } alt="" /></div>
                ) : null }
        
                {sortedJokes.map(j => (
                    <JokeClass text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
                ))}
            </div>
        );
    }
}

export default JokeListClass;