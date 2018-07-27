const beadDefs = {
    width: 13,
    height: 16,
    strokeWidth: 0.6
}

function loadNodes() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open("GET", "pattern.svg")
        request.onreadystatechange = function ready() {
            if (request.readyState == 4 && request.status == "200") {
                resolve(request.responseXML)
            }
        }
        request.send()
    })
}

function loadStyles() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
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
    beadNode = svgNode.getElementById("singleBead").cloneNode(true)
    beadNode.removeAttribute("id")
    pattern = new Pattern(svgNode)
    //styles
    const styles = JSON.parse(values[1])
    pattern.activeStyle = styles[Math.floor(Math.random()*styles.length)]
    const beadCss = initStyleCss()
    styles.map((style, i) => addStyleCss(beadCss, style, i))
    // init?
    const peyoteChunk = new Chunk(90, 8, beadNode)
    setBeadRange(0, undefined, 0, undefined, peyoteChunk.beadArray, styles[Math.floor(Math.random()*styles.length)])
    pattern.initPattern(peyoteChunk)
    const ribbon = document.getElementById("ribbon")
    const swatch = makeSwatch(styles)
    const zoom = zoomButtons()
    const paint = paintTools(peyoteChunk)
    const active = showActiveStyle(svgNode)
    ribbon.appendChild(active.wrapper)
    ribbon.appendChild(swatch.wrapper)
    ribbon.appendChild(zoom.wrapper)
    ribbon.appendChild(paint.wrapper)
    swatchListener(swatch, active, styles)
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
            const row = Array(columns).fill(undefined).map(function(_, j) {
                const bead = new Bead(beadNode)
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
            const removed = top ? this.beadArray.splice(0, -rows)
                : this.beadArray.splice(rows, -rows)
            removed.forEach(row => row.forEach(bead => bead.node.remove))
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
        const main = document.getElementById("main")
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
    const beadRowRange = beadArray.slice(row1, row2)
    beadRowRange.forEach(function(row) {
        const rowSlice = row.slice(column1, column2)
        rowSlice.forEach(function(bead) {
            bead.setStyle(style)
        })
    })
}

const fill = (beadArray, style) => setBeadRange(0, undefined, 0, undefined, beadArray, style)

const newSvgGroup = () => document.createElementNS("http://www.w3.org/2000/svg", "g")
const beadClick = bead => () => bead.setStyle(pattern.activeStyle)

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
        const name = document.createElement("div")
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
    const swatch = new Palette("Swatch", "swatch")
    swatch.innerWrapper = document.createElement("div")
    swatch.innerWrapper.setAttribute("id", "innerWrapper")
    swatch.palette.appendChild(swatch.innerWrapper)
    const buttons = styles.map(makeButton())
    buttons.forEach(function(button, i) {
        swatch.innerWrapper.appendChild(button.div)
    })
    return swatch
}

function swatchListener(swatch, active, styles) {
    swatch.innerWrapper.childNodes.forEach(function(button, i) {
        button.addEventListener(
            "click",
            paletteClick(pattern, styles[i], active)
        )
    })
}

function showActiveStyle(svgNode) {
    const active = new Palette("Active Bead")
    active.bead = new OneBead(svgNode, beadNode)
    active.bead.div.setAttribute("id", "active-bead")
    active.bead.bead.setStyle(pattern.activeStyle)
    const description = document.createElement("div")
    description.setAttribute("id", "bead-description")
    active.text = document.createTextNode(pattern.activeStyle.prettyName)
    description.appendChild(active.text)
    active.palette.appendChild(active.bead.div)
    active.palette.appendChild(description)
    return active
}

class OneBead {
    // a div with an svg with one bead
    constructor(svgNode, beadNode) {
        this.div = document.createElement("div")
        const svg = setViewBox(beadweaverSvg(svgNode), beadDefs.width, beadDefs.height)
        this.bead = new Bead(beadNode)
        svg.appendChild(this.bead.node)
        this.div.appendChild(svg)
    }
}

function makeButton() {
    return function makeButtonCallback(style) {
        const button = new OneBead(svgNode, beadNode)
        button.bead.setStyle(style)
        button.div.setAttribute("class", "button")
        return button
    }
}

function beadweaverSvg(node) {
    const clone = node.cloneNode(true)
    clone.setAttribute("width", "100%")
    clone.setAttribute("height", "100%")
    return clone
}

function setZoom(node, level, aspectRatio) {
    //aspectRatio = width/height
    let x = 0.2
    const h = (100-6) * Math.pow((1+x), level)
    const w = h * aspectRatio
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
    const node = document.createElement("style")
    node.setAttribute("id", "beadCss")
    document.head.appendChild(node)
    return node.sheet
}

function zoomButtons() {
    const zoom = new Palette("Zoom", "zoom-palette")
    const text = ["-", "fit", "+"]
    const zoomBtns = text.map(function zoomBtns(text) {
        const btn = textButton(text)
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
    const btn = document.createElement("div")
    btn.setAttribute("class", "text-button")
    const btnText = document.createTextNode(text)
    btn.appendChild(btnText)
    return btn
}

function paintTools(chunk) {
    const paint = new Palette("Paint", "paint-palette")
    const btn = textButton("fill")
    paint.palette.appendChild(btn)
    btn.addEventListener("click", () => fill(chunk.beadArray, pattern.activeStyle))
    return paint
}

window.onload = function() {
    Promise.all([loadNodes(), loadStyles()]).then(values => init(values))
}
