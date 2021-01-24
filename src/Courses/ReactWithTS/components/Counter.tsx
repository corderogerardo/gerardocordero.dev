import { Component } from 'react'

interface CounterProps {
  defaultCount: number;
}

interface CounterState {
  count:
}

class Counter extends Component<CounterProps> {
  constructor(props) {
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
