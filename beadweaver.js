window.onload = function() {
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    var beadNode = svgNode.getElementById("singleBead")
    beadNode.removeAttribute("id")
    var bead = new Bead(beadNode)
    var pattern = new Pattern(svgNode, bead)
    setBeadRange(0, undefined, 0, undefined, pattern.chunk.beadArray, pattern.beadStyles[0].cssClassName)
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

class Chunk {
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
        //this.beadStyles = [new Style(0), new Style(1), new Style(2)]
        this.beadStyles = this.defaultStyles(bead)
        this.activeStyle = this.beadStyles[1]
        this.chunk = new Chunk(bead, 20, 8)
        this.palette = this.makePalette(bead)
        var context = this
        this.chunk.beadArray.forEach(function(row) {
            row.forEach(function(beadEl) {
                beadEl.addEventListener(
                    "click",
                    function(event) {
                        context.beadClick(event.currentTarget, context.activeStyle.cssClassName)
                    }
                )
            })
        })
        this.displayPattern()
    }
    setSvgDimensions(width, height, unit) {
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")
        this.svg.setAttribute("viewBox", "0 0 " + String(width*5) + " " + String(height))
    }
    beadClick(beadNode, newClass) {
        beadNode.setAttribute("class", newClass)
    }
    paletteClick(context, index) {
        var eventHandler = function() {
            context.activeStyle = context.beadStyles[index]
        }
        return eventHandler
    }
    displayPattern() {
        this.svg.appendChild(this.chunk.beadArrayNode)
        this.svg.appendChild(this.palette)
        this.setSvgDimensions(this.chunk.width, this.chunk.height, "pt")
    }
    defaultStyles() {
        var styles = []
        for (var i = 0; i < 3; i++) {
            var style = new Style(i)
            styles.push(style)
        }
        return styles
    }
    makePalette(bead) {
        var paletteNode = document.createElementNS("http://www.w3.org/2000/svg", "g")
        paletteNode.setAttribute("id", "palette")
        paletteNode.setAttribute("transform", "translate(" + String(this.chunk.width * 1.5) + ")")
        var context = this
        for (var i = 0; i < this.beadStyles.length; i++) {
            var paletteBeadNode = bead.beadNode.cloneNode(true)
            paletteBeadNode.setAttribute("class", this.beadStyles[i].cssClassName)
            paletteBeadNode.setAttribute("transform", "translate(" + String(i*bead.width*1.2) + " 0)")
            paletteBeadNode.addEventListener(
                "click",
                context.paletteClick(context, i)
            )
            paletteNode.appendChild(paletteBeadNode)
        }
        return paletteNode
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
