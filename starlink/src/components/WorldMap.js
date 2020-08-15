import React, {Component} from 'react';
import {Spin} from "antd";
import {SAT_API_KEY, SATELLITE_POSITION_URL, WORLD_MAP_URL} from '../constants';
import {feature} from 'topojson-client';
import {geoGraticule, geoPath} from "d3-geo";
import {select as d3select} from 'd3-selection';
import {geoKavrayskiy7} from "d3-geo-projection";
import axios from 'axios';
import  {timeFormat as d3TimeFormat} from "d3-time-format";
import {schemeCategory10} from "d3-scale-chromatic";
import * as d3Scale from 'd3-scale';
const width = 760;
const height = 460;

class WorldMap extends Component {

    constructor() {
        super();
        this.state = {
            map : null,
            color : d3Scale.scaleOrdinal(schemeCategory10),
            isLoad: false,
            isDrawing:false
        }
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {
            const {observerLat, observerLong, duration,observerElevation} = this.props.observerData;
            const startTime = duration[0] * 60, endTime = duration[1] * 60;
            const urls = this.props.satData.map(sat => {
                const {satid} = sat;
                const url = `${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong}/${observerElevation}
                /${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            });
            this.setState(()=>({isLoad: true}));
            axios.all(urls)
                .then(
                    axios.spread((...args) => {
                        return args.map(item => item.data);
                    })
                )
                .then(res => {
                    this.setState({
                        isLoad: false,
                        isDrawing: true
                    });
                    if (!prevState.isDrawing) {
                        this.track(res);
                    } else {
                        const oHint = document.getElementsByClassName('hint')[0];
                        oHint.innerHTML = 'Please wait for these satellite animation to finish before selection new ones!'
                    }
                })
                .catch(e=> {
                    console.log('err in fetch satellite position');
                })

        }
    }
    track=(data)=> {
        if (!data[0].hasOwnProperty('positions')) {
            throw new Error('no position data');
            return;
        };
        const {duration : [startTime, endTime]} = this.props.observerData;
        const len = data[0].positions.length;
        const {context2} = this.state.map;
        let now = new Date();
        let i = startTime * 60;
        let timer = setInterval(() => {
            let timePassed = Date.now() - now;
            if (i === startTime * 60) {
                now.setSeconds(now.getSeconds() + i);
            }

            let time = new Date(now.getTime() + 60 * timePassed);
            context2.clearRect(0, 0, width, height);
            context2.font = "bold 1px 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);
            context2.clearRect(0, 0, width, height);

            if (i >= len || i >= endTime * 60) {
                this.setState({isDrawing:false});
                const oHint = document.getElementsByClassName('hint')[0];
                oHint.innerHTML = '';
                clearInterval(timer);
                return;
            }
            data.forEach(sat=> {
                const{info, positions} = sat;
                this.drawSat(info, positions[i]);
                console.log("len->"+len);
                console.log("i->"+i);
            })
            i += 60;
        }, 1000);
    }
    drawSat(sat, pos) {
        const name = (sat.satname).substring(9);
        const{projection, context2} = this.state.map;
        const xy = projection([pos.satlongitude, pos.satlatitude]);
        context2.fillStyle = this.state.color(name);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();
        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(name, xy[0], xy[1] + 14);
    }
    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res=>{
                const{data} = res;
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch( e=> {
                console.log('err in fetch map data', e.message);
            })
    }
    generateMap = land => {
        const projection = geoKavrayskiy7()
            .scale(120)
            .translate([width / 2, height / 2])
            .precision(0.1);
        const graticule = geoGraticule();
        const canvas = d3select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);
        const canvas2 = d3select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);
        let context = canvas.node().getContext("2d");
        let context2 = canvas2.node().getContext("2d");
        let path = geoPath()
            .projection(projection)
            .context(context);
        land.forEach(ele => {
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();
            context.beginPath();
            context.lineWidth=0.5;
            path(graticule.outline());
            context.stroke();
        })
        this.setState({
            map:{
                projection: projection,
                graticule: graticule,
                context: context,
                context2: context2
            }
        })
    }
    render() {
        const {isLoad} = this.state;
        return (
            <div className="map-box">
                {
                    isLoad ? <div className="spinner">
                        <Spin tip = "Loading..." size = "large"/>
                    </div> : null

                } <canvas className="map" ref = {this.refMap}/>
                <canvas className="track" ref = {this.refTrack}/>
                <div className="hint"></div>
            </div>
        );
    }
}

export default WorldMap;