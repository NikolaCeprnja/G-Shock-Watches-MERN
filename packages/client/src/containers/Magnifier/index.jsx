import { forwardRef } from 'react'
import PropTypes from 'prop-types'

let magnifierWidth = 0
let magnifierHeight = 0
const zoom = 2

const initMagnifier = (parent, zoomLevel = zoom) => {
  const { firstChild, lastChild } = parent

  firstChild.style.backgroundColor = '#fff'
  firstChild.style.imageRendering = 'pixelated'
  firstChild.style.backgroundImage = `url(${lastChild.src})`
  firstChild.style.backgroundRepeat = 'no-repeat'
  firstChild.style.backgroundSize = `${lastChild.width * zoomLevel}px ${
    lastChild.height * zoomLevel
  }px`
  magnifierWidth = firstChild.offsetWidth || 200 / 2
  magnifierHeight = firstChild.offsetHeight || 200 / 2
}

const moveMagnifier = e => {
  const {
    currentTarget: { firstChild, lastChild },
  } = e

  // prevent any other actions that may occur when moving over the image
  e.preventDefault()

  // get the cursor's x and y positions:
  const bw = 1.5
  let { x, y } = getCursorPos(e)

  // prevent the magnifier glass from being positioned outside the image
  if (x > lastChild.width - magnifierWidth / zoom) {
    x = lastChild.width - magnifierWidth / zoom
  }

  if (x < magnifierWidth / zoom) {
    x = magnifierWidth / zoom
  }

  if (y > lastChild.height - magnifierHeight / zoom) {
    y = lastChild.height - magnifierHeight / zoom
  }

  if (y < magnifierHeight / zoom) {
    y = magnifierHeight / zoom
  }

  // set the position of the magnifier glass
  firstChild.style.left = `${x - magnifierWidth}px`
  firstChild.style.top = `${y - magnifierHeight}px`

  // display what the magnifier glass "sees"
  firstChild.style.backgroundPosition = `-${
    x * zoom - magnifierWidth + bw
  }px -${y * zoom - magnifierHeight + bw}px`
}

function getCursorPos(e) {
  const { currentTarget, clientX, clientY } = e

  // get the x and y coordinates of the image
  const a = currentTarget.lastChild.getBoundingClientRect()

  // calculate the cursor's x and y coordinates, relative to the image
  const x = clientX - a.x
  const y = clientY - a.y

  return { x, y }
}

const handleMouseMove = e => {
  moveMagnifier(e)
}

const handleOnMouseEnter = e => {
  const { currentTarget: parent } = e

  parent.firstChild.style.display = 'block'
}

const handleOnMouseLeave = e => {
  const { currentTarget: parent } = e

  parent.firstChild.style.display = 'none'
}

const Magnifier = forwardRef(({ children }, fowardedRef) => {
  return children({
    fowardedRef,
    initMagnifier,
    handleMouseMove,
    handleOnMouseEnter,
    handleOnMouseLeave,
  })
})

Magnifier.propTypes = {
  children: PropTypes.func.isRequired,
}

export default Magnifier
