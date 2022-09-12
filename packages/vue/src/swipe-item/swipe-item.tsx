import { computed, defineComponent } from 'vue'
import { useState, useExpose } from '@fect-ui/vue-hooks'
import { createName, createBem } from '../utils'
import { useSwipeContext } from '../swipe/swipe-context'

import type { CSSProperties } from 'vue'

const name = createName('SwipeItem')
const bem = createBem('fect-swipe')

export default defineComponent({
  name,
  emits: ['click'],
  setup(props, { slots, emit }) {
    const { context } = useSwipeContext()

    const [translate, setTranslate] = useState<number>(0)

    if (!context) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Fect] <SwipeItem /> must be a child component of <Swipe />')
      }
      return
    }

    const setStyle = computed(() => {
      const { size } = context
      const style: CSSProperties = {
        width: `${size.value}px`,
        transform: `translateX(${translate.value}px)`
      }
      return style
    })

    const clickHandler = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      emit('click', e)
    }

    useExpose({ setTranslate })

    return () => (
      <div class={bem('item')} style={setStyle.value} onClick={clickHandler}>
        {slots.default?.()}
      </div>
    )
  }
})
