import React, {useRef, useState, useEffect} from 'react'
import {Canvas} from 'react-three-fiber';

import {OrbitControls } from "@react-three/drei";
import './App.css';
import Map from './component/Map'
import {getMapData} from './service/MapService'
function App() {
  const infoRef = useRef()
  const [data, setData] = useState()
  const [step, setStep] = useState(0)
  const stepRef = useRef(step)

  useEffect(() => {
    setData(getMapData())

    setInterval(() => {
      let newStep = stepRef.current +1
      if(newStep>23){
        newStep = 0
      }
      stepRef.current = newStep
      setStep(newStep)
    }, 2000)
  }, [])

  return (
    <>
      <Canvas>
        <OrbitControls />
        {/*<Stars/>*/}
        <ambientLight intensity={0.5} />
        <spotLight position={[10,15,10]} angle={0.3} />
        <Map infoRef={infoRef} data={data} step={step}/>
      </Canvas>
      <div id="provinceInfo" ref={infoRef} />
    </>
  );
}

export default React.memo(App);
