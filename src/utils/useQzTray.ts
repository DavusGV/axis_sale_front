import qz from 'qz-tray'
import axiosInstance from '@/utils/axios'

// estado de conexion compartido entre instancias
let conectando = false

// configura las promesas de certificado y firma antes de conectar
function configurarSeguridad(): void {
    // obtiene el certificado publico desde el backend
    qz.security.setCertificatePromise((_resolve: (cert: string) => void, reject: (err: any) => void) => {
        axiosInstance.get('/qztray/certificado', { responseType: 'text' })
            .then(res => _resolve(res.data))
            .catch(reject)
    })

    // firma el mensaje con la llave privada via backend
    qz.security.setSignatureAlgorithm('SHA512')
    qz.security.setSignaturePromise((mensaje: string) => {
        return (_resolve: (firma: string) => void, reject: (err: any) => void) => {
            axiosInstance.post('/qztray/firmar', { mensaje }, { responseType: 'text' })
                .then(res => _resolve(res.data))
                .catch(reject)
        }
    })
}

async function conectar(): Promise<void> {
    if (qz.websocket.isActive()) return
    if (conectando) {
        // esperamos a que termine la conexion en curso
        await new Promise<void>((resolve) => {
            const intervalo = setInterval(() => {
                if (qz.websocket.isActive()) {
                    clearInterval(intervalo)
                    resolve()
                }
            }, 100)
        })
        return
    }

    conectando = true
    try {
        configurarSeguridad()
        await qz.websocket.connect()
    } finally {
        conectando = false
    }
}

export function useQzTray() {

    // lista las impresoras disponibles en la PC del usuario
    async function listarImpresoras(): Promise<string[]> {
        await conectar()
        const impresoras = await qz.printers.find()
        return Array.isArray(impresoras) ? impresoras : [impresoras]
    }

    // imprime un PDF en base64 en la impresora indicada con ancho en mm
    async function imprimirPdf(
        nombreImpresora: string,
        pdfBase64: string,
        anchoMm: number = 80
    ): Promise<void> {
        await conectar()

        const config = qz.configs.create(nombreImpresora, {
            size: { width: anchoMm, height: null },
            units: 'mm',
            colorType: 'blackWhite',
        })

        const data = [{
            type: 'pixel',
            format: 'pdf',
            flavor: 'base64',
            data: pdfBase64,
        }]

        await qz.print(config, data)
    }

    // verifica si QZ Tray esta disponible en la PC
    function estaDisponible(): boolean {
        return typeof qz !== 'undefined'
    }

    return {
        listarImpresoras,
        imprimirPdf,
        estaDisponible,
    }
}