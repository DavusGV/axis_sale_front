import axiosInstance from '@/utils/axios'

// obtiene el estado de la suscripcion del establecimiento activo
export const fetchEstadoSuscripcion = async () => {
  const res = await axiosInstance.get('/suscripcion/estado')
  return res.data
}

// cuentas de deposito activas para mostrarle al cliente donde depositar
export const fetchCuentasDeposito = async () => {
  const res = await axiosInstance.get('/suscripcion/cuentas-deposito')
  return res.data
}

// descarga el pdf con las cuentas de deposito activas, uso del cliente bloqueado
export const descargarCuentasDepositoPdf = async () => {
  const res = await axiosInstance.get('/suscripcion/cuentas-deposito/pdf', {
    responseType: 'blob',
  })
  return res.data
}

// historial de pagos del establecimiento activo
export const fetchPagosSuscripcion = async (params = {}) => {
  const res = await axiosInstance.get('/suscripcion/pagos', { params })
  return res.data
}

// registra el pago con su comprobante, se envia como FormData por el archivo
export const registrarPagoSuscripcion = async (data: FormData) => {
  const res = await axiosInstance.post('/suscripcion/pagos', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ---------- administracion ----------

// listado de suscripciones de todos los establecimientos
export const fetchSuscripciones = async (params = {}) => {
  const res = await axiosInstance.get('/suscripciones', { params })
  return res.data
}

// alta de la suscripcion de un establecimiento
export const guardarSuscripcion = async (data: any) => {
  const res = await axiosInstance.post('/suscripciones', data)
  return res.data
}

// edicion de una suscripcion existente
export const actualizarSuscripcion = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/suscripciones/${id}`, data)
  return res.data
}

// pagos pendientes de verificar de todos los establecimientos
export const fetchPagosPendientes = async (params = {}) => {
  const res = await axiosInstance.get('/suscripciones/pagos/pendientes', { params })
  return res.data
}

export const verificarPago = async (id: number) => {
  const res = await axiosInstance.post(`/suscripciones/pagos/${id}/verificar`, {})
  return res.data
}

export const rechazarPago = async (id: number, motivo: string) => {
  const res = await axiosInstance.post(`/suscripciones/pagos/${id}/rechazar`, {
    motivo_rechazo: motivo,
  })
  return res.data
}

export const fetchCuentasAdmin = async (params = {}) => {
  const res = await axiosInstance.get('/cuentas-deposito', { params })
  return res.data
}

export const guardarCuenta = async (data: any) => {
  const res = await axiosInstance.post('/cuentas-deposito', data)
  return res.data
}

export const actualizarCuenta = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/cuentas-deposito/${id}`, data)
  return res.data
}

export const eliminarCuenta = async (id: number) => {
  const res = await axiosInstance.delete(`/cuentas-deposito/${id}`)
  return res.data
}

// exporta en pdf todas las cuentas activas
export const descargarCuentasActivasPdf = async () => {
  const res = await axiosInstance.get('/cuentas-deposito/pdf', {
    responseType: 'blob',
  })
  return res.data
}

// exporta en pdf una cuenta especifica
export const descargarCuentaPdf = async (id: number) => {
  const res = await axiosInstance.get(`/cuentas-deposito/${id}/pdf`, {
    responseType: 'blob',
  })
  return res.data
}