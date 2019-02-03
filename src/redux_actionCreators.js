import {jsonPost, getMessages} from './server_workers.js'

let addMes = function(arrMes){
  return {
    type: "ADD_MESSAGES",
    mess: arrMes
  }
}
let inpSending = function(){
  return {type:"SENDING"}
}
let inpSent = function(){
  return {type:"SENT"}
}
let inpFail = function(){
  return {type:"FAIL"}
}
let inpDef = function(){
  return {type: "DEFAULT"}
}
let scrOn = function(){
  return {type: "ON_SCROLL"}
}
let scrOff = function(){
  return {type: "OFF_SCROLL"}
}
//

let sendMess = function(nick, message){
      return async function(dispatch){
        dispatch(inpSending())
        await jsonPost("http://students.a-level.com.ua:10012",
            {func: 'addMessage',
             nick,
             message}).then(response => {
               getMessages().then(data => data.data )
               .then(data => {
                 dispatch(addMes(data))
                 dispatch(inpSent())
                 dispatch(inpDef())
                 dispatch(scrOn())
               })
             }).catch(err => {
               dispatch(inpFail())
             })
      }
}

export {addMes, inpSending, inpSent, inpFail, inpDef, scrOn, scrOff, sendMess}
