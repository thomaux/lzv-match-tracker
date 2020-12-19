import Tick from "@pqina/flip";
import "@pqina/flip/dist/flip.min.css";
import { Component, createRef, RefObject } from "react";

interface FlipProperties {
    value: string;
}

export class Flip extends Component<FlipProperties> {
    private tickRef: RefObject<HTMLDivElement>;
    private tickInstance: any;

    constructor(props: FlipProperties) {
        super(props);
        this.tickRef = createRef();
    }

    componentDidMount() {
        this.tickInstance = Tick.DOM.create(this.tickRef.current, {
            value: this.props.value
        });
    }

    componentDidUpdate() {
        if (!this.tickInstance) return;
        this.tickInstance.value = this.props.value;
    }

    componentWillUnmount() {
        if (!this.tickInstance) return;
        Tick.DOM.destroy(this.tickRef.current);
    }

    render() {
        return (
            <div ref={this.tickRef} className="tick">
                <div data-repeat="true" aria-hidden="true">
                    <span data-view="flip">Tick</span>
                </div>
            </div>
        );
    }
}
