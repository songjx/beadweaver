window.onload = function() {
    console.log("hello world")
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    setSvgDimensions(svgNode)
}

function setSvgDimensions(svg) {
    // set svg dimensions
    var beadWidth = 13
    var beadHeight = 16
    var columns = 2
    var rows = 2
    var xPadding = 1
    var yPadding = 1
    var screenUnit = "mm"
    var svgWidth = beadWidth * columns + xPadding * (columns - 1)
    var svgHeight = beadHeight * rows + yPadding * (rows - 1)
    svg.setAttribute("width", String(svgWidth) + screenUnit)
    svg.setAttribute("height", String(svgHeight) + screenUnit)
}
