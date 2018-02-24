window.onload = function() {
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    var beadNode = svgNode.getElementById("singleBead")
    beadNode.removeAttribute("id")
    var bead = new Bead(beadNode)
    var beadingPattern = new Pattern(svgNode, bead)
    setBeadRange(0, undefined, 0, undefined, beadingPattern.beadArray.beadArray, beadingPattern.beadStyles[0].cssClassName)
    beadingPattern.beadArray.beadArray[3][3].setAttribute("class", beadingPattern.beadStyles[2].cssClassName)
    setBeadRange(5, undefined, 5, 7, beadingPattern.beadArray.beadArray, beadingPattern.beadStyles[2].cssClassName)
}

class Bead {
    constructor(beadNode) {
        this.beadNode = beadNode
        this.width = 13
        this.height = 16
        this.strokeWidth = 0.6
    }
}

class Style {
    constructor(index) {
        this.cssClassName = "bead-" + String(index)
        // this.color = "cornflowerBlue"
        // this.texture = "matte" // gloss, satin, flat
    }
}

class BeadArray {
    constructor(bead, rows, columns) {
        this.xPadding = -1
        this.yPadding = 0
        this.rows = rows
        this.columns = columns
        this.bead = bead
        this.width = this.xCoord(columns) - this.xPadding
        this.height = bead.strokeWidth + bead.height*rows + this.yPadding*rows + (bead.height + this.yPadding/2)/2
        this.beadArray = []
        this.beadArrayNode = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.beadArrayNode.setAttribute("class", "bead-array")
        for (var i = 0; i < rows; i++) {
            var row = []
            for (var j = 0; j < columns; j++) {
                var newBeadNode = this.bead.beadNode.cloneNode(true)
                newBeadNode.setAttribute("transform", "translate(" + String(this.xCoord(j)) + " " + String(this.yCoord(i, j)) + ")")
                this.beadArrayNode.appendChild(newBeadNode)
                row.push(newBeadNode)
            }
            this.beadArray.push(row)
        }
    }
    xCoord(col) {return this.bead.width*col + this.xPadding*col}
    yCoord(row, col) {return this.bead.strokeWidth/2 + this.bead.height*row + this.yPadding*row + (col%2)/2 * (this.bead.height + this.yPadding/2)}
}

class Pattern {
    constructor(svgNode, bead) {
        this.svg = svgNode
        this.beadStyles = [new Style(0), new Style(1), new Style(2)]
        this.beadArray = new BeadArray(bead, 20, 8)
        var context = this
        this.beadArray.beadArray.forEach(function(row) {
            row.forEach(function(beadEl) {
                beadEl.addEventListener(
                    "click",
                    function(event) {
                        return context.beadClick(event.currentTarget, context.beadStyles[1].cssClassName)
                    }
                )
            })
        })
        this.generateBeadGrid(this.beadArray)
    }
    setSvgDimensions(width, height, unit) {
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")
        this.svg.setAttribute("viewBox", "0 0 " + String(width*5) + " " + String(height))
    }
    beadClick(beadNode, newClass) {
        beadNode.setAttribute("class", newClass)
    }
    generateBeadGrid(beadArray) {
        this.svg.appendChild(beadArray.beadArrayNode)
        this.setSvgDimensions(beadArray.width, beadArray.height, "pt")
    }
}

function setBeadRange(row1, row2, column1, column2, beadArray, setClass) {
    // slice beads of interest into beadRange
    var beadRowRange = beadArray.slice(row1, row2)
    for (var j = 0; j < beadRowRange.length; j++) {
        rowSlice = beadRowRange[j].slice(column1, column2)
        for (var i = 0; i < rowSlice.length; i++) {
            rowSlice[i].setAttribute("class", setClass)
        }
    }
}
