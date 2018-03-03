window.onload = function() {
    [svgNode, beadNode] = getNodes()
    var bead = new Bead(beadNode)
    var peyoteChunk = new Chunk(20, 8)
    var pattern = new Pattern(svgNode)
    setBeadRange(0, undefined, 0, undefined, peyoteChunk.beadArray, pattern.beadStyles[0])
    peyoteChunk.beadArray.forEach(
        function(row, i) {
            row.forEach(function(beadEl, j) {
                beadEl.beadNode.addEventListener(
                    "click",
                    function() {
                        peyoteChunk.beadArray[i][j].setStyle(pattern.activeStyle)
                    })
                beadEl.beadNode.addEventListener(
                    "mouseover",
                    function(event) {
                        if (event.buttons === 1) {
                            peyoteChunk.beadArray[i][j].setStyle(pattern.activeStyle)
                        }
                    })
            })
        })
    pattern.displayPattern(peyoteChunk)
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
    constructor(node) {
        this.beadNode = node.cloneNode(true)
    }
    setStyle(style) {
        this.beadNode.setAttribute("class", style.cssClassName)
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
        this.beadArrayNode = newSvgGroup()
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
        this.palette = this.makePalette()
        //this.displayPattern()
    }
    setSvgDimensions(width, height, unit) {
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")
        this.svg.setAttribute("viewBox", "0 0 " + String(width*2) + " " + String(height))
    }
    paletteClick(context, index) {
        var eventHandler = function() {
            context.activeStyle = context.beadStyles[index]
        }
        return eventHandler
    }
    displayPattern(chunk) {
        this.svg.appendChild(chunk.beadArrayNode)
        this.svg.appendChild(this.palette)
        this.setSvgDimensions(chunk.width, chunk.height, "pt")
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
        var paletteNode = newSvgGroup()
        paletteNode.setAttribute("id", "palette")
        paletteNode.setAttribute("transform", "translate(" + 160 + ")")
        var context = this
        for (var i = 0; i < this.beadStyles.length; i++) {
            var paletteBead = new Bead(beadNode)
            paletteBead.setStyle(this.beadStyles[i])
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
    beadRowRange.forEach(function(row) {
        var rowSlice = row.slice(column1, column2)
        rowSlice.forEach(function(bead) {
            bead.setStyle(style)
        })
    })
}

function newSvgGroup() {
    return document.createElementNS("http://www.w3.org/2000/svg", "g")
}

function beadClick(beadNode, newClass) {
    beadNode.setAttribute("class", newClass)
}
