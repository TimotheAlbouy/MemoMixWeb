module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/memomix/'
    : '/'
  ,
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'MemoMix Web'
    }
  }
}