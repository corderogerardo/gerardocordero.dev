import { Component } from 'react'

interface CounterProps {
  defaultCount: number;
}

interface CounterState {
  count: number
}

class Counter extends Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.defaultCount
    };
  }
  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button
          onClick={() => this.setState(({ count }) => ({ count: count - 1 }))}>

        </button>
      </div>

    )
  }
}

export default Counter;
