import { h, defineComponent, provide, inject, reactive } from 'vue'
import { omit, assign, isUndefined, isNumber } from '../format'
import type { App, ExtractPropTypes, InjectionKey } from 'vue'

/**
 * Inspired by scala from geist-core
 * I want to keep the API style as consistent
 * as possible. Alough the implementation is
 * different.
 */

export type WithScaleInstall<T> = T & {
  install(app: App): void
  name: string
}

const scaleProps = {
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

export type ScaleInputs =
  | 'pt'
  | 'pr'
  | 'pb'
  | 'pl'
  | 'px'
  | 'py'
  | 'mt'
  | 'mr'
  | 'mb'
  | 'ml'
  | 'mx'
  | 'my'
  | 'width'
  | 'height'
  | 'font'

export type ModifersPipe = (baseScale: number, defaultValue?: string | number) => string

interface ScaleContext {
  SCALES: Record<ScaleInputs, ModifersPipe>
  getAllScaleProps: () => ScaleProps
}

const reduceScaleCoefficient = (scale: number) => {
  if (scale === 1) return scale
  const diff = Math.abs((scale - 1) / 2)
  return scale > 1 ? 1 + diff : 1 - diff
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
      const modifers =
        (attrValue: string | number | undefined): ModifersPipe =>
        (baseScale, defaultValue) => {
          if (!baseScale) {
            baseScale = 1
            defaultValue = defaultValue || 0
          }
          const stand = reduceScaleCoefficient(props.scale) * baseScale
          if (isUndefined(attrValue)) {
            if (!isUndefined(defaultValue)) return `${defaultValue}`
            return `calc(${stand} * ${props.unit})`
          }
          if (!isNumber(attrValue)) return `${attrValue}`
          const userStand = stand * Number(attrValue)
          return `calc(${userStand} * ${props.unit})`
        }

      createScaleContext({
        SCALES: {
          pt: modifers(props.paddingTop ?? props.pt ?? props.py ?? props.padding),
          pr: modifers(props.paddingRight ?? props.pr ?? props.px ?? props.padding),
          pb: modifers(props.paddingBottom ?? props.pb ?? props.py ?? props.padding),
          pl: modifers(props.paddingLeft ?? props.pl ?? props.px ?? props.padding),
          px: modifers(props.px ?? props.paddingLeft ?? props.paddingRight ?? props.pl ?? props.pr ?? props.padding),
          py: modifers(props.py ?? props.paddingTop ?? props.paddingBottom ?? props.pt ?? props.pb ?? props.padding),
          mt: modifers(props.marginTop ?? props.mt ?? props.my ?? props.margin),
          mr: modifers(props.marginRight ?? props.mr ?? props.mx ?? props.margin),
          mb: modifers(props.marginBottom ?? props.mb ?? props.my ?? props.margin),
          ml: modifers(props.marginLeft ?? props.ml ?? props.mx ?? props.margin),
          mx: modifers(props.mx ?? props.marginLeft ?? props.marginRight ?? props.ml ?? props.mr ?? props.margin),
          my: modifers(props.my ?? props.marginTop ?? props.marginBottom ?? props.mt ?? props.mb ?? props.margin),
          width: modifers(props.paddingRight ?? props.pr ?? props.px ?? props.padding),
          height: modifers(props.width ?? props.w),
          font: modifers(props.font)
        },
        getAllScaleProps: () => props
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
