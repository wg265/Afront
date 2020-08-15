import React, {Component} from 'react';
import {Button, Spin, List, Avatar, Checkbox} from "antd";
import satellite from "../assets/images/satellite.svg"
class SatelliteList extends Component {
    state = {
        selected:[]
    }
    showMap = () => {
        const {selected} = this.state;
        this.props.onShowMap(selected);
    }
    render() {
        const {satInfo, isLoad} = this.props;
        const {selected} = this.state;
        const satList = satInfo ? satInfo.above : [];
        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn"
                        size="large"
                        onClick = {this.showMap}
                        disabled={selected.length === 0}>Track on the map</Button>
                <hr/>
                {
                    isLoad ?
                        <div className = "spin-box">
                            <Spin tip = "Loading" size="large"/>
                        </div>
                        :
                        <List
                            className="sat-list"
                        itemLayout="horizontal"
                        dataSource={satList}
                        renderItem={item => (
                            <List.Item actions = {[<Checkbox onChange={this.onChange}
                                                             dataInfo={item}/>]}>
                                <List.Item.Meta
                                avatar= {<Avatar src = {satellite}
                                size = "large"
                                alt = "satellite"/>}
                                title = {<p>{item.satname}</p>}
                                description={<p>{`Launch Date : ${item.launchDate}`}</p>}/>
                            </List.Item>
                        )}></List>
                }
            </div>
        );
    }
    onChange = e => {
        const {dataInfo, checked} = e.target;
        const {selected} = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected);
        this.setState({
            selected: list
        })
    }
    addOrRemove = (item, status, list) => {
        console.log(item);
        const found = list.some(entry => entry.satid === item.satid);
        if (status && !found) {
            list.push(item);
        }
        if (!status && found) {
            list = list.filter(entry => entry.satid !== item.satid);
        }
        return list;
    }
}

export default SatelliteList;