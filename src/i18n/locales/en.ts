export default {
  app: {
    title: 'PLC Trend Visualizer',
    subtitle: 'Real-time variable monitoring',
  },
  sidebar: {
    title: 'Variables',
    searchPlaceholder: 'Search variables...',
    noVariables: 'No variables found',
    selectedCount: '{count} selected',
    maxSelection: 'Maximum {max} variables',
  },
  chart: {
    emptyState: {
      title: 'Select variables from the sidebar to display trends',
      subtitle: 'Up to 4 variables can be monitored simultaneously',
    },
    legend: {
      remove: 'Remove from chart',
      noSelection: 'No variables selected',
    },
    time: {
      now: 'now',
      secondsAgo: '-{seconds}s',
    },
  },
  variable: {
    types: {
      BOOL: 'Boolean',
      INT: 'Integer',
      REAL: 'Real',
    },
    status: {
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error',
    },
  },
  devtools: {
    title: 'DevTools',
    fps: 'FPS',
    fpsWarning: 'Performance warning',
    fpsGood: 'Good performance',
    activityLog: 'Activity Log',
    export: 'Export',
    clear: 'Clear',
    devModeNotice: 'This panel is only visible in development mode',
    events: {
      simulation_started: 'Simulation started',
      simulation_stopped: 'Simulation stopped',
      variable_selected: 'Variable selected',
      variable_deselected: 'Variable deselected',
      fps_warning: 'FPS dropped below threshold',
      fps_recovered: 'FPS recovered',
    },
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
  },
  header: {
    menu: 'Menu',
    frequency: {
      label: 'Update Rate',
      hz: '{value} Hz',
    },
    status: {
      running: 'Running',
      paused: 'Paused',
    },
    language: 'Language',
  },
  loadOverlay: {
    fps: 'FPS',
    data: 'Data',
    frequency: 'Frequency',
    streaming: 'Streaming',
    stopped: 'Stopped',
  },
  variableList: {
    title: 'PLC Variables',
    selected: '{count}/4 selected',
    noVariables: 'No variables available',
    hint: 'Click a variable to add it to the chart',
  },
} as const
