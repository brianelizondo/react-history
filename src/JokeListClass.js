import React from "react";
import axios from "axios";
import JokeClass from "./JokeClass";
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
    }

    /* change vote for this id by delta (+1 or -1) */
    vote(id, delta) {
        this.setState(allJokes => ({
            jokes: allJokes.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
        }));
    }

    /* get jokes from api */
    async getJokes(){
        let j = [...this.state.jokes];
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
        
                {sortedJokes.map(j => (
                    <JokeClass text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
                ))}
            </div>
        );
    }
}

export default JokeListClass;