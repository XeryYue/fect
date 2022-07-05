# Scale Architecture

- I decide break to 2.0.0 . Use sacle system repalce currently `size` system.

First. Vue has attrs. We can declare it as a automatic implicit props. So with new scale system.

```js
;<Button h={0.5} w={0.3}></Button>
```

Second Way. Use Context wrapper each component. Or only use `theme-provide` control all components. When use fect `2.0` must use `theme-provide` wrapper all component. But I
think isn't a good way. May we refer `geist-core` provide `withScaleInstaller` replace current `withInstall`.
We can provide a full contenxt for each component instance. Just like.

```js
import { h, render } from 'vue'

const READONLY_SCLAE_KEY = Symbol('ScaleRenderKey')

const createScaleContext = () => createProvide(READONLY_SCLAE_KEY)

const withScaleInstaller = (component) => {
  const { name } = component
  //   write a h render wrapper the income component

  const withScaleComponent = h(component)
  // then installer it

  withScaleComponent.install = (app) => app.component(name, withScaleComponent)

  return withScaleComponent
}
```

##　 How to calculate the dynamic style?

Before `2.0.0` we use less as css compiler back-end. But after `2.0.0` I'm not found a good
way to replace currently. Most of css in js program is better for react. I think currently we
keep using `less` is enough. We might be able to combine css variable with inline style. If
i have time to finish my aot css framework. I will use it replace.

```js
<Button w={0.3}></Button>

// => with use the scale get the css variable but can we do better?

<Button style={{'--width--':0.3}}></Button>

```

Maybe we should have a concept of convention.If user pass `w/width` or `pt/padding-top` will be transform as `--componetName-width:value`. Then declare the variable in your css sheet.
