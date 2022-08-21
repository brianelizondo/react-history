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
        this.resetVotes = this.resetVotes.bind(this);
        this.lockJoke = this.lockJoke.bind(this);
    }

    /* empty joke list and then call getJokes */
    generateNewJokes(){
        let localJokes = JSON.parse(window.localStorage.getItem("jokes"));
        let localJokesLocked = localJokes.filter(joke => (joke.locked === true));
        
        this.setState({ jokes: localJokesLocked });
        window.localStorage.setItem("jokes", JSON.stringify(localJokesLocked));
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

    /* reset the vote counts */
    resetVotes() {
        this.setState(allJokes => ({
            jokes: allJokes.jokes.map(j => ({ ...j, votes: 0 }))
        }));
        window.localStorage.clear();
    }

    /* "lock" a joke with a lock button */
    lockJoke(id) {
        this.setState(allJokes => ({
            jokes: allJokes.jokes.map(j => (j.id === id ? { ...j, locked: !j.locked } : j))
        }));

        let localJokes = JSON.parse(window.localStorage.getItem("jokes"));
        let newLocalJokes = localJokes.map(joke => (joke.id === id ? { ...joke, locked: !joke.locked } : joke ));
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
        let seenJokes = new Set(j.map(joke => joke.id));

        try {
            while (j.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com", {
                    headers: { Accept: "application/json" }
                });
                let { status, ...jokeObj } = res.data;
        
                if (!seenJokes.has(jokeObj.id)) {
                    seenJokes.add(jokeObj.id);
                    j.push({ ...jokeObj, votes: 0, locked: false });
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
                <button className="JokeList-reset" onClick={this.resetVotes}>Reset Votes</button>

                { this.state.jokes.length < this.props.numJokesToGet ? (
                    <div className="JokeList-loading"><img src={ loadingImage } alt="" /></div>
                ) : null }
        
                {sortedJokes.map(j => (
                    <JokeClass text={j.joke} key={j.id} id={j.id} votes={j.votes} lock={j.locked} vote={this.vote} locked={this.lockJoke} />
                ))}
            </div>
        );
    }
}

export default JokeListClass;