import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const colors = [ '#8ce8ad', '#57e188', '#34c768', '#2db757', '#27acaa', '#42c9c2', '#60e6e1', '#93f0e6', '#87d3f2', '#4ebeeb', '#35a4e8', '#188ce5', '#542ea5', '#724bc3', '#9c82d4', '#c981b2', '#b14891', '#ff6d00', '#ff810a', '#ff9831', '#ffb46a', '#ff9a91', '#ff736a', '#f95d54', '#ff4136', '#c4c4cd' ];

function DonutChart(props) {
  const [data, setData] = useState([24, 30, 45, 70, 26]);
  const svgRef = useRef(null);

  useEffect(() => {
    console.log(props)
    const { data } = props;
    const svgContainer = d3.select(svgRef.current).node();
    const width  = svgContainer.getBoundingClientRect().width;
    const height = width;
    const margin = 15;
    let radius = Math.min(width, height) / 2  - margin;// 반지름

    let legendPosition = d3.arc().innerRadius(radius/1.41).outerRadius(radius);

    // Create SVG
    const svg  = d3.select(svgRef.current)
    .create('svg')
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox', '0 0 ' + width + ' ' + width )
    //.attr('preserveAspectRatio','xMinYMin')
    .append("g")
    .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");
    let pie = d3.pie()
        .value( d => d.value )
    let data_ready = pie(data)
    const arc = d3.arc()
      .innerRadius(radius/ 1.41)  // This is the size of the donut hole
      .outerRadius(radius)
    console.log(data_ready)
    // Donut partition  
    svg
    .selectAll('whatever') // 읽기
    .data(data_ready) // 데이터 읽기
    .enter() // 적용
    .append('path') //내부에 path로 붙인다
    .attr('d', (d) => {
      return arc(d)
    })
    .attr('fill',  (d) => {
      return colors[d.index] 
    })
    .transition().duration(750)
    .attr("stroke", "#fff")
    .style("stroke-width", "2")
    .style("opacity", "0.8")
 
       // Legend group and legend name 
    svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('g')
    .attr("transform", d => `translate(${legendPosition.centroid(d)})`)
    .attr("class", 'legend-g')
    .style("user-select", "none")
    .append('text')
    .text(d => d.data.name)
    .style("text-anchor", "middle")
    .style("font-weight", 700)
    .style("fill", '#222')
    .style("font-size", 14);

    //Label for value
    svg
    .selectAll('.legend-g')
    .append('text')
    .text((d) => { return d.data.value })
    .style("fill", '#444')
    .style("font-size", 12)
    .style("text-anchor", "middle")
    .attr("y", 16);

  }, [data]);

  return (
    <>
      <div ref={svgRef}></div>
    </>
  );
}

export default DonutChart