import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ofuscarActivo = env.VITE_OFUSCAR_CODIGO === 'true';

  return {
    plugins: [
      vue(),
      ...(ofuscarActivo
        ? [
            javaScriptObfuscator({
              options: {
                rotateStringArray: true,
                stringArray: true,
                stringArrayThreshold: 0.75,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.2,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.5,
                identifierNamesGenerator: 'hexadecimal',
                selfDefending: true,
              },
              apply: 'build'
            })
          ]
        : [])
    ],
    define: {
      'process.env': process.env // Asegura que las variables de entorno sean accesibles
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: ofuscarActivo,
          drop_debugger: ofuscarActivo,
        },
        mangle: { toplevel: ofuscarActivo }
      }
    }
  };
});