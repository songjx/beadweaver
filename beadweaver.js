window.onload = function() {
    [svgNode, beadNode] = getNodes()
    var bead = new Bead(beadNode)
    var pattern = new Pattern(svgNode)
    setBeadRange(0, undefined, 0, undefined, pattern.chunk.beadArray, pattern.beadStyles[0].cssClassName)
}

const beadDefs = {
    width: 13,
    height: 16,
    strokeWidth: 0.6
}

function getNodes() {
    var embedSvg = document.getElementById("patternSvg").contentDocument
    var svgNode = embedSvg.getElementById("svg")
    var beadNode = svgNode.getElementById("singleBead")
    beadNode.removeAttribute("id")
    return [svgNode, beadNode]
}

class Bead {
    constructor(beadNode) {
        this.beadNode = beadNode.cloneNode(true)
    }
    setStyle(style) {
        this.beadNode.setAttribute("class", style)
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
    constructor(rows, columns) {
        this.xPadding = -1
        this.yPadding = 0
        this.rows = rows
        this.columns = columns
        this.bead = bead
        this.width = this.xCoord(columns) - this.xPadding
        this.height = beadDefs.strokeWidth + beadDefs.height*rows + this.yPadding*rows + (beadDefs.height + this.yPadding/2)/2
        this.beadArray = []
        this.beadArrayNode = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.beadArrayNode.setAttribute("class", "bead-array")
        for (var i = 0; i < rows; i++) {
            var row = []
            for (var j = 0; j < columns; j++) {
                var bead = new Bead(beadNode)
                bead.beadNode.setAttribute("transform", "translate(" + String(this.xCoord(j)) + " " + String(this.yCoord(i, j)) + ")")
                this.beadArrayNode.appendChild(bead.beadNode)
                row.push(bead)
            }
            this.beadArray.push(row)
        }
    }
    xCoord(col) {return beadDefs.width*col + this.xPadding*col}
    yCoord(row, col) {return beadDefs.strokeWidth/2 + beadDefs.height*row + this.yPadding*row + (col%2)/2 * (beadDefs.height + this.yPadding/2)}
}

class Pattern {
    constructor(svgNode) {
        this.svg = svgNode
        this.beadStyles = this.defaultStyles()
        this.activeStyle = this.beadStyles[1]
        this.chunk = new Chunk(20, 8)
        this.palette = this.makePalette()
        var context = this
        this.chunk.beadArray.forEach(function(row) {
            row.forEach(function(beadEl) {
                beadEl.beadNode.addEventListener(
                    "click",
                    function(event) {
                        context.beadClick(event.currentTarget, context.activeStyle.cssClassName)
                    }
                )
                beadEl.beadNode.addEventListener(
                    "mouseover",
                    function(event) {
                        if (event.buttons === 1) {
                            context.beadClick(event.currentTarget, context.activeStyle.cssClassName)
                        }
                    }
                )
            })
        })
        this.displayPattern()
    }
    setSvgDimensions(width, height, unit) {
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")
        this.svg.setAttribute("viewBox", "0 0 " + String(width*2) + " " + String(height))
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
    makePalette() {
        var paletteNode = document.createElementNS("http://www.w3.org/2000/svg", "g")
        paletteNode.setAttribute("id", "palette")
        paletteNode.setAttribute("transform", "translate(" + String(this.chunk.width * 1.5) + ")")
        var context = this
        for (var i = 0; i < this.beadStyles.length; i++) {
            var paletteBead = new Bead(beadNode)
            paletteBead.setStyle(this.beadStyles[i].cssClassName)
            paletteBead.beadNode.setAttribute("transform", "translate(" + String(i*beadDefs.width*1.2) + " 3)")
            paletteBead.beadNode.addEventListener(
                "click",
                context.paletteClick(context, i)
            )
            paletteNode.appendChild(paletteBead.beadNode)
        }
        return paletteNode
    }
}

function setBeadRange(row1, row2, column1, column2, beadArray, style) {
    // slice beads of interest into beadRange
    var beadRowRange = beadArray.slice(row1, row2)
    for (var j = 0; j < beadRowRange.length; j++) {
        rowSlice = beadRowRange[j].slice(column1, column2)
        for (var i = 0; i < rowSlice.length; i++) {
            rowSlice[i].setStyle(style)
        }
    }
}
