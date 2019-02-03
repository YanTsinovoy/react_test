import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

function jsonPost(url, data)
    {
        return new Promise((resolve, reject) => {
            var x = new XMLHttpRequest();   
            x.onerror = () => reject(new Error('jsonPost failed'))
            //x.setRequestHeader('Content-Type', 'application/json');
            x.open("POST", url, true);
            x.send(JSON.stringify(data))

            x.onreadystatechange = () => {
                if (x.readyState == XMLHttpRequest.DONE && x.status == 200){
                    resolve(JSON.parse(x.responseText))
                }
                else if (x.status != 200){
                    reject(new Error('status is not 200'))
                }
            }
        })
    }

class Inputs extends Component {
    render() {
        return (
            <div>
                <input placeholder="nick" ref={ c => this.nick = c} />
                <input placeholder="message" ref={ c => this.message = c} />
                <button onClick={ () => this.props.onSend(this.nick.value, this.message.value)}>Send</button>
            </div>
        )
    }

    static get defaultProps(){
        return {
            onSend(nick, message){
                console.log(`onSend isn't set`, nick, message)
            }
        }
    }
}

let ChatMessage = ({msg}) =>
<div>
    <b>{msg.nick}:</b>
    {msg.message}
</div>

let Chat = ({messages}) =>
<div>
    { messages && messages.length 
        ? (messages.map(msg => <ChatMessage msg={msg}/>))
        : "NO DATA" }
</div>



let getMessages = (slice=0) =>
    jsonPost("http://students.a-level.com.ua:10012", 
        {func: 'getMessages', 
         messageId: slice })

class ChatContainer extends Component {
    constructor(props){
        super(props)

        this.state = {messages: []}
    }

    componentDidMount(){
        setInterval(() => getMessages()
                        .then(data => data.data.reverse())
                        .then(data => this.setState({messages: data})), 3000)
    }

    render(){
        console.log('render')
        return (
            <Chat messages={this.state.messages} />
        )
    }
}

let sendMessage = (nick, message) =>
    jsonPost("http://students.a-level.com.ua:10012", 
        {func: 'addMessage', 
         nick,
         message})

let App = () =>
  <div className="App">
        <Inputs onSend={ sendMessage }/>
        <ChatContainer />
  </div>

export default App;
