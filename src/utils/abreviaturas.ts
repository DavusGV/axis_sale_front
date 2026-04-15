export const abreviaturasComunes = [
  { label: 'Kilogramo',           valor: 'kg'    },
  { label: 'Gramo',               valor: 'g'     },
  { label: 'Litro',               valor: 'lt'    },
  { label: 'Mililitro',           valor: 'ml'    },
  { label: 'Metro',               valor: 'mtr'   },
  { label: 'Metro cuadrado',      valor: 'm²'    },
  { label: 'Centimetro',          valor: 'cm'    },
  { label: 'Centimetro cuadrado', valor: 'cm²'   },
  { label: 'Milimetro',           valor: 'mm'    },
  { label: 'Pulgada',             valor: 'in'    },
  { label: 'Pieza',               valor: 'pz'    },
  { label: 'Caja',                valor: 'caja'  },
  { label: 'Paquete',             valor: 'paq'   },
  { label: 'Rollo',               valor: 'rollo' },
  { label: 'Par',                 valor: 'par'   },
  { label: 'Docena',              valor: 'doc'   },
]

// retorna "Kilogramo (kg)" o solo el valor si no esta en el catalogo
export function labelAbreviatura(valor: string | null): string {
  if (!valor) return '--'
  const encontrada = abreviaturasComunes.find(a => a.valor === valor)
  return encontrada ? `${encontrada.label} (${valor})` : valor
}