window.onload = function() {
    console.log("hello world")
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    var beadNode = document.createElementNS("http://www.w3.org/2000/svg", "use")
    beadNode.setAttribute("href", "#singleBead")
    generateBeadGrid(svgNode, beadNode, 20, 8)
}

function setSvgDimensions(svg, width, height, unit) {
    svg.setAttribute("width", String(width) + unit)
    svg.setAttribute("height", String(height) + unit)
    svg.setAttribute("viewBox", "0 0 " + String(width) + " " + String(height))
}

function generateBeadGrid(svg, beadNode, rows, columns) {
    var beadWidth = 13
    var beadHeight = 16
    var xPadding = -1
    var yPadding = 0
    var screenUnit = "pt"
    var strokeWidth = 0.6
    var svgWidth = beadWidth*columns + xPadding*(columns - 1)
    var svgHeight = beadHeight*(rows + 0.5) + yPadding*(rows - 1 + 0.5) + strokeWidth
    setSvgDimensions(svg, svgWidth, svgHeight, screenUnit)
    for (j = 0; j < columns; j++) {
        var xPos = beadWidth * j + xPadding * j
        for (i = 0; i < rows; i++) {
            // ugly...
            var yPos = strokeWidth/2 + beadHeight*i + yPadding*i + (j%2)/2 * (beadHeight + yPadding/2)
            var newBeadNode = beadNode.cloneNode()
            newBeadNode.setAttribute("x", xPos)
            newBeadNode.setAttribute("y", yPos)
            if (i%2) {
                newBeadNode.setAttribute("class", "bead-1")
            }
            else {
                newBeadNode.setAttribute("class", "bead-2")
            }
            svg.appendChild(newBeadNode)
        }
    }
}
