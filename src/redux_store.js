import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

let messageReducer = (state, action) => {
  if (state === undefined){
        return {messages: [], flag: false, lastMes: 0}
    }
    if (action.type === 'ADD_MESSAGES'){
        let takenMessages = action.mess
        let nM = JSON.parse(JSON.stringify(state.messages))
        takenMessages.forEach(el => nM.push(el))
        let f = state.messages.length ? state.messages[state.messages.length -1].timestamp != nM[nM.length-1].timestamp
          : true
        return {messages: nM, flag: f, lastMes: nM.length - 1}
    }
    return state;
}
//
let scrollReduser = (state, action) => {
  if(state === undefined){
    return {scroll: true}
  }
  if(action.type === "ON_SCROLL"){
    return {scroll: true}
  }
  if(action.type === "OFF_SCROLL"){
    return {scroll: false}
  }
  return state
}
//
let inputsStateReducer = (state, action) => {
  if(state === undefined){
    return {disable: false, color: "gray", clear: false }
  }
  if(action.type === "SENDING"){
    return {disable: true, color: "gray", clear: false }
  }
  if(action.type === "SENT"){
    return {disable: false, color: "gray", clear: true }
  }
  if(action.type === "FAIL"){
    return {disable: false, color: "red", clear: false }
  }
  if(action.type === "DEFAULT"){
    return {disable: false, color: "gray", clear: false }
  }
  return state
}
//

const reducers = combineReducers({
    mes:  messageReducer,
    stInp: inputsStateReducer,
    scr: scrollReduser
})

const store = createStore(reducers,applyMiddleware(thunk));

export default store
