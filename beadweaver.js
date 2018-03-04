var pattern

window.onload = function() {
    [svgNode, beadNode] = getNodes()
    var bead = new Bead(beadNode)
    var peyoteChunk = new Chunk(20, 8)
    pattern = new Pattern(svgNode)
    setBeadRange(0, undefined, 0, undefined, peyoteChunk.beadArray, pattern.beadStyles[0])
    pattern.displayPattern(peyoteChunk)
    var ribbon = document.getElementById("ribbon")
    palette = makePalette(pattern.beadStyles)
    ribbon.appendChild(palette)
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
    document.getElementById("patternSvg").remove()
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
        this.width = this.xCoord(columns) - this.xPadding
        this.height = beadDefs.strokeWidth + beadDefs.height*rows + this.yPadding*rows + (beadDefs.height + this.yPadding/2)/2
        this.beadArrayNode = newSvgGroup()
        this.beadArrayNode.setAttribute("class", "bead-array")
        this.beadArray = Array(rows).fill(undefined).map(function(_, i) {
            var row = Array(columns).fill(undefined).map(function(_, j) {
                var bead = new Bead(beadNode)
                bead.beadNode.setAttribute("transform", "translate(" + this.xCoord(j) + " " + this.yCoord(i, j) + ")")
                this.beadArrayNode.appendChild(bead.beadNode)
                return bead
            }, this)
            return row
        }, this)
        this.beadArray.forEach(
            function(row, i) {
                row.forEach(function(beadEl, j) {
                    beadEl.beadNode.addEventListener(
                        "mousedown",
                        beadClick(this.beadArray[i][j]))
                    beadEl.beadNode.addEventListener(
                        "mouseover",
                        beadMouseover(this.beadArray[i][j]))
                }, this)
            }, this)
    }
    xCoord(col) {return beadDefs.width*col + this.xPadding*col}
    yCoord(row, col) {return beadDefs.strokeWidth/2 + beadDefs.height*row + this.yPadding*row + (col%2)/2 * (beadDefs.height + this.yPadding/2)}

}

class Pattern {
    constructor(svgNode) {
        this.svg = beadweaverSvg(svgNode)
        this.beadStyles = this.defaultStyles()
        this.activeStyle = this.beadStyles[1]
    }
    displayPattern(chunk) {
        this.svg.appendChild(chunk.beadArrayNode)
        setViewBox(this.svg, chunk.width*2, chunk.height)
        var main = document.getElementById("main")
        main.appendChild(this.svg)
    }
    defaultStyles() {
        var styles = []
        for (var i = 0; i < 3; i++) {
            var style = new Style(i)
            styles.push(style)
        }
        return styles
    }
}

function setBeadRange(row1, row2, column1, column2, beadArray, style) {
    // set style on a range of beads in an array
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

function beadClick(bead) {
    return function() {
        bead.setStyle(pattern.activeStyle)
    }
}

function beadMouseover(bead) {
    return function(event) {
        if (event.buttons === 1) {
            bead.setStyle(pattern.activeStyle)
        }
    }
}

function paletteClick(pattern, style) {
    return function() {
        pattern.activeStyle = style
    }
}

function makePalette(styles) {
    var palette = document.createElement("div")
    palette.setAttribute("id", "palette")
    var buttons = pattern.beadStyles.map(makeButton())
    buttons.forEach(function(button) {palette.appendChild(button)})
    return palette
}

function makeButton() {
    return function makeButtonCallback(style) {
        var button = document.createElement("div")
        button.setAttribute("class", "button")
        var buttonNode = setViewBox(beadweaverSvg(svgNode), beadDefs.width, beadDefs.height)
        var bead = new Bead(beadNode)
        bead.setStyle(style)
        buttonNode.appendChild(bead.beadNode)
        button.addEventListener(
            "click",
            paletteClick(pattern, style)
        )
        button.appendChild(buttonNode)
        return button
    }
}

function beadweaverSvg(node) {
    var clone = node.cloneNode(true)
    clone.setAttribute("width", "100%")
    clone.setAttribute("height", "100%")
    return clone
}

function setViewBox(svg, width, height) {
    svg.setAttribute("viewBox", "0 0 " + width + " " + height)
    return svg
}
