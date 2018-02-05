window.onload = function() {
    console.log("hello world")
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    var beadNode = document.createElementNS("http://www.w3.org/2000/svg", "use")
    beadNode.setAttribute("xlink:href", "#singleBead")
    generateBeadGrid(svgNode, beadNode, 3, 3)
}

function setSvgDimensions(svg, width, height, unit) {
    // set svg dimensions
    svg.setAttribute("width", String(width) + unit)
    svg.setAttribute("height", String(height) + unit)
    svg.setAttribute("viewBox", "0 0 " + String(width) + " " + String(height))
}

function generateBeadGrid(svg, beadNode, rows, columns) {
    var beadWidth = 13
    var beadHeight = 16
    var xPadding = 1
    var yPadding = 1
    var screenUnit = "mm"
    var svgWidth = beadWidth * columns + xPadding * (columns - 1)
    var svgHeight = beadHeight * rows + yPadding * (rows - 1)
    console.log(svgWidth)
    setSvgDimensions(svg, svgWidth, svgHeight, "mm")
    for (j = 0; j < columns; j++) {
        var xPos = beadWidth * j + xPadding * j
        for (i = 0; i < rows; i++) {
            var yPos = beadHeight * i + yPadding * i
            var newBeadNode = beadNode.cloneNode()
            newBeadNode.setAttribute("x", xPos)
            newBeadNode.setAttribute("y", yPos)
            svg.appendChild(newBeadNode)
            console.log(
                String(j) + ' ' +
                String(i) + ' ' +
                String(xPos) + ' ' +
                String(yPos))
        }
    }
}
