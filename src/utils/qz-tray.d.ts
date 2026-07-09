declare module 'qz-tray' {
    const qz: {
        websocket: {
            connect: () => Promise<void>
            disconnect: () => Promise<void>
            isActive: () => boolean
        }
        printers: {
            find: (query?: string) => Promise<string | string[]>
        }
        configs: {
            create: (printer: string, options?: {
                size?: { width: number; height: number | null }
                units?: string
                colorType?: string
                copies?: number
            }) => object
        }
        print: (config: object, data: object[]) => Promise<void>
        security: {
            setCertificatePromise: (
                handler: (
                    resolve: (cert: string) => void,
                    reject: (err: any) => void
                ) => void
            ) => void
            setSignatureAlgorithm: (algorithm: string) => void
            setSignaturePromise: (
                handler: (mensaje: string) => (
                    resolve: (firma: string) => void,
                    reject: (err: any) => void
                ) => void
            ) => void
        }
    }
    export default qz
}