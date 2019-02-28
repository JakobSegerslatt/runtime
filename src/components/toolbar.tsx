import React from "react";
import './toolbar.css'

interface IProps {
    title: string;
    subTitle: string;
}

export class RtToolbar extends React.PureComponent<IProps> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return <div className="toolbar-wrapper">
            <img className="logo-img" src="/images/icons/icon-72x72.png" alt="Logo" />
            <div className="toolbar-content">
                <div className="logo">{this.props.title}</div>
                <div className="logo-subtitle">{this.props.subTitle}</div>
            </div>
        </div>
    }

}

export default RtToolbar;