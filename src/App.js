import React, { useRef, useEffect, useState } from "react";
import "./App";
import DonutChart from './components/donutChart'
import ReactDonutChart from './components/ReactDonutChart'
import testData from './chartTestData/ReactDonutChart'
// import ReactDounutChart from './components/ReactDounutChart'
const colors = [ '#8ce8ad', '#57e188', '#34c768', '#2db757', '#27acaa', '#42c9c2', '#60e6e1', '#93f0e6', '#87d3f2', '#4ebeeb', '#35a4e8', '#188ce5', '#542ea5', '#724bc3', '#9c82d4', '#c981b2', '#b14891', '#ff6d00', '#ff810a', '#ff9831', '#ffb46a', '#ff9a91', '#ff736a', '#f95d54', '#ff4136', '#c4c4cd' ];


function App({props}) {
  
  const [data, setData] = useState([24, 30, 45, 70, 26]);
  const donutData = [
    {name: "<5", value: 19},
    {name: "5-9", value: 20},
    {name: "10-14", value: 19},
    {name: "15-19", value: 24},
    {name: "20-24", value: 22},
    {name: "25-29", value: 29},
    {name: "30-34", value: 22},
    {name: "35-39", value: 18},
    {name: "40-44", value: 23},
    {name: "45-49", value: 19},
    {name: "50-54", value: 16},
    {name: "55-59", value: 19},
    {name: "60-64", value: 28},
    {name: "65-69", value: 17},
    {name: "70-74", value: 20},
    {name: "75-79", value: 17},
    {name: "80-84", value: 18},
    {name: "≥85", value: 21}
 ]

  const svgRef = useRef(null);

  useEffect(() => {
  }, [data]);

  return (
    <>
      <div style={{ Width: "10%"}}>
        {/* <DonutChart data={donutData}/> */}
        <ReactDonutChart data={testData}/>
      </div>
      
    </>
  );
}

export default App
