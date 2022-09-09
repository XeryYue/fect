export const props = {
  duration: {
    type: [Number, String],
    default: 300
  },
  autoplay: {
    type: Number
  },
  touchable: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: true
  },
  initialValue: {
    type: Number,
    default: 0
  },
  indicatorSize: {
    type: String,
    default: '8px'
  },
  indicatorDisplay: {
    type: Boolean,
    default: true
  },
  indicatorColor: String
}
