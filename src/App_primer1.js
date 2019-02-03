import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


import {Provider, connect}   from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';

import thunk from 'redux-thunk';


let sendReducer = (state, action) => { //один из редьюсеров данного хранилища
    if (state === undefined){ //redux запускает редьюсер хотя бы раз, что бы инициализировать хранилище
        return {status: "SENT", payload: null, error: null}
    }
    if (action.type === 'SET_STATUS'){
        return {status: action.status, payload: action.payload, error: action.error}
    }
}

const store = createStore(sendReducer, applyMiddleware(thunk));

store.subscribe(()=> console.log(store.getState())) // подписка на обновления store, теперь тут две ветви.

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

const actionPending     = () => ({ type: 'SET_STATUS', status: 'PENDING', payload: null, error: null })
const actionResolved    = payload => ({ type: 'SET_STATUS', status: 'RESOLVED', payload, error: null })
const actionRejected    = error => ({ type: 'SET_STATUS', status: 'REJECTED', payload: null, error })
const actionSent        = () => ({ type: 'SET_STATUS', status: 'SENT', payload: null, error: null })

let  delay = ms => new Promise((resolve,reject) => setTimeout(() => Math.random() > 0.1 ? resolve(ms) : reject(new Error('AAAAA')), ms))

function actionSendMessage(nick, message){
    return async function (dispatch){
        dispatch(actionPending())
        try {
            await delay(2000)
            dispatch(actionResolved(await jsonPost('http://students.a-level.com.ua:10012/', {func: 'addMessage', nick, message} )))
        }
        catch (e) {
            dispatch(actionRejected(e))
            await delay(2000).catch(actionRejected)
        }
        finally{
            dispatch(actionSent())
        }
    }
}

debugger;

class Inputs extends Component {
    state = {nick: '', message: ''}

    changeNick    = e => this.setState({nick: e.target.value})
    changeMessage = e => this.setState({message: e.target.value})

    sendClick     = () => this.props.onSend(this.state.nick, this.state.message)

    render(){
        if (this.props.status === 'RESOLVED' && this.state.message){
            this.setState({message: ''})
        }
        return (
            <div>
                <input type='text' placeholder='Nick' onChange={this.changeNick} value={this.state.nick}/>
                <input type='text'
                        style = {{backgroundColor: this.props.status === 'REJECTED' ? 'red' : ''}}
                        placeholder='Message'
                        onChange={this.changeMessage}
                        value={this.state.message}
                        disabled = {this.props.status === 'PENDING'}
                />
                <button onClick={this.sendClick}
                        disabled = {this.props.status === 'PENDING' || !this.state.message} >
                    Send
               </button>
            </div>
        )
    }

    static get defaultProps(){
        return {
            onSend(){
                throw TypeError('Please pass onSend handler to component')
            }
        }
    }
}

Inputs = connect(state => ({status: state.status}), {onSend: actionSendMessage})(Inputs)
let Status = connect(state => ({status: state.status}))(p => <span style={{color: 'red'}}>{p.status}</span>)


let App = p =>
<div>
    <Provider store = { store } >
       <Inputs />
       <Status />
    </Provider>
</div>



//export default App;
