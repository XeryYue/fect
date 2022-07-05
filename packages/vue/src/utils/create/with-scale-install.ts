import { h, defineComponent, provide, inject, reactive } from 'vue'
import { omit, assign } from '../format'
import type { App, ExtractPropTypes, InjectionKey } from 'vue'

export type WithScaleInstall<T> = T & {
  install(app: App): void
  name: string
}

export const scaleProps = {
  scale: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: '16px'
  },
  width: {
    type: String,
    default: 'auto'
  },
  w: {
    type: String,
    default: 'auto'
  },
  height: {
    type: String,
    default: 'auto'
  },
  h: {
    type: String,
    default: 'auto'
  },
  font: {
    type: [String, Number],
    default: '16px'
  },
  margin: {
    type: [String, Number],
    default: 0
  },
  marginLeft: {
    type: [String, Number]
  },
  ml: {
    type: [String, Number]
  },
  marginRight: {
    type: [String, Number]
  },
  mr: {
    type: [String, Number]
  },
  marginTop: {
    type: [String, Number]
  },
  mt: {
    type: [String, Number]
  },
  marginBottom: {
    type: [String, Number]
  },
  mb: {
    type: [String, Number]
  },
  padding: {
    type: [String, Number]
  },
  paddingLeft: {
    type: [String, Number]
  },
  pl: {
    type: [String, Number]
  },
  paddingRight: {
    type: [String, Number]
  },
  pr: {
    type: [String, Number]
  },

  paddingTop: {
    type: [String, Number]
  },
  pt: {
    type: [String, Number]
  },
  paddingBottom: {
    type: [String, Number]
  },
  pb: {
    type: [String, Number]
  },
  mx: {
    type: [String, Number]
  },
  my: {
    type: [String, Number]
  },
  px: {
    type: [String, Number]
  },
  py: {
    type: [String, Number]
  }
}

export type ScaleProps = ExtractPropTypes<typeof scaleProps>

interface ScaleContext {
  props: ScaleProps
  //   unit: string
  //   SCALES: {
  //     pt:
  //   }
}

const READONLY_SCLAE_KEY: InjectionKey<ScaleContext> = Symbol('ScaleRenderKey')

const createScaleContext = (values: ScaleContext) => provide(READONLY_SCLAE_KEY, values)

export const useScale = () => inject(READONLY_SCLAE_KEY, null)!

// https://vuejs.org/api/render-function.html#h

export const withScaleInstaller = <T>(component: T) => {
  const { name } = component as any
  const withScaleComponent = defineComponent({
    name,
    inheritAttrs: false,
    props: scaleProps,
    setup(props) {
      //   translate scale system.
      const scaleTranslate = () => {
        //
      }

      createScaleContext({
        props
      })
    },
    render() {
      const { $attrs, $props, $slots } = this
      return h(
        component,
        reactive(assign(omit($props, Object.keys(scaleProps) as Array<keyof ScaleProps>), $attrs)),
        $slots
      )
    }
  })

  ;(withScaleComponent as Record<string, unknown>).install = (app: App) => {
    app.component(name, withScaleComponent)
  }

  return withScaleComponent as unknown as WithScaleInstall<T>
}
