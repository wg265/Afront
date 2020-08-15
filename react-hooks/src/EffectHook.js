import React , {useState, useEffect} from 'react';
function Haha() {
    useEffect(()=>{
        console.log('i am haha');
    },[]);
    return <h2>this is haha</h2>
}
function EffectHook(props) {
    const [count, setCount] = useState(0);
    const [hidden, setHidden] = useState(false);
    //useEffect -> didmount
    //async call
    // useEffect(() => {
    //     console.log(`effect hook called, the count is ${count}`);
    // })
    //param1 -> define a callback fn
    //param2 -> define a condition
    //control useEffect
    // useEffect(()=>{
    //     setTimeout(()=>{
    //         (setCount(prevState => prevState + 10))
    //     }, 1000)
    // }, [hidden]);
    //3. unbind useEffect
    useEffect(() => {
        console.log(count);
        return ()=>{console.log('bye haha')}
    })
    return (
        <div>
            <h1>Clicked {count} times!</h1>
            <button onClick = {() => setCount(count+ 100)}>+</button>
            <hr/>
            <button onClick = {() => setHidden(!hidden)}>see haha</button>
            {
                this.hidden ? <Haha/> : null
            }
        </div>
    );
}

export default EffectHook;