import React from "react";
import './toolbar.css'

interface IProps {
    title: string;
    subTitle: string;
}

interface IState extends IProps {
}

export class RtToolbar extends React.PureComponent<IProps, IState> {
    state: IState;

    constructor(props: IProps) {
        super(props);
        this.state = {
            ...this.props
        };
    }

    render() {
        return <div className="toolbar-wrapper">
            <img className="logo-img" src="/images/icons/icon-72x72.png" alt="Logo" />
            <div className="toolbar-content">
                <div className="logo">{this.state.title}</div>
                <div className="logo-subtitle">{this.state.subTitle}</div>
            </div>
        </div>
    }

}

export default RtToolbar;