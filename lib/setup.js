// GET request to fetch data, once data is retrieved success callback will
// setup d3

function setup() {
  $.ajax({
    type: 'GET',
    url: 'https://api.myjson.com/bins/1gjv1x',
    success: (returnData) => {
      let data;
      let height;
      let width;
      if (window.innerWidth < 1300) {
        width = 650;
        height = 450;
      } else {
        height = 600;
        width = 1000;
      }
      data = returnData
      let tradeScale = 1;
      let dates = [];

      // Parse data into arrays
      asks = data.bboList.map(obj => {
        return obj.ask
      })
      bids = data.bboList.map(obj => {
        return obj.bid
      })
      times = data.bboList.map(obj => {
        newString = obj.timeStr.split('').filter(char => {
          return (char != ":" && char != ".")
        })
        parsedString = newString.join('')
        let hours = parseInt(parsedString.slice(0,2))
        let hoursInNanoSeconds = hours * 60 * 60 * 1000000000
        let minutes = parseInt(parsedString.slice(2,4))
        let minutesInNanoSeconds = minutes * 60 * 1000000000
        let seconds = parseInt(parsedString.slice(4,6))
        let secondsInNanoSeconds = seconds * 1000000000
        let milliseconds = parseInt(parsedString.slice(6))
        let millisecondsInNanoSeconds = milliseconds * 1000000
        let total = hoursInNanoSeconds + minutesInNanoSeconds + secondsInNanoSeconds + millisecondsInNanoSeconds
        let date = new Date(total / 1000000)
        date.setHours(date.getHours() + 5)
        dates.push(date)
        return total
      })

      // Create margins
      let margins = {
        bottom: 40,
        top: 20,
        left: 80,
        right: 20
      }

      width = width - margins.left - margins.right
      height = height - margins.top - margins.bottom

      maxYRange = d3.max(data.bboList, function(d, i) {
        return d.bid
      })
      minYRange = d3.min(data.bboList, function(d, i) {
        return d.bid
      })

      // Create scales
      let x = d3.scaleLinear()
      .domain([times[0], times[times.length - 1]])
      .range([0, width])

      let y = d3.scaleLinear()
      .domain([minYRange, 240000])
      .range([height, 0])

      let xTimeScale = d3.scaleTime()
      .domain([dates[0], dates[dates.length - 1]])
      .range([0,width])


      //Create Axis
      let xAxis = d3.axisBottom(x)
      let xTimeAxis = d3.axisBottom(xTimeScale)
      let yAxis = d3.axisLeft(y)

      let svg = d3.select("#chart-container")
      .append("svg")
      .classed("chart", true)

      // Define areas
      let asksArea = d3.area()
        .curve(d3.curveStepAfter)
        .x(function(d,i) { return x(times[i])})
        .y0(0)
        .y1(function(d,i) {return y(d)})

      let bidsArea = d3.area()
        .curve(d3.curveStepAfter)
        .x(function(d,i) { return x(times[i])})
        .y0(height)
        .y1(function(d,i) {return y(d)})

      // Add display group to chart
      let chart = svg.append("g")
      .classed("display", true)
      .data(data.bboList)
      .attr("transform", `translate(${margins.left},${margins.top})`)
      .on("mousemove", function(d) {
        let rounded = Math.floor(x.invert(d3.event.pageX)).toString().split('').slice(0,8)
        rounded = rounded.join('') + "000000";
        let index = null;
        times.forEach((val,idx) => {
          if (val > rounded - 8000000000000 && index === null) {
            index = idx
          }
        })
        if (index === null) {
          $("#bids").html("<span class='ask-bid-title'>Bids:</span>" + `<span class='ask-bid-result'>${bids[bids.length - 1]}</span>`)
          $("#asks").html("<span class='ask-bid-title'>Asks:</span>" + `<span class='ask-bid-result'>${asks[asks.length - 1]}</span>`)
        } else {
          $("#bids").html("<span class='ask-bid-title'>Bids:</span>" + `<span class='ask-bid-result'>${bids[index]}</span>`)
          $("#asks").html("<span class='ask-bid-title'>Asks:</span>" + `<span class='ask-bid-result'>${asks[index]}</span>`)
        }
      })

      let innerSpace = d3.select(".display").append("g")
        .classed("innerSpace", true)
        .attr("height", "400px")
        .attr("width", "400px")

      // Add Area to chart
      innerSpace.append("path")
      .classed("area", true)
      .attr("d", asksArea(asks))

      innerSpace.append("path")
      .classed("area2", true)
      .attr("d", bidsArea(bids))

      function Hours(hour) {
        if (hour > 12) {
          return hour - 12
        }
        return hour
      }

      function Minutes(minutes) {
        if (minutes < 10) {
          return `0${minutes}`
        }
        return `${minutes}`
      }

      // Add trade circles
      innerSpace.selectAll(".trades")
      .data(data.tradeList)
      .enter()
      .append("circle")
      .classed("trades", function(d) {
        if (d.tradeType === "E") {
          return d3.select(this).classed("E", true)
        } else if (d.tradeType === "P") {
          return d3.select(this).classed("P", true)
        }
      })
      .attr("fill", function(d) {
        if (d.tradeType === "E") {
          return "red"
        } else if (d.tradeType === "P") {
          return "blue"
        }
      })
      .attr("r", function(d) {
        return d.shares / 50 * $('#scale-slider').val()
      })
      .attr("cx", function(d, i) {
        return x(d.time)
      })
      .attr("cy", function(d,i){
        return y(d.price)
      })
      .attr("data", function(d,i) {
        return d.shares
      })
      .on("mouseover", function(d) {
        $("#time").html("<div class='trade-result-container'><span class='ask-bid-title'>Time:</span>" + " " +  "<span class='trade-results'>" + Hours((new Date(d.time / 1000000).getHours() + 5)) + ":" + Minutes(new Date(d.time / 1000000).getMinutes()) +  "</span></div>")
        $("#price").html("<div class='trade-result-container'><span class='ask-bid-title'>Price:</span>" + " " +  "<span class='trade-results'>" + d.price + "</span></div>")
        $("#shares").html("<div class='trade-result-container'><span class='ask-bid-title'>Shares:</span>" + " " +  "<span class='trade-results'>" + d.shares + "</span></div>")
        $("#trade-type").html("<div class='trade-result-container'><span class='ask-bid-title'>Trade Type:</span>" + " " +  "<span class='trade-results'>" + d.tradeType + "</span></div>")
        $("#reference").html("<div class='trade-result-container'><span class='ask-bid-title'>Reference #:</span>" + " " +  "<span class='trade-results'>" + d.orderReferenceNumber + "</span></div>")
      })

      // Add X axis
      chart.append("g")
      .classed("x axis", true)
      .attr("transform", `translate(0,${height})`)
      .call(xTimeAxis)

      // Add Y Axis
      chart.append("g")
      .classed("y axis", true)
      .attr("transform", `translate(0,0)`)
      .call(yAxis)

      // Add axis labels
      chart.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 32)
      .text("Time");

      svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("x", -200)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Price");
    }
  })
}
