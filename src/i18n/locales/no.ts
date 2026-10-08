export default {
  app: {
    title: 'PLC Trendvisualiser',
    subtitle: 'Sanntids variabelovervåking',
  },
  sidebar: {
    title: 'Variabler',
    searchPlaceholder: 'Søk variabler...',
    noVariables: 'Ingen variabler funnet',
    selectedCount: '{count} valgt',
    maxSelection: 'Maksimalt {max} variabler',
  },
  chart: {
    emptyState: {
      title: 'Velg variabler fra sidepanelet for å vise trender',
      subtitle: 'Opptil 4 variabler kan overvåkes samtidig',
    },
    legend: {
      remove: 'Fjern fra diagram',
      noSelection: 'Ingen variabler valgt',
    },
    time: {
      now: 'nå',
      secondsAgo: '-{seconds}s',
    },
  },
  variable: {
    types: {
      BOOL: 'Boolsk',
      INT: 'Heltall',
      REAL: 'Desimaltall',
    },
    status: {
      connected: 'Tilkoblet',
      disconnected: 'Frakoblet',
      error: 'Feil',
    },
  },
  devtools: {
    title: 'Utviklerverktøy',
    fps: 'FPS',
    fpsWarning: 'Ytelsesadvarsel',
    fpsGood: 'God ytelse',
    activityLog: 'Aktivitetslogg',
    export: 'Eksporter',
    clear: 'Tøm',
    devModeNotice: 'Dette panelet er kun synlig i utviklingsmodus',
    events: {
      simulation_started: 'Simulering startet',
      simulation_stopped: 'Simulering stoppet',
      variable_selected: 'Variabel valgt',
      variable_deselected: 'Variabel avvalgt',
      fps_warning: 'FPS falt under terskel',
      fps_recovered: 'FPS gjenopprettet',
    },
  },
  common: {
    loading: 'Laster...',
    error: 'En feil oppstod',
    retry: 'Prøv igjen',
    close: 'Lukk',
    cancel: 'Avbryt',
    confirm: 'Bekreft',
    save: 'Lagre',
    delete: 'Slett',
    edit: 'Rediger',
  },
  header: {
    menu: 'Meny',
    frequency: {
      label: 'Oppdateringsfrekvens',
      hz: '{value} Hz',
    },
    status: {
      running: 'Kjører',
      paused: 'Pauset',
    },
    language: 'Språk',
  },
  loadOverlay: {
    fps: 'FPS',
    data: 'Data',
    frequency: 'Frekvens',
    streaming: 'Strømmer',
    stopped: 'Stoppet',
  },
  variableList: {
    title: 'PLC-variabler',
    selected: '{count}/4 valgt',
    noVariables: 'Ingen variabler tilgjengelig',
    hint: 'Klikk en variabel for å legge den til i diagrammet',
  },
} as const
