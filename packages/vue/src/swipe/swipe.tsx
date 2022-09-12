import { computed, ref, watch, nextTick, defineComponent } from 'vue'
import { useState } from '@fect-ui/vue-hooks'
import { props } from './props'
import { createSwipeContext } from './swipe-context'
import { createName, getDomRect, createBem, len, make, assign, pick } from '../utils'
import { Position, useDraggable, useMounted } from '../composables'

import type { CSSProperties, Ref } from 'vue'

import type { DomRect } from '../utils'

import './index.less'

const name = createName('Swipe')

const bem = createBem('fect-swipe')

export default defineComponent({
  name,
  props,
  emits: ['change'],
  setup(props, { slots, emit }) {
    const { provider, children } = createSwipeContext()

    const swipeRef = ref<HTMLDivElement>()
    const trackRef = ref<HTMLDivElement>()

    const [index, setIndex] = useState<number>(0)
    const [translate, setTranslate] = useState<number>(0)

    const [lockDuration, setLockDuration] = useState<boolean>(false)

    // the swipe container real width
    const [swipeWidth, setSwipeWidth] = useState<number>(0)

    const [trackWidth, setTrackWidth] = useState<number>(0)

    // darag position

    const dragStartPosition: Position = {
      x: 0,
      y: 0
    }

    provider({ index, trackSize: trackWidth, size: swipeWidth })

    const loadPrev = () => {
      //
      if (index.value !== 0) {
        setTranslate(index.value * -swipeWidth.value)
      }
    }

    const loadNext = () => {
      //
      if (index.value !== len(children)) {
        setTranslate(index.value * -swipeWidth.value)
      }
    }

    const calibration = (invork?: () => void) => {
      // const overLeft = translate.value >= swipeWidth.value
      // const overRight = translate.value <= -trackWidth.value
      // // fn && fn()
      // const leftTranslate = 0
      // const rightTranslate = -(trackWidth.value - swipeWidth.value)
      // setLockDuration(true)
      // if (overLeft || overRight) {
      // }
    }

    const updateTranslate = (next = false) => {
      const { loop } = props

      // calibration(() => (next ? loadNext() : loadPrev()))
    }

    /**
     * Before v1.6.0 when user trigger the window resize.
     * We will initialize swipe cursor at first. But it's
     * unreasonable.
     */

    const initializeSwipe = (invork?: (length: number) => void) => {
      setLockDuration(true)
      nextTick(() => {
        const { width } = getDomRect(swipeRef)
        setSwipeWidth(width)
        setTrackWidth(width * len(children))
        invork && invork(len(children))
        window.setTimeout(() => setLockDuration(false))
      })
    }

    const windowResizeHandler = (destory = false) => {
      window.addEventListener('resize', () =>
        initializeSwipe((cl) => {
          setTranslate(cl * -swipeWidth.value)
          children.forEach((child) => child.setTranslate(0))
          if (destory) {
          }
        })
      )
    }

    watch(index, (pre) => emit('change', pre))

    // useMounted([windowResizeHandler, () => windowResizeHandler(true)])

    watch(children, () =>
      initializeSwipe(() => {
        const { initialValue } = props
        setIndex(initialValue)
      })
    )

    const dragInvork = (invork?: () => void) => {
      if (len(children) <= 1 || !props.touchable) return
      setLockDuration(true)
      invork && invork()
    }

    const dragStartHandler = (_: Event, position: DomRect) => {
      dragInvork(() => assign(dragStartPosition, pick(position, ['x', 'y'])))
      console.log(dragStartPosition)
    }

    const dragMoveHandler = (e: Event, position: Ref<Position>) =>
      dragInvork(() => {
        e.preventDefault()
        setTranslate((pre) => (pre += position.value.x))
        if (!props.loop) return
        if (translate.value >= 0) children[len(children) - 1].setTranslate(-translate.value)
        if (translate.value <= -(trackWidth.value - swipeWidth.value)) children[0].setTranslate(trackWidth.value)
        if (translate.value > -(trackWidth.value - swipeWidth.value) && translate.value < 0) {
          children[len(children) - 1].setTranslate(0)
          children[0].setTranslate(0)
        }
      })

    const dragEndHandler = (_: Event, position: Ref<Position>) => {
      dragInvork(() => {
        const { x: prevX } = dragStartPosition
        const distance = Math.abs(prevX - position.value.x)
        const status = position.value.x < prevX
        setIndex((pre) => (status ? (pre += 1) : (pre -= 1)))
        updateTranslate(status)
      })
    }

    /**
     * UseDraggable composable content touch and mouse event.
     * So in pc or mobile behavior as compatible as possible
     */

    useDraggable(trackRef, {
      onStart: dragStartHandler,
      onMove: dragMoveHandler,
      onEnd: dragEndHandler
    })

    const indicatorHandler = (nextCursor: number) => {
      if (len(children) <= 1 || nextCursor === index.value) return
      // const status = nextCursor > index.value
      // const tasks = Math.abs(nextCursor - index.value)
      // setIndex(nextCursor)
      // make(tasks).forEach(() => updateTranslate(status))
    }

    const setTrackStyle = computed(() => {
      const style: CSSProperties = {
        width: `${trackWidth.value}px`,
        transform: `translateX(${translate.value}px)`,
        transitionDuration: lockDuration.value ? '0ms' : `${props.duration}ms`
      }
      return style
    })

    const renderIndicator = () => {
      if (slots.indicator) return slots.indicator()

      const { indicatorDisplay } = props
      if (!len(children) && indicatorDisplay) return
      const setStyle = (idx: number): CSSProperties => {
        const active = index.value === idx
        const { indicatorColor, indicatorSize } = props
        return {
          backgroundColor: indicatorColor ? indicatorColor : 'var(--success-default)',
          width: indicatorSize,
          height: indicatorSize,
          opacity: active ? 1 : 0.3
        }
      }

      return (
        <div class={bem('indicators')}>
          {children.map((_, i) => (
            <span class={bem('indicator')} style={setStyle(i)} key={i} onClick={() => indicatorHandler(i)}></span>
          ))}
        </div>
      )
    }

    return () => (
      <div class={bem(null)} ref={swipeRef}>
        <div class={bem('track')} ref={trackRef} style={setTrackStyle.value}>
          {slots.default?.()}
        </div>
        {renderIndicator()}
      </div>
    )
  }
})
