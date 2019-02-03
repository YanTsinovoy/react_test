import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


import {createStore, combineReducers} from 'redux';

let store = createStore((state, action) => { //единственный редьюсер данного хранилища
    if (state === undefined){ //redux запускает редьюсер хотя бы раз, что бы инициализировать хранилище
        return {counter: 0};  //обязательно вернуть новый объект, а не изменить текущий state
    }
    if (action.type === 'COUNTER_INC'){ //в каждом action должен быть type
        return {counter: state.counter +1} //создаем новый объект базируясь на данных из предыдущего состояния
    }
    if (action.type === 'COUNTER_DEC'){
        return {counter: state.counter -1}
    }
    return state; //редьюсеров может быть несколько, в таком случае вызываются все редьюсеры, но далеко не всегда action.type будет относится к этому редьюсеру. Тогда редьюсер должен вернуть state как есть.
})

store.subscribe(()=> console.log(store.getState())) // подписка на обновления store

store.dispatch({
    type: 'COUNTER_INC'
})

store.dispatch({
    type: 'COUNTER_DEC'
})

function connect(mapStateToProps, mapDispatchToProps){
	return RenderComponent =>
		class extends Component {
			constructor(props){
				super(props)
				this.state = {reduxState: {}}

				store.subscribe(()=> {
					this.setState({reduxState: mapStateToProps(store.getState())})
				})

				const w = {};
				for (let propName in mapDispatchToProps){
					w[propName] = (...params) =>
									store.dispatch(mapDispatchToProps[propName](...params))
				}
				this.mapDispatchToProps = w;
			}

			render(){
				return(
					<RenderComponent {...this.state.reduxState} {...this.mapDispatchToProps} {...this.props}/>
				)
			}
		}
}

setInterval(()=>store.dispatch({type: 'COUNTER_INC'}), 2000)




let Counter = props => {
	console.log(props)
	return (
		<div style={props.style}>
			<button onClick={props.inc}>+</button>
			<span>{props.counter}</span>
			<button onClick={props.dec}>-</button>
		</div>
	)
}

let ConnectedCounter = connect(s => ({counter: s.counter}),
							   {inc(){
								   console.log('нуну')
								   return {
									   type: 'COUNTER_INC'
								   }
							   },
							   dec(){
								   return {
									   type: 'COUNTER_DEC'
								   }
							   }})(Counter)


class CounterRP extends Component {
	state = {counter: this.props.defaultCounter}

	change = delta => this.setState((prevState, props)=>{
		return ({
		counter: prevState.counter +delta
	})})

	inc   = this.change.bind(this,1)
	dec   = this.change.bind(this,-1)

	render(){
		let Render = this.props.render
		return (
			<>
				<Render inc={this.inc} dec={this.dec} counter={this.state.counter}/>
			</>
		)
	}

	static get defaultProps(){
		return {
			defaultCounter: 0,
			render: Counter
		}
	}
}


let ColorCounter = p =>
<div style={{backgroundColor: `rgb(${p.counter},${p.counter},${p.counter})`}}>
	<button onClick={p.inc}>+</button>
	<span>{p.counter}</span>
	<button onClick={p.dec}>-</button>
</div>


function CountableHOC(RenderComponent){
	return () => <CounterRP render={RenderComponent} />
}

let HOC1 = CountableHOC(Counter)
let HOC2 = CountableHOC(ColorCounter)

function withStyle(style){
	return RenderComponent =>
	         p => <RenderComponent style={style} {...p}/>
}

let MoodColorBlack = withStyle({backgroundColor: 'black', color: "white"})

let BlackCounter   = withStyle({backgroundColor: 'red', color: "white"})(Counter)
let BlackButton   =  MoodColorBlack(p => <button style={p.style} {...p}>{p.children}</button>)


let App = () =>
<div>
	они поломали мне JS
	<ConnectedCounter />
	<ConnectedCounter />
	<ConnectedCounter />
	<ConnectedCounter />
</div>


//export default App;
