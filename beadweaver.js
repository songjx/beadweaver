const beadDefs = {
    width: 13,
    height: 16,
    strokeWidth: 0.6
}
var beadNode
var svgNode

function loadNodes() {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest()
        request.open("GET", "pattern.svg")
        request.onreadystatechange = function ready() {
            if (request.readyState == 4 && request.status == "200") {
                // callback(request.responseXML)
                resolve(request.responseXML)
            }
        }
        request.send()
    })
}

function loadStyles() {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest()
        request.overrideMimeType("application/json")
        request.open("GET", "styles.json")
        request.onreadystatechange = function ready() {
            if (request.readyState == 4 && request.status == "200") {
                resolve(request.responseText)
            }
        }
        request.send()
    })
}

function init(values) {
    //nodes
    svgNode = values[0].getElementById("svg")
    beadNode = svgNode.getElementById("singleBead")
    beadNode.removeAttribute("id")
    pattern = new Pattern(svgNode)
    //styles
    var styles = JSON.parse(values[1])
    pattern.beadStyles = styles
    pattern.activeStyle = pattern.beadStyles[Math.floor(Math.random()*pattern.beadStyles.length)]
    var beadCss = initStyleCss()
    var peyoteChunk = new Chunk(90, 8, beadNode)
    styles.map((style, i) => addStyleCss(beadCss, style, i))
    // init?
    setBeadRange(0, undefined, 0, undefined, peyoteChunk.beadArray, pattern.beadStyles[Math.floor(Math.random()*pattern.beadStyles.length)])
    pattern.initPattern(peyoteChunk)
    var ribbon = document.getElementById("ribbon")
    var swatch = makeSwatch(pattern.beadStyles)
    var zoom = zoomButtons()
    var paint = paintTools(peyoteChunk)
    var active = showActiveStyle()
    ribbon.appendChild(active.wrapper)
    ribbon.appendChild(swatch.wrapper)
    ribbon.appendChild(zoom.wrapper)
    ribbon.appendChild(paint.wrapper)
    swatchListener(swatch, active)
    peyoteChunk.addRemoveRows(-60, top=false)
    pattern.updatePattern(peyoteChunk)
}

class Bead {
    constructor(node) {
        this.node = node.cloneNode(true)
    }
    setStyle(style) {
        this.style = style
        this.node.setAttribute("class", style.cssClassName)
    }
}

class Chunk {
    constructor(rows, columns, beadNode) {
        this.beadArrayNode = newSvgGroup()
        this.beadArrayNode.setAttribute("class", "bead-array")
        this.beadArray = Array(rows).fill(undefined).map(function(_, i) {
            var row = Array(columns).fill(undefined).map(function(_, j) {
                var bead = new Bead(beadNode)
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
        this.alignBeads()
    }
    alignBeads(xPad=-1, yPad=-0.1, oneDrop=false) {
        this.beadArray.forEach(
            function(row, i) {
                row.forEach(function(bead, j) {
                    let x = beadDefs.width*j + xPad*j
                    let dropFactor = (oneDrop ? ((j+1)%2) : (j%2))
                    let y = beadDefs.height*i + yPad*i + dropFactor/2 * (beadDefs.height + yPad/2)
                    bead.node.setAttribute("transform", "translate(" + x + " " + y + ")")
                })
            })
            this.width = beadDefs.width*this.cols + xPad*(this.cols - 1)
            this.height = beadDefs.height*(this.rows+.5) + yPad*(this.rows-.5)
        }
    get rows() { return this.beadArray.length }
    get cols() { return this.beadArray[0].length }
    addRemoveRows(rows, top=true) {
        if (rows < 0) {
            if (top == true) {
                var removed = this.beadArray.splice(0, -rows)
            } else {
                var removed = this.beadArray.splice(rows, -rows)
            }
            // console.log(removed)
            removed.forEach( function(row) {
                row.forEach( function(bead) {
                    bead.node.remove()
                })
            })
        }
        // } else {
        //     if (top == true) {
        //         this.beadArray.unshift(newRows)
        //     }
        // }
        this.alignBeads()
        // setZoom()
    }
}

class Pattern {
    constructor(svgNode) {
        this.svg = beadweaverSvg(svgNode)
        this.zoomLevel = 0 // initially zoom to fit
    }
    initPattern(chunk) {
        this.svg.appendChild(chunk.beadArrayNode)
        var main = document.getElementById("main")
        this.svgWrapper = document.createElement("div")
        this.svgWrapper.setAttribute("id", "svgWrapper")
        this.svgWrapper.appendChild(this.svg)
        main.appendChild(this.svgWrapper)
        this.updatePattern(chunk)
    }
    updatePattern(chunk) {
        this.width = chunk.width
        this.height = chunk.height // add chunks or other pattern elements (like findings) later?
        setViewBox(this.svg, this.width, this.height)
        setZoom(this.svgWrapper, this.zoomLevel, this.width/this.height) // initially zoom to fit
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
        active.text.nodeValue = pattern.activeStyle.prettyName
    }
}

class Palette {
    constructor(text, id = null) {
        this.wrapper = document.createElement("div")
        this.wrapper.setAttribute("class", "palette-wrapper")
        var name = document.createElement("div")
        name.setAttribute("class", "palette-name")
        this.palette = document.createElement("div")
        this.palette.setAttribute("id", id)
        this.palette.setAttribute("class", "palette")
        name.innerHTML += text
        this.wrapper.appendChild(name)
        this.wrapper.appendChild(this.palette)
    }
}

function makeSwatch(styles) {
    var swatch = new Palette("Swatch", "swatch")
    swatch.innerWrapper = document.createElement("div")
    swatch.innerWrapper.setAttribute("id", "innerWrapper")
    swatch.palette.appendChild(swatch.innerWrapper)
    var buttons = pattern.beadStyles.map(makeButton())
    buttons.forEach(function(button, i) {
        swatch.innerWrapper.appendChild(button.div)
    })
    return swatch
}

function swatchListener(swatch, active) {
    swatch.innerWrapper.childNodes.forEach(function(button, i) {
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

function setZoom(node, level, aspectRatio) {
    //aspectRatio = width/height
    let x = 0.2
    var h = (100-6) * Math.pow((1+x), level)
    var w = h * aspectRatio
    node.setAttribute("style", "width:" + w + "vh; height:" + h + "vh;")
}

function setPatternZoom() { setZoom(pattern.svgWrapper, pattern.zoomLevel, pattern.width/pattern.height) }

function setViewBox(svg, width, height) {
    svg.setAttribute("viewBox", "0 0 " + width + " " + height)
    return svg
}

function addStyleCss(styleSheet, style, i) {
    style.cssClassName = "bead-" + i
    if (style.baseColor) {
        styleSheet.insertRule("." + style.cssClassName + " .beadColor {fill: " + style.baseColor + "}")
        styleSheet.insertRule("." + style.cssClassName + ":hover .beadOutline {stroke: indianRed}")
    } else {
        styleSheet.insertRule("." + style.cssClassName + " .beadColor {fill:none}")
        styleSheet.insertRule("." + style.cssClassName + " .glossHighlight {display:none}")
        styleSheet.insertRule("." + style.cssClassName + " .beadHighlight {display:none}")
        styleSheet.insertRule("." + style.cssClassName + " .beadShadow {display:none}")
        styleSheet.insertRule("." + style.cssClassName + " .beadOutline {stroke: #CCC}")
    }
    if (style.surface == "matte") {
        styleSheet.insertRule("." + style.cssClassName + " .glossHighlight {display:none}")
    }
    else if (style.surface == "gloss") {
        styleSheet.insertRule("." + style.cssClassName + " .beadHighlight {display:none}")
    }
}

function initStyleCss() {
    // initialize empty css for bead styles
    var node = document.createElement("style")
    node.setAttribute("id", "beadCss")
    document.head.appendChild(node)
    return node.sheet
}

function zoomButtons() {
    var zoom = new Palette("Zoom", "zoom-palette")
    var text = ["-", "fit", "+"]
    var zoomBtns = text.map(function zoomBtns(text) {
        var btn = textButton(text)
        zoom.palette.appendChild(btn)
        return btn
    })
    zoomBtns[0].addEventListener("click", function minusClick() {
        pattern.zoomLevel--
        setPatternZoom()
    })
    zoomBtns[1].addEventListener("click", function fitClick() {
        pattern.zoomLevel = 0
        setPatternZoom()
    })
    zoomBtns[2].addEventListener("click", function plusClick() {
        pattern.zoomLevel++
        setPatternZoom()
    })
    return zoom
}

function textButton(text) {
    var btn = document.createElement("div")
    btn.setAttribute("class", "text-button")
    var btnText = document.createTextNode(text)
    btn.appendChild(btnText)
    return btn
}

function paintTools(chunk) {
    var paint = new Palette("Paint", "paint-palette")
    var btn = textButton("fill")
    paint.palette.appendChild(btn)
    btn.addEventListener("click", function fillClick() {
        setBeadRange(0, undefined, 0, undefined, chunk.beadArray, pattern.activeStyle)
    })
    return paint
}

// function detectOS() {
//     var OSName="Unknown OS";
//     if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
//     if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
//     if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
//     if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
//
//     document.getElementById("ribbon").innerHTML += 'Your OS: '+ OSName
// }

window.onload = function() {
    // detectOS();
    Promise.all([loadNodes(), loadStyles()]).then(values => init(values))
}
