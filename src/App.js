import React, { Component } from 'react';
import './App.css';

//redux
import {Provider, connect}   from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import  store  from './redux_store.js'
import {addMes, inpSending, inpSent, inpFail, inpDef, scrOn, scrOff, sendMess} from './redux_actionCreators.js'
import {jsonPost, getMessages} from './server_workers.js'

//redux End
let mapStToPr = state => ({messages: state.mes.messages, lastMes: state.mes.lastMes, flag: state.mes.flag, scroll: state.scr.scroll})
let mapDsToPr = {addMes, scrOn, scrOff}
//
let mapStToPrInp = state => ({mesSt: state.stInp})
let mapDsToPrInp = {addMes, inpSending, inpSent, inpFail, inpDef, scrOn, sendMess}
//

class Inputs extends Component {
    state =  {nick: "" , message: ""}
    addInpValue = (nickVal, messageVal) => {
      this.setState({
        nick: nickVal ? nickVal : this.state.nick,
        message: messageVal ? messageVal : this.state.message
      })
    }
    counter = 0
    mesCleaner = () => {
      console.warn("start")
      //для недопущения постоянной перерисовки
      return (num => {
        console.warn("next", this.counter)
        if(!this.counter++) this.setState({nick: this.state.nick,
        message: ""})
        return ""
      })()
    }
    render() {
      let pr = this.props
      if(!pr.mesSt.clear)this.counter = 0//КОСТЫЛЬ
      console.log(this.state)
        return (
            <div className="sendBox">
                <input id="nk" disabled={pr.mesSt.disable}
                  placeholder="nick"
                  onChange={e => this.addInpValue(e.target.value)}
                />

                <input id="ms" style={{border: `1px solid ${pr.mesSt.color}` }}
                  disabled={pr.mesSt.disable}
                  placeholder="message"
                  onChange={e => this.addInpValue(undefined ,e.target.value)}
                  value={pr.mesSt.clear ? this.mesCleaner() : undefined}
                />

                <button disabled={pr.mesSt.disable} id="btn" onClick={
                   () =>
                   this.props.sendMess(this.state.nick, this.state.message)
                }>Send</button>
            </div>
        )
    }
}

let ConnectedInputs = connect(mapStToPrInp, mapDsToPrInp)(Inputs)

let ChatMessage = ({msg}) => {
  let checker = value => {
    if(value != undefined) return value.toString()
    return value
  }
  return (
    <div className="messageBox">
      <div className="nick">{checker(msg.nick)}</div>
      <div className="message">
        {checker(msg.message)}
      </div>
      <div className="time">{new Date(msg.timestamp).toLocaleString()}</div>
    </div>
  )
}

class Chat extends Component {
  autoScroll = elem => {
    if(!elem instanceof HTMLElement){
      console.error("not HTMLElement in params f autoScroll")
      return
    }
    elem.scrollTop = elem.scrollHeight - elem.clientHeight
  }
  render () {
    let pr = this.props
    return (
      <div ref={el => this.scrollEl = el}  onScroll={e=> pr.scrOff()} className="mainChat"
      >
        { pr.messages && pr.messages.length
            ? (pr.messages.map(msg => <ChatMessage msg={msg}/>))
            : "NO DATA" }
        {this.scrollEl != undefined && pr.scroll ? this.autoScroll(this.scrollEl) : null}
      </div>
    )
  }
}

let MessageTable = p => {
      return (
        <div  className="message_table" style={{visibility: p.flag ? "visible" : "hidden" }}>
        </div>
      )
}

let Arrow = (p) => {
             return (
               <>
                  <a className="arrow" onClick={e => p.scroll() }></a>
               </>
             )
}


class ChatContainer extends Component {
    componentDidMount(){
        setInterval(() => {
          return getMessages(this.props.lastMes)
                          .then(data => data.data)
                          .then(data => {
                            this.props.addMes(data)
                            if(this.props.flag)this.props.scrOn()
                          })
        }, 3000)
    }
    render(){
        console.log('render')
        return (
          <>
            <Chat scroll={this.props.scroll}
              scrOn={this.props.scrOn}
              scrOff={this.props.scrOff}
              messages={this.props.messages}
            />
            <div className="chatPanel">
              <MessageTable flag={this.props.flag}/>
              <Arrow scroll={this.props.scrOn}/>
            </div>
          </>
        )
    }
}
let ConnectedChatContainer = connect(mapStToPr, mapDsToPr)(ChatContainer)


class App extends Component{
  render(){
    store.subscribe(()=> console.log(store.getState()))//подписочка
    return(
      <Provider store={store}>
        <div className="App">
               <ConnectedChatContainer/>
               <div className="panel">
                 <ConnectedInputs/>
               </div>
        </div>
      </Provider>
    )
  }
}

// как передать ссылку на до обьект в редакс, например для прокрутки этого обьекта из любого места
// неззя
// как вынести радакс в отдельный компонент стор с редьюсерами помещаем в отдельный компонент подключаем в App
// actionCreator ы  в отдельные файлы
// для чего лучше использовать редакс а для чего нет.
// коннектить каждый элемент или законектить все разом - то что глобально то коннектить
// как сделать с минимум копипасты

export default App;
