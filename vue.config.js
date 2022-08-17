module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/memomix/'
    : '/'
  ,
  pages: {
    index: {
      title: 'MemoMix Web'
    }
  }
}