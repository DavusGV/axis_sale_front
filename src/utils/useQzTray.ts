import qz from 'qz-tray'

// estado de conexion compartido entre instancias
let conectando = false

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