window.onload = function() {
    console.log("hello world")
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    var beadNode = svgNode.getElementById("singleBead")
    beadNode.removeAttribute("id")
    var beadingPattern = new Pattern(svgNode, beadNode)
    var beadArray = beadingPattern.generateBeadGrid(beadNode, 20, 8)
    beadArray[3][3].setAttribute("class", beadingPattern.beadClasses[2])
    setBeadRange(5, undefined, 5, 7, beadArray, beadingPattern.beadClasses[2])
}

function Pattern(svgNode, beadNode) {
    this.svg = svgNode
    this.beadNode = beadNode
    this.beadClasses = ["bead-0", "bead-1", "bead-2"]
    this.setSvgDimensions = function(width, height, unit) {
        this.svg.setAttribute("width", String(width) + unit)
        this.svg.setAttribute("height", String(height) + unit)
        this.svg.setAttribute("viewBox", "0 0 " + String(width) + " " + String(height))
    }
    this.beadClick = function(beadNode, newClass) {
        beadNode.setAttribute("class", newClass)
    }
    this.generateBeadGrid = function(beadNode, rows, columns) {
        var beadWidth = 13
        var beadHeight = 16
        var xPadding = -1
        var yPadding = 0
        var screenUnit = "pt"
        var strokeWidth = 0.6
        var svgWidth = beadWidth*columns + xPadding*(columns - 1)
        var svgHeight = beadHeight*(rows + 0.5) + yPadding*(rows - 1 + 0.5) + strokeWidth
        this.setSvgDimensions(svgWidth, svgHeight, screenUnit)
        var beadArray = []
        for (i = 0; i < rows; i++) {
            var row = []
            for (j = 0; j < columns; j++) {
                var xPos = beadWidth * j + xPadding * j
                // ugly...
                var yPos = strokeWidth/2 + beadHeight*i + yPadding*i + (j%2)/2 * (beadHeight + yPadding/2)
                var newBeadNode = beadNode.cloneNode(true)
                newBeadNode.setAttribute("transform", "translate(" + String(xPos) + " " + String(yPos) + ")")
                newBeadNode.setAttribute("class", this.beadClasses[0])
                var context = this
                newBeadNode.addEventListener(
                    "click",
                    function(event) {
                        return context.beadClick(event.currentTarget, context.beadClasses[1])
                    }
                )
                this.svg.appendChild(newBeadNode)
                row.push(newBeadNode)
            }
            beadArray.push(row)
        }
        return beadArray
    }
}

function setBeadRange(row1, row2, column1, column2, beadArray, setClass) {
    // slice beads of interest into beadRange
    var beadRowRange = beadArray.slice(row1, row2)
    for (j = 0; j < beadRowRange.length; j++) {
        rowSlice = beadRowRange[j].slice(column1, column2)
        for (i = 0; i < rowSlice.length; i++) {
            rowSlice[i].setAttribute("class", setClass)
        }
    }
}
