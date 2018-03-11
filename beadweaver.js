var pattern

window.onload = function() {
    [svgNode, beadNode] = getNodes()
    var peyoteChunk = new Chunk(20, 8)
    pattern = new Pattern(svgNode)
    setBeadRange(0, undefined, 0, undefined, peyoteChunk.beadArray, pattern.beadStyles[0])
    pattern.displayPattern(peyoteChunk)
    var ribbon = document.getElementById("ribbon")
    var swatch = makeSwatch(pattern.beadStyles)
    var active = showActiveStyle()
    ribbon.appendChild(active.wrapper)
    ribbon.appendChild(swatch.wrapper)
    swatchListener(swatch, active)
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
        this.node = node.cloneNode(true)
    }
    setStyle(style) {
        this.node.setAttribute("class", style.cssClassName)
    }
}

class Style {
    constructor(index) {
        this.cssClassName = "bead-" + index
        this.prettyName = "Matte opaque cornflowerBlue"
        // this.texture = "matte" // gloss, satin, flat
    }
}

class Chunk {
    constructor(rows, columns) {
        this.xPadding = -1
        this.yPadding = -.3
        this.width = this.xCoord(columns) - this.xPadding
        this.height = beadDefs.strokeWidth + beadDefs.height*rows + this.yPadding*rows + (beadDefs.height + this.yPadding/2)/2
        this.beadArrayNode = newSvgGroup()
        this.beadArrayNode.setAttribute("class", "bead-array")
        this.beadArray = Array(rows).fill(undefined).map(function(_, i) {
            var row = Array(columns).fill(undefined).map(function(_, j) {
                var bead = new Bead(beadNode)
                bead.node.setAttribute("transform", "translate(" + this.xCoord(j) + " " + this.yCoord(i, j) + ")")
                this.beadArrayNode.appendChild(bead.node)
                return bead
            }, this)
            return row
        }, this)
        this.beadArray.forEach(
            function(row, i) {
                row.forEach(function(beadEl, j) {
                    beadEl.node.addEventListener(
                        "mousedown",
                        beadDraw(this.beadArray[i][j]))
                    beadEl.node.addEventListener(
                        "mouseover",
                        beadDraw(this.beadArray[i][j]))
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
        setViewBox(this.svg, chunk.width, chunk.height)
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

function beadDraw(bead) {
    return function(event) {
        if (event.buttons === 1) {
            bead.setStyle(pattern.activeStyle)
        }
    }
}

function paletteClick(pattern, style, active) {
    return function() {
        pattern.activeStyle = style
        active.bead.bead.setStyle(style)
        active.text = pattern.activeStyle.prettyName
    }
}

class Palette {
    constructor(text) {
        this.wrapper = document.createElement("div")
        this.wrapper.setAttribute("class", "palette-wrapper")
        var name = document.createElement("div")
        this.palette = document.createElement("div")
        this.palette.setAttribute("class", "palette")
        name.innerHTML += text
        this.wrapper.appendChild(name)
        this.wrapper.appendChild(this.palette)
    }
}

function makeSwatch(styles) {
    var swatch = new Palette("Swatch")
    var buttons = pattern.beadStyles.map(makeButton())
    buttons.forEach(function(button, i) {
        swatch.palette.appendChild(button.div)
    })
    return swatch
}

function swatchListener(swatch, active) {
    swatch.palette.childNodes.forEach(function(button, i) {
        console.log(active)
        button.addEventListener(
            "click",
            paletteClick(pattern, pattern.beadStyles[i], active)
        )
    })
}

function showActiveStyle() {
    var active = new Palette("Active Bead")
    active.bead = new OneBead()
    active.bead.div.setAttribute("id", "active-bead")
    active.bead.bead.setStyle(pattern.activeStyle)
    var description = document.createElement("div")
    description.setAttribute("id", "bead-description")
    active.text = document.createTextNode(pattern.activeStyle.prettyName)
    description.appendChild(active.text)
    active.palette.appendChild(active.bead.div)
    active.palette.appendChild(description)
    return active
}

class OneBead {
    // a div with an svg with one bead
    constructor() {
        this.div = document.createElement("div")
        var svg = setViewBox(beadweaverSvg(svgNode), beadDefs.width, beadDefs.height)
        this.bead = new Bead(beadNode)
        svg.appendChild(this.bead.node)
        this.div.appendChild(svg)
    }
}

function makeButton() {
    return function makeButtonCallback(style) {
        var button = new OneBead()
        button.bead.setStyle(style)
        button.div.setAttribute("class", "button")
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
