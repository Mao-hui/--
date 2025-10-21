// 修复 ResizeObserver 错误
export const suppressResizeObserverError = () => {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

// 全局错误处理
export const setupGlobalErrorHandling = () => {
  // 处理 ResizeObserver 错误
  window.addEventListener('error', (event) => {
    if (event.message === 'ResizeObserver loop completed with undelivered notifications.') {
      event.preventDefault()
      return false
    }
  })

  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      event.preventDefault()
      return false
    }
  })
}
