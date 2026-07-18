export function initAntiDevTools(): void {
  const activo = import.meta.env.VITE_BLOQUEAR_INSPECCION === 'true'
  if (!activo) return

  // Deshabilitar clic derecho
  document.addEventListener('contextmenu', e => e.preventDefault())

  // Deshabilitar atajos de teclado
  document.addEventListener('keydown', e => {
    const bloqueado =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U') ||
      (e.ctrlKey && e.key === 'S')

    if (bloqueado) {
      e.preventDefault()
      e.stopPropagation()
    }
  })

  // Deteccion por tamano de ventana
  const threshold = 160
  let devtoolsAbierto = false

  setInterval(() => {
    const anchoDiff = window.outerWidth - window.innerWidth > threshold
    const altoDiff = window.outerHeight - window.innerHeight > threshold

    if ((anchoDiff || altoDiff) && !devtoolsAbierto) {
      devtoolsAbierto = true
      manejarDeteccion()
    } else if (!anchoDiff && !altoDiff) {
      devtoolsAbierto = false
    }
  }, 1000)

  // Deteccion por tiempo de pausa en debugger
  setInterval(() => detectarPorTiempoDebugger(manejarDeteccion), 2000)
}

function detectarPorTiempoDebugger(callback: () => void): void {
  const inicio = performance.now()
  debugger // eslint-disable-line no-debugger
  const transcurrido = performance.now() - inicio
  if (transcurrido > 100) {
    callback()
  }
}

function manejarDeteccion(): void {
  window.location.href = '/acceso-restringido'
}