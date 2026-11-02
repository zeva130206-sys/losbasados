# Arte independiente de personajes y enemigos

El juego ya puede cargar hojas de sprites PNG independientes, sin editar el motor.
Las definiciones están en `src/game/artManifest.ts`:

- `CHARACTER_SHEETS`: protagonistas, clave por ID (`basado`, `vaze`, `cody`, etc.).
- `ENEMY_SHEETS`: enemigos, clave por ID (`schot`, `madgear_gunner`, etc.).
- `src`: ruta relativa al juego publicado; por ejemplo `./assets/sprites/characters/vaze.png`.
- `frameWidth`, `frameHeight`, `columns`: tamaño de celda y columnas de la hoja.
- `animations`: nombre de acción a índices de celdas, empezando por cero.

Exporta PNG transparente en cuadrícula uniforme. Conviene dibujar cada pose mirando
hacia la derecha; el renderer invierte horizontalmente el sprite para mirar a la
izquierda. Las celdas se ajustan a 64 × 64 píxeles de juego. Puedes hacer celdas
más grandes (por ejemplo 96 × 96) y el renderer las escala.

Acciones de personajes: `idle`, `walk`, `punch1`, `punch2`, `punch3`, `kick`,
`jump`, `jumpkick`, `special`, `hurt`, `knocked`, `clinch`, `clinch_hit`, `throw`.
Enemigos usan `idle`, `walk`, `flank`, `windup`, `attack`, `hurt`, `knocked`,
`grabbed` y `thrown`.

Ejemplo en `src/game/artManifest.ts`:

```ts
vaze: {
  src: './assets/sprites/characters/vaze.png',
  frameWidth: 96,
  frameHeight: 96,
  columns: 8,
  animations: {
    idle: [0, 1, 2, 3], walk: [8, 9, 10, 11],
    punch1: [16, 17], punch2: [18, 19], punch3: [20, 21],
    kick: [24, 25, 26], jumpkick: [32, 33],
    special: [40, 41, 42, 43, 44, 45], hurt: [48, 49], knocked: [50]
  }
}
```

Para que el juego use una hoja, copia el PNG a `public/assets/sprites/characters/`
o `public/assets/sprites/enemies/`, agrega su entrada al manifiesto y vuelve a
compilar. Si la hoja no carga, se muestra automáticamente el arte incluido.
