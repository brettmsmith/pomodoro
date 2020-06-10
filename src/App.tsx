import React, {useEffect, useReducer} from 'react';
import './App.css';

const zeroPad = (num: any, places: any) => String(num).padStart(places, '0');
const audio = new Audio("/bell.mp3");
audio.volume = .5;

// todo bs: set up constants for pomodoro/short/long break times
const LONG_BREAK_SECONDS = 900;
const SHORT_BREAK_SECONDS = 300;
const POMODORO_SECONDS = 1500;


function App() {

    function getNextState(state: any) {
        // todo bs: a bit confusing because we're judging what just happened by the next thing that's about to happen
        if (state.mode === 'manual') {
            return {
                ...state,
                running: false
            }
        }

        switch (state.nextAction) {
            case 'pomodoro':
                return {
                    ...state,
                    nextAction: state.numberOfPomodorosCompleted === 3 ? 'longBreak' : 'shortBreak',
                    time: POMODORO_SECONDS
                };
            case 'shortBreak':
                return {
                    ...state,
                    nextAction: 'pomodoro',
                    numberOfPomodorosCompleted: state.numberOfPomodorosCompleted + 1,
                    time: SHORT_BREAK_SECONDS
                };
            case 'longBreak':
                return {
                    ...state,
                    nextAction: 'pomodoro',
                    numberOfPomodorosCompleted: 0,
                    time: LONG_BREAK_SECONDS
                };
        }
    }

    function reducer(state: any, action: any) {
        switch (action.type) {
            case 'timeRunOut':
                return getNextState(state);
            case 'start':
                if (state.time > 0) {
                    return {
                        ...state,
                        running: true
                    };
                }
                return state;
            case 'pause':
                return {
                    ...state,
                    running: false
                };
            case 'tick':
                return {
                    ...state,
                    time: state.time - 1
                };
            case 'set':
                return {
                    ...state,
                    time: action.time,
                    running: true
                };
            case 'goto':
                return {
                    ...state,
                    nextAction: '',
                };
            case 'toggleMode':
                return {
                    ...state,
                    mode: state.mode === 'manual' ? 'auto' : 'manual'
                }
        }
    }

    const initialState = {nextAction: 'shortBreak', numberOfPomodorosCompleted: 0, running: true, time: POMODORO_SECONDS, mode: 'auto'};
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const app = document.querySelector('.App') as HTMLElement;
        app.focus();

        const focusHandler = (_: FocusEvent) => {
            app.focus();
        };
        app.addEventListener('blur', focusHandler);

        return () => {
            app.removeEventListener('blur', focusHandler);
        }
    }, []);

    useEffect(() => {
        console.log(`useEffect running | state.running: ${state.running}`);
        if (state.time > 0 && state.running) {
            let timeout = window.setTimeout(() => {
                dispatch({type: 'tick'});
            }, 1000);
            return () => clearTimeout(timeout);
        } else if (state.time === 0 && state.running) {
            audio.play().then(() => dispatch({type: 'timeRunOut'}));
        }
    }, [state]);

    function setTimerAndStart(time: number) {
        dispatch({type: 'set', time: time});
    }

    const startPomodoro = () => setTimerAndStart(POMODORO_SECONDS);
    const startShortBreak = () => setTimerAndStart(SHORT_BREAK_SECONDS);
    const startLongBreak = () => setTimerAndStart(LONG_BREAK_SECONDS);

    function handleKeyPress(e: any) {
        // todo bs: I think to fix this, we can just dispatch to the next thing we want (make a new dispatch case of goto)
        switch (e.key) {
            case 'P':
                startPomodoro();
                return;
            case 'S':
                startShortBreak();
                return;
            case 'L':
                startLongBreak();
                return;
            case 'Q':
            case 'T':
                console.log(`keypress | state.running: ${state.running}`);
                if (state.running) {
                    dispatch({type: 'pause'});
                } else {
                    dispatch({type: 'start'});
                }
                return;
            default:
                return;
        }
    }

    return (
        <div className="App" onKeyDown={handleKeyPress} tabIndex={0}>
            <p>{Math.trunc(state.time / 60)}:{zeroPad((state.time % 60), 2)}</p>
            <button onClick={() => dispatch({type: 'start'})}>Start</button>
            <button onClick={() => dispatch({type: 'pause'})}>Stop</button>
            <button onClick={() => startPomodoro()}>Start Pomodoro</button>
            <button onClick={() => startShortBreak()}>Start Short Break</button>
            <button onClick={() => startLongBreak()}>Start Long Break</button>
            <button onClick={() => dispatch({type: 'toggleMode'})}>Toggle mode</button>
            <p>Coming next: {state.nextAction}</p>
            <p>Completed Pomodoros: {state.numberOfPomodorosCompleted}</p>
            <p>Pomodoro mode: {state.mode}</p>
        </div>
    );
}

export default App;
