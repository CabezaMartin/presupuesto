# Contract: archivo de copia de seguridad

**Requisitos**: FR-020a, FR-020b

- **Nombre al descargar**: `presupuestospro-copia-AAAA-MM-DD.json`
- **Formato**: JSON UTF-8. El contenido es exactamente el objeto de estado descrito en [data-model.md](../data-model.md).

## Ejemplo

```json
{
  "app": "presupuestospro",
  "version": 1,
  "perfil": {
    "nombre": "Laura Gómez Diseño",
    "nif": "12345678Z",
    "email": "laura@ejemplo.es",
    "telefono": "600 000 000",
    "direccion": "C/ Mayor 1, 28013 Madrid",
    "logo": "data:image/png;base64,iVBORw0..."
  },
  "catalogo": [
    { "id": "a1", "nombre": "Diseño de página web", "precio": 150000 }
  ],
  "presupuestos": [
    {
      "id": "p1",
      "numero": "2026-001",
      "fechaEmision": "2026-10-03",
      "cliente": { "nombre": "Acme S.L.", "tipo": "empresa", "nif": "B12345678", "direccion": "", "email": "" },
      "lineas": [
        { "descripcion": "Diseño de página web", "cantidad": 1, "precio": 150000 },
        { "descripcion": "Sesión de fotos de producto", "cantidad": 1, "precio": 50000 }
      ],
      "retencion": { "activa": true, "porcentaje": 15 },
      "notas": "Pago: 50 % al aceptar, 50 % a la entrega"
    }
  ],
  "contadores": { "2026": 1 }
}
```

## Validación al restaurar

El archivo se acepta solo si:
1. Es JSON válido.
2. `app === "presupuestospro"` y `version === 1`.
3. `catalogo` y `presupuestos` son arrays, `contadores` es un objeto y `perfil` es un objeto o `null`.

Si falla cualquier punto → mensaje "Este archivo no es una copia de seguridad válida de PresupuestosPro." y **no se modifica ningún dato**.

Si es válido → `confirm("Se sustituirán todos tus datos actuales por los de la copia. ¿Continuar?")`. Solo si se acepta, el estado se reemplaza entero y se guarda.
