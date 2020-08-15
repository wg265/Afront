import React , {useState} from 'react';

function StateHook(props) {
    const [step, setStep] = useState(0);
    const [hidden, setHidden] = useState(true);
    return (
        <div>
            <h1>Today you have {step} steps !</h1>
            <button onClick ={() => setStep(step + 1)}> + </button>
            <hr/>
            <button onClick = {() => setHidden(
                prevState => { return !prevState }
            )}>show haha</button>
            {
                !hidden ? <h2>haha</h2> : null
            }
        </div>

    );
}

export default StateHook;