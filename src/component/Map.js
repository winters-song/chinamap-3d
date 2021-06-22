import React, {useRef,useState} from 'react'
import * as d3 from 'd3';
import * as THREE from 'three';
import {Extrude, Line } from "@react-three/drei";
import { useSpring, animated } from '@react-spring/three'
import {areaNodeMap} from '../service/MapService'
const mapJSON = require('../assets/china.json')

function Province(props){
  const {projection, geoData, color, infoRef} = props
  const [active, setActive] = useState(false)
  const meshRef = useRef()

  // const newColor = color
  // const pos = [0,0,0]


  const { newColor, pos } = useSpring({
    // newColor: active ? '#fa0' : color,
    newColor: color,
    pos: active ? [0,0,0.1] : [0,0,0]
  })



  const extrudeSettings = {
    steps: 1,
    depth: 0.1,
    bevelEnabled: false
  }

  const setInfoVisible = (val) => {
    if(infoRef && infoRef.current){
      infoRef.current.style.visibility = val ?'visible':'hidden'
    }
  }

  const leave = (e) => {
    setActive(false)

    if(!e.intersections.length){
      setInfoVisible(0)
    }
  }

  const move = (e) => {
    if(e.intersections.length && e.intersections[0].object.parent === meshRef.current.parent){
      setInfoVisible(1)
      setActive(true)

      infoRef.current.innerHTML = geoData.properties.name
      infoRef.current.style.left = e.clientX + 2 + 'px'; // 动态设置提示框的位置
      infoRef.current.style.top = e.clientY + 2 + 'px';
    }

  }

  return <animated.group  position={pos} >
    {
      geoData.geometry.coordinates.map(multiPolygon => {

        return multiPolygon.map(polygon => {

          const shape = new THREE.Shape();
          let linePoints = []

          for (let i = 0; i < polygon.length; i++) {
            const [x, y] = projection(polygon[i]);
            if (i === 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
            linePoints.push([x, -y, 0.11])
          }

          return <>
            <Extrude ref={meshRef} args={[shape, extrudeSettings]} onPointerLeave={leave} onPointerMove={move} >
              <animated.meshBasicMaterial color={newColor} transparent={true} opacity={1} />
            </Extrude>
            <Line points={linePoints} lineWidth={0.5} color="#6cf" />
          </>
        })
      })
    }
  </animated.group>
}
function Map (props) {
  // data: 省份数据
  // step: 展示第N小时数据
  const {infoRef, data, step} = props

  // console.log(step)
  // 墨卡托投影转换
  const projection = d3.geoMercator().center([104.0, 37.5]).scale(8).translate([0, 0]);


  const getHourDataMinMax = (data, step) => {
    let min = Infinity
    let max = 0
    for(let i in data){
      const value = data[i].data[step]
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
    return {min, max}
  }

  let colorFunc
  if(data){
    const {min, max} = getHourDataMinMax(data, step)

    colorFunc = d3.scaleSequential([min, max], d3.interpolateBlues)
  }

  const getValue = (geoData, data, step) => {
    let areaId = geoData.properties.adcode
    let nodeId = areaNodeMap[areaId]

    if(nodeId && data[nodeId]){
      return data[nodeId].data[step]
    }

    return 0
  }

  return <group>
    {
      mapJSON.features.map((geoData, index) => {
        const value = getValue(geoData, data, step)
        const color = colorFunc?colorFunc(value): 'white'
        return <Province geoData={geoData} projection={projection} infoRef={infoRef} key={index}  color={color}/>
      })
    }
  </group>
}


export default React.memo(Map)
