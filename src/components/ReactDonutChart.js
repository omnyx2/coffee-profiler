import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const partition = (data) => {
  // hierearchy를 위해서는 무조건 name, child 프로퍼티를 가지는 nested data이어여ㅑ
  const root = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);
  const temp = root.copy();

  const a = d3.partition().size([2 * Math.PI, root.height + 1])(root);
  return a;
};

function ReactDonutChart(props) {
  const [data, setData] = useState(props.data);
  const [selected, setSelected] = useState([]);
  const [selectedNodeTree, setSelectedNodeTree] = useState({});
  const svgRef = useRef(null);

  const width = 932;
  const radius = width / 8;
  const format = d3.format(",d");

  const controlState = (data) => {
    let pre_data = { ...data };
    let current_depth = pre_data.depth;

    const node_tracker = [[pre_data.data.name, pre_data.depth]];

    while (pre_data.parent != null) {
      node_tracker.push([pre_data.parent.data.name, pre_data.parent.depth]);
      pre_data = pre_data.parent;
    }
    // 유저 행동에따라 어떻게 동작할지 시나리오 그려서 작성해야한다.
    if (selectedNodeTree) setSelectedNodeTree({});
    console.log(node_tracker);
  };

  useEffect(() => {
    const { data } = props;

    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );
    // const color1 = d3.scaleLinear()
    // .domain([0, d3.max(data)])
    // .range(["white", "red"])

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => {
        if (d.depth === 1) {
          return (d.y0 * radius) / 1.5;
        } else if (d.depth === 2) {
          return (d.y0 * radius) / 1.5;
        } else {
          return d.y0 * radius;
        }
      })
      .outerRadius((d) => {
        //console.log(d)
        if (d.depth === 1) {
          return Math.max(d.y0 * radius, d.y1 * radius - 1) / 1.5;
        } else {
          return Math.max(d.y0 * radius, d.y1 * radius - 1);
        }
      });
    const root = partition(data);
    root.each((d) => (d.current = d));
    // console.log(root)

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("viewBox", "0 0 " + width + " " + width)
      .style("font", "12px sans-serif");

    const label1 = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "#888")
      .style("visibility", "hidden");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${width / 2})`);

    const path = g
      .append("g")
      .selectAll("path")
      .data(root.descendants())
      .join("path")
      .attr("fill", (d) => {
        while (d.depth > 1) {
          d = d.parent;
        }
        return color(d.data.name);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("d", (d) => arc(d.current));
    //      .on("click", clicked);
    // 최종 노드 추척할려면 이거 해야함
    path
      .filter((d) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    path.append("title").text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}`
    );
    // console.log(root.descendants())
    const label = g
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", (d) => +labelVisible(d.current))
      .attr("transform", (d) => labelTransform(d.current))
      .text((d) => d.data.name);

    // circle에 click event 등록
    const parent = g
      .append("circle")
      .datum(root)
      .attr("r", radius / 2)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    // d3는 자체적으로 클릭 이벤트를 처리
    function clicked(event, p) {
      setSelected({ ...selected, p });
      controlState(p);
      const tag = svg
        .append("div")
        .data(selected)
        .text((d) => {
          console.log(d);
          return d.data.name;
        });

      parent.datum(p.parent || root);
      console.log("p =", p);
      // processing data when onClick event occur
      root.each((d) => {
        d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
          depth: d.depth,
          p_depth: p.depth,
        };
        return d.target;
      });

      const t = g.transition().duration(400);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path
        .transition(t)
        .tween("data", (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (t) => (d.current = i(t));
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", (d) =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attrTween("d", (d) => () => arc(d.current));

      label
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        })
        .transition(t)
        .attr("fill-opacity", (d) => +labelVisible(d.target))
        .attrTween("transform", (d) => () => labelTransform(d.current));

      const percentage = ((100 * p.value) / root.value).toPrecision(3);
    }
    function arcVisible(d) {
      return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      if (d.depth === 1) {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = (((d.y0 + d.y1) / 2) * radius) / 1.5;
        return `rotate(${x - 90}) translate(${y},0) rotate(${
          x < 180 ? 0 : 180
        })`;
      } else {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = ((d.y0 + d.y1) / 2) * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${
          x < 180 ? 0 : 180
        })`;
      }
    }
  }, [data]);

  return (
    <>
      <div ref={svgRef}></div>
    </>
  );
}

export default ReactDonutChart;
