/**
 * Historia, Ficha Técnica y Progresión de Etapas Mundiales (Final Fight 2) para "Los Basados: Furia Callejera"
 * Adapta la arquitectura de Capcom SNES: 6 países con 10 a 15 sub-etapas cada uno (Calles, Callejones, Metro Subterráneo, Andenes),
 * elenco ampliado de luchadores (Maki, Haggar, Carlos, Cody) y frases basadas.
 */

import { EnemyType, StageData, SubAreaConfig, SubAreaType } from './types';

export interface StoryFrame {
  id: number;
  speaker: string;
  portrait: 'maki' | 'haggar' | 'carlos' | 'cody' | 'marian' | 'retu' | 'narrator';
  text: string;
}

// Repositorio de Frases Basadas en combate (cultura de Los Basados)
export const BASED_QUOTES = {
  combos: [
    "¡DOMADÍSIMO!",
    "¡POR LA BABY PC!",
    "¡SUELTA A MI BABY!",
    "¡NADIE TOCA MI HARDWARE!",
    "¡OVERCLOCK BASADO!",
    "¡PAGARÁS POR CADA TORNILLO DE MI BABY!",
    "¡TOMA TU RATIO!",
    "¡FACTORES!",
    "¡ES CINE!",
    "¡A LLORAR A LA LLORERÍA!",
    "¡QUÉ FÁCIL!",
    "¡HABLA CON EL PUÑO!"
  ],
  clinch: [
    "¡AGÁRRATE QUE VIENE CURVA!",
    "¡A DÓNDE CREES QUE VAS!",
    "¡MUY CERQUITA PARA SER CRINGE!",
    "¡RODILLAZO BASADO!",
    "¡SIÉNTATE UN RATO!"
  ],
  throws: [
    "¡A VOLAR POR EL AIRE!",
    "¡EXPULSIÓN DIRECTA!",
    "¡SUPLEX DE GIGACHAD!",
    "¡DESPEJE DE ÁREA!",
    "¡CONTRA EL PAVIMENTO!"
  ],
  specials: [
    "¡SPINNING CLOTHESLINE BASADO!",
    "¡MODO BASADO AL 100%!",
    "¡PATADA GIRATORIA BUSHIN!",
    "¡EL VERDADERO CHAD!",
    "¡CORTE DE KATANA DEFINITIVO!",
    "¡TORNADO KICK DE CODY!",
    "¡SIMPLEMENTE BASADO!",
    "¡ESTE ES MI PRIME!",
    "¡DESINTEGRACIÓN BASADA!"
  ],
  kos: [
    "¡DESINSTALA EL JUEGO!",
    "¡DOMADO Y A DORMIR!",
    "¡RATIO + L + K.O.!",
    "¡MUCHO TIKTOK, POCO COMBATE!",
    "¡A LA CAMA SIN CENAR!",
    "¡OTRO MÁS AL RESUMEN!",
    "¡SIN PALABRAS!",
    "¡LE FALTA FIBRA!"
  ],
  food: [
    "¡CARNE ASADA DE GIGACHAD!",
    "¡REVIVÍ CON PURA FIBRA!",
    "¡PIZZA 100% BASADA!",
    "¡COMBUSTIBLE PARA EL PRIME!",
    "¡SALUD Y FACTORES!"
  ],
  tag: [
    "¡ENTRA EL REFUERZO BASADO!",
    "¡MIRA Y APRENDE!",
    "¡ES MI TURNO DE FACTURAR!",
    "¡DOBLE RATIO ACTIVADO!"
  ]
};

export function getRandomBasedQuote(category: keyof typeof BASED_QUOTES): string {
  const list = BASED_QUOTES[category];
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

// Generador de 10 a 15 sub-áreas dinámicas por país (Calles, Callejones, Metro Subterráneo, Andén, etc.)
export function generateSubAreasForCountry(country: string, bossType: EnemyType): SubAreaConfig[] {
  // Generar entre 10 y 13 sub-áreas por país (número balanceado para ritmo arcade impecable)
  const total = 11;
  const list: SubAreaConfig[] = [];

  const typesCycle: { type: SubAreaType; name: string; ambientColor: string }[] = [
    { type: 'calle_comercial', name: `Bulevar Comercial de ${country}`, ambientColor: '#0f172a' },
    { type: 'callejon_oscuro', name: `Callejón Trasero con Grafitis`, ambientColor: '#18181b' },
    { type: 'galeria_tiendas', name: `Galería de Tiendas y Letreros Neón`, ambientColor: '#1e1b4b' },
    { type: 'entrada_metro', name: `Boca del Metro y Escaleras Subterráneas`, ambientColor: '#14532d' },
    { type: 'anden_subterraneo', name: `Andén Subterráneo y Vías de Tren`, ambientColor: '#1e293b' },
    { type: 'callejon_oscuro', name: `Pasadizo de Alcantarillas y Vapor`, ambientColor: '#172554' },
    { type: 'muelle_portuario', name: `Salida a la Estación Portuaria`, ambientColor: '#0c4a6e' },
    { type: 'calle_comercial', name: `Avenida Central con Faroles`, ambientColor: '#2e1065' },
    { type: 'vias_tren', name: `Túneles de Mantenimiento Subterráneo`, ambientColor: '#3b0764' },
    { type: 'azotea_nocturna', name: `Azoteas de Neón y Marquesinas`, ambientColor: '#450a0a' },
    { type: 'calle_comercial', name: `Guarida Principal de Mad Gear`, ambientColor: '#022c22' }
  ];

  for (let i = 0; i < total; i++) {
    const isLast = i === total - 1;
    const template = typesCycle[i % typesCycle.length];
    list.push({
      subAreaIndex: i + 1,
      totalSubAreas: total,
      name: isLast ? `Enfrentamiento Final: ${template.name}` : template.name,
      type: template.type,
      levelLength: isLast ? 750 : 620, // Longitud de la pantalla por sub-escena
      enemyCount: isLast ? 6 : 4 + Math.floor(i / 3),
      hasBoss: isLast,
      bossType: isLast ? bossType : undefined,
      ambientColor: template.ambientColor
    });
  }

  return list;
}

// Las 6 Etapas Globales de Final Fight 2 adaptadas
export const STAGES_CONFIG: StageData[] = [
  {
    stageNumber: 1,
    name: "Muelles y Calles de Hong Kong",
    country: "Hong Kong",
    desc: "Muelles portuarios, restaurantes de fideos, callejones de neón y estaciones de metro subterráneo.",
    backgroundTheme: 'hongkong',
    levelLength: 620,
    bossType: 'boss_won',
    bossName: 'Won Won (Ex-Cocinero)',
    bgmType: 'dock',
    subAreas: generateSubAreasForCountry("Hong Kong", 'boss_won')
  },
  {
    stageNumber: 2,
    name: "Boulevards y Metro de París",
    country: "Francia",
    desc: "Avenidas empedradas, bistrós, túneles del metro subterráneo y obras metálicas junto al Sena.",
    backgroundTheme: 'france',
    levelLength: 620,
    bossType: 'boss_fred',
    bossName: 'Freddie (Ex-Marine)',
    bgmType: 'street',
    subAreas: generateSubAreasForCountry("Francia", 'boss_fred')
  },
  {
    stageNumber: 3,
    name: "Canales y Esclusas de Holanda",
    country: "Holanda",
    desc: "Canales de agua, puentes, esclusas subterráneas y zonas industriales con minas de contacto.",
    backgroundTheme: 'holland',
    levelLength: 620,
    bossType: 'andore',
    bossName: 'Bratken (Lunático)',
    bgmType: 'street',
    subAreas: generateSubAreasForCountry("Holanda", 'andore')
  },
  {
    stageNumber: 4,
    name: "Metro y Expreso de Londres",
    country: "Inglaterra",
    desc: "Calles victorianas bajo lluvia, estación subterránea The Tube y techos de trenes expreso a gran velocidad.",
    backgroundTheme: 'england',
    levelLength: 620,
    bossType: 'andore_jr',
    bossName: 'Philippe (Maestro Circense)',
    bgmType: 'street',
    subAreas: generateSubAreasForCountry("Inglaterra", 'andore_jr')
  },
  {
    stageNumber: 5,
    name: "Puentes Venecianos y Criptas de Italia",
    country: "Italia",
    desc: "Plazas de piedra, góndolas, catacumbas subterráneas romanas e invasión masiva del clan Andore.",
    backgroundTheme: 'italy',
    levelLength: 620,
    bossType: 'g_andore',
    bossName: 'Gran Andore (Líder del Clan)',
    bgmType: 'street',
    subAreas: generateSubAreasForCountry("Italia", 'g_andore')
  },
  {
    stageNumber: 6,
    name: "Calles de Tokio y Dojo de la Tormenta",
    country: "Japón",
    desc: "Calles iluminadas por neones de Akihabara, subterráneos de Shinjuku y el dojo ancestral bajo relámpagos.",
    backgroundTheme: 'japan',
    levelLength: 750,
    bossType: 'boss_retu',
    bossName: 'Retu (Líder Supremo Mad Gear)',
    bgmType: 'dojo',
    subAreas: generateSubAreasForCountry("Japón", 'boss_retu')
  }
];

export const GAME_STORY = {
  title: "LOS BASADOS",
  subtitle: "FURIA CALLEJERA · 16-BIT CPS ARCADE EDITION",
  year: "1993",
  synopsis: `Tras la caída del sindicato Mad Gear en Metro City, sus remanentes se reorganizan bajo el mando de Retu desplegando una red criminal a través de Eurasia. Secuestran al maestro Genryusai y a Rena. Para rescatarlos, el alcalde Mike Haggar, Maki Genryusai, Carlos Miyamoto y Cody Travers viajan por Hong Kong, Francia, Holanda, Inglaterra, Italia y Japón recorriendo calles, callejones y subterráneos repartiendo factores y combos basados.`,

  characters: [
    {
      id: "vaze",
      name: "VAZE (El Basado)",
      alias: "Rebelde Urbano - Fists & Speed",
      archetype: "allrounder",
      style: "Boxeo Callejero & Neo-Furia",
      stats: {
        velocidad: "⭐⭐⭐⭐⭐",
        fuerza: "⭐⭐⭐⭐⭐",
        alcance: "⭐⭐⭐⭐"
      },
      signatureMove: "Neo-Furia (Orbe y Corte Carmesí)",
      bio: "Protagonista canónico de Los Basados. Gorra invertida, gabardina roja carmesí, camiseta táctica y mitones de combate. Juró recuperar su legendaria PC 'La Baby' a puño limpio por toda Eurasia.",
      color: "#ef4444"
    },
    {
      id: "cody",
      name: "Cody (Luchador Callejero)",
      alias: "Brawler Equilibrado",
      archetype: "allrounder",
      style: "Boxeo Callejero & Cuchillos",
      stats: {
        velocidad: "⭐⭐⭐⭐",
        fuerza: "⭐⭐⭐⭐",
        alcance: "⭐⭐⭐⭐"
      },
      signatureMove: "Tornado Kick & Mega Uppercut",
      bio: "22 años, 1.82 m, 85 kg. El icónico héroe de camiseta blanca, vaqueros azules y muñequeras. Experto en combate directo, golpes rápidos y barridos con patadas giratorias.",
      color: "#3b82f6"
    },
    {
      id: "haggar",
      name: "Haggar (Alcalde Grappler)",
      alias: "Heavy Titan",
      archetype: "grappler",
      style: "Lucha Libre Profesional & Demolición",
      stats: {
        velocidad: "⭐⭐",
        fuerza: "⭐⭐⭐⭐⭐",
        alcance: "⭐⭐⭐⭐⭐"
      },
      signatureMove: "Spinning Clothesline & Piledriver",
      bio: "46 años, 2.08 m, 127 kg. Colosal luchador con arnés de cuero, pantalones de combate y bigote imponente. Sus cabezazos, agarres y el clásico lariat giratorio despejan multitudes.",
      color: "#eab308"
    },
    {
      id: "maki",
      name: "Maki (Ninja Bushinryu)",
      alias: "Speedster Kunoichi",
      archetype: "speedster",
      style: "Ninjutsu Bushinryu & Patadas Voladoras",
      stats: {
        velocidad: "⭐⭐⭐⭐⭐",
        fuerza: "⭐⭐⭐",
        alcance: "⭐⭐⭐⭐"
      },
      signatureMove: "Spinning Handstand Kick",
      bio: "20 años, 1.63 m. Hermana menor de Rena. Traje carmesí ninja Bushinryu, coleta rubia y velocidad supersónica para conectar combos fulminantes y proyecciones.",
      color: "#ef4444"
    },
    {
      id: "carlos",
      name: "Carlos (Espadachín Samurai)",
      alias: "All-Rounder Katana",
      archetype: "allrounder",
      style: "Katana Japonesa & Artes Marciales",
      stats: {
        velocidad: "⭐⭐⭐⭐",
        fuerza: "⭐⭐⭐⭐",
        alcance: "⭐⭐⭐⭐"
      },
      signatureMove: "Dancing Blade (Corte Katana)",
      bio: "1.88 m, 90 kg. Practicante sudamericano de artes marciales y katana. Equilibrio perfecto de alcance cortante y patadas defensivas.",
      color: "#10b981"
    }
  ],

  prologueFrames: [
    {
      id: 1,
      speaker: "NARRADOR",
      portrait: "narrator",
      text: "EURASIA, 1993. Mad Gear renace bajo el mando de Retu, secuestrando al maestro Genryusai y a Rena en una red terrorista internacional."
    },
    {
      id: 2,
      speaker: "CODY",
      portrait: "cody",
      text: "¡No nos detendremos hasta limpiar cada callejón, tienda y estación de metro de esta escoria! Haggar, Maki, Carlos... ¡es hora de pelear!"
    },
    {
      id: 3,
      speaker: "HAGGAR",
      portrait: "haggar",
      text: "¡Mad Gear va a pagar muy caro haber tocado a nuestra gente! En Hong Kong, París o Tokio... van a probar la fuerza de mis puños."
    },
    {
      id: 4,
      speaker: "MAKI",
      portrait: "maki",
      text: "¡El arte Bushinryu no conoce el miedo! Recorreremos las calles y los subterráneos hasta rescatar a mi hermana Rena."
    }
  ] as StoryFrame[],

  comicPanels: [
    {
      id: 1,
      title: "CAPÍTULO 1: EL TESORO DE LOS BASADOS",
      subtitle: "Cuartel General Subterráneo · 02:45 AM",
      sceneType: "hq",
      narration: "En el corazón del distrito subterráneo, VAZE y su escuadrón contemplan su obra magna: 'LA BABY'. Una PC customizada legendaria con enfriamiento líquido carmesí, triple ventilación RGB y el código base supremo de Los Basados.",
      dialogue: [
        {
          speaker: "VAZE",
          text: "Mírenla... es pura perfección. Mi 'Baby' tiene el hardware más potente de toda Eurasia. Con esto dominamos cualquier ratio y noqueamos a cualquier llorón.",
          balloonType: "speech",
          avatar: "vaze"
        },
        {
          speaker: "HAGGAR",
          text: "¡Tiene más caballos de fuerza que mis suplex! Cuídala bien, muchacho, en las calles todos conocen el valor de tu Baby.",
          balloonType: "speech",
          avatar: "haggar"
        }
      ],
      sfx: "HUMMM... [REFRIGERACIÓN LÍQUIDA AL 100%]"
    },
    {
      id: 2,
      title: "CAPÍTULO 2: ¡EL ASALTO DEL FRIKI HACKER!",
      subtitle: "¡ALERTA MÁXIMA! Las luces parpadean en rojo",
      sceneType: "raid",
      narration: "¡CRRAAASHHH! Las puertas de acero son reventadas por una detonación de C4. De la humareda surge 'El Friki Hacker' escoltado por colosos del Clan Andore y punks armados con cadenas.",
      dialogue: [
        {
          speaker: "FRIKI HACKER",
          text: "¡JAJAJAJA! ¡Demasiado tarde, Basados! ¡Esa PC 'Baby' es el hardware que necesitaba para hackear toda Eurasia! ¡Agárrenla y destrocen el lugar!",
          balloonType: "shout",
          avatar: "hacker"
        },
        {
          speaker: "ANDORE",
          text: "¡UOOOOH! ¡Cargando la máquina! ¡Abran paso si no quieren que los aplaste contra el suelo!",
          balloonType: "shout",
          avatar: "hacker"
        }
      ],
      sfx: "¡¡¡BOOOOM!!! ¡¡CRASH!!"
    },
    {
      id: 3,
      title: "CAPÍTULO 3: ¡SE LLEVAN A LA BABY!",
      subtitle: "Escapes hacia los túneles del metro",
      sceneType: "escape",
      narration: "Los ciber-sicarios desconectan los tubos de enfriamiento, cargan el pesado gabinete de 'La Baby' y huyen a toda velocidad adentrándose en los andenes subterráneos y callejones de Hong Kong.",
      dialogue: [
        {
          speaker: "MAKI",
          text: "¡Se están escapando por las vías del metro subterráneo! ¡Huyen hacia los muelles de carga y el mercado negro internacional!",
          balloonType: "shout",
          avatar: "maki"
        },
        {
          speaker: "CARLOS",
          text: "¡Dejaron un rastro de refrigerante derramado en los rieles! ¡Si nos damos prisa, los acorralamos antes del amanecer!",
          balloonType: "speech",
          avatar: "carlos"
        }
      ],
      sfx: "¡CHIIIIRR! [TREN DE METRO FRENANDO]"
    },
    {
      id: 4,
      title: "CAPÍTULO 4: ¡VENGANZA BASADA!",
      subtitle: "La furia de VAZE y los puños de hierro",
      sceneType: "vow",
      narration: "VAZE se ajusta la visera de la gorra hacia atrás con furia implacable, aprieta los guantes de combate rojos, se abotona la gabardina carmesí y sus puños se encienden con el fuego de la Neo-Furia.",
      dialogue: [
        {
          speaker: "VAZE",
          text: "¡Nadie... pero NADIE... le pone una mano encima a mi Baby! ¡Se metieron con los basados equivocados! ¡Vamos a barrer cada callejón, estación y ring clandestino hasta recuperarla!",
          balloonType: "shout",
          avatar: "vaze"
        },
        {
          speaker: "LOS BASADOS",
          text: "¡A LA CARGA! ¡POR LA BABY Y POR EL HONOR BASADO!",
          balloonType: "shout",
          avatar: "vaze"
        }
      ],
      sfx: "¡¡¡FURIA BASADA ACTIVADA!!!"
    }
  ],

  villains: [
    {
      name: "Retu",
      role: "Líder Supremo de Mad Gear (Japón)",
      desc: "Maestro despiadado con patadas giratorias aéreas en el dojo ancestral. Secuestró a Genryusai y a Rena."
    },
    {
      name: "Won Won",
      role: "Ex-Cocinero y Carnicero de Hong Kong",
      desc: "Gigante ágil que blande un enorme machete de carnicero en los muelles y restaurantes de Hong Kong."
    },
    {
      name: "Freddie",
      role: "Comandante Ex-Marine (París)",
      desc: "Especialista táctico militar con embestidas corporales imparables en las obras y túneles de Francia."
    },
    {
      name: "Clan Andore (Jr, Estándar, Gran Andore)",
      role: "Familia de Gigantes de Lucha Libre",
      desc: "Colosos de más de 2 metros con mallas de leopardo que ejecutan embestidas frontales, agarres y aplastamientos brutales."
    },
    {
      name: "Punks Schot & Jack",
      role: "Infantería y Sicarios Callejeros",
      desc: "Tropas de choque ágiles con chalecos de cuero y crestas punk que rodean al jugador por el eje Z intentando atraparlo en pinza."
    }
  ]
};
