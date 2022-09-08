import { computed, ref, watch, nextTick, defineComponent } from 'vue'
import { useState } from '@fect-ui/vue-hooks'
import { props } from './props'
import { createSwipeContext } from './swipe-context'
import { createName, getDomRect, createBem, len, make } from '../utils'
import { Position, useDraggable, useMounted } from '../composables'

import type { CSSProperties, Ref } from 'vue'
import type { Shape, Placement } from './interface'

import './index.less'

const name = createName('Swipe')

const bem = createBem('fect-swipe')

const nextTickFrame = (fn: FrameRequestCallback) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn)
  })
}

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

    const [lockDuration, setLockDuration] = useState<number>(0)

    // the swipe container real width
    const [swipeWidth, setSwipeWidth] = useState<number>(0)

    const [trackWidth, setTrackWidth] = useState<number>(0)

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

    const calibration = (fn?: () => void) => {
      //
      fn && fn()
    }

    const updateTranslate = (next = false) => {
      const { loop } = props

      calibration(() => (next ? loadNext() : loadPrev()))
    }

    /**
     * Before v1.6.0 when user trigger the window resize.
     * We will initialize swipe cursor at first. But it's
     * unreasonable.
     */

    const initializeSwipe = (invork?: (length: number) => void) => {
      nextTick(() => {
        const { width } = getDomRect(swipeRef)
        setSwipeWidth(width)
        setTrackWidth(width * len(children))
        invork && invork(len(children))
      })
    }

    const windowResizeHandler = (destory = false) => {
      window.addEventListener('resize', () =>
        initializeSwipe((cl) => {
          setTranslate(cl * swipeWidth.value)
          if (destory) {
          }
        })
      )
    }

    watch(index, (pre) => emit('change', pre))

    useMounted([windowResizeHandler, () => windowResizeHandler(true)])

    watch(children, () =>
      initializeSwipe(() => {
        const { initialValue } = props
        setIndex(initialValue)
      })
    )

    const dragInvork = (invork?: () => void) => {
      if (len(children) <= 1 || !props.touchable) return
      invork && invork()
    }

    const dragStartHandler = () => dragInvork()

    const dragMoveHandler = (_: Event, position: Ref<Position>) =>
      dragInvork(() => {
        setTranslate(-position.value.x)
      })

    const dragEndHandler = (_: Event, position: Ref<Position>) => {
      dragInvork(() => {
        setTranslate(-position.value.x)
      })
    }

    useDraggable(trackRef, {
      onStart: dragStartHandler,
      onMove: dragMoveHandler,
      onEnd: dragEndHandler
    })

    const indicatorHandler = (nextCursor: number) => {
      if (len(children) <= 1 || nextCursor === index.value) return
      const status = nextCursor > index.value
      const tasks = Math.abs(nextCursor - index.value)
      setIndex(nextCursor)
      make(tasks).forEach(() => updateTranslate(status))
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
