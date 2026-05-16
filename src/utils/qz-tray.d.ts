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
    }
    export default qz
}