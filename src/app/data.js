import { state } from '../lib/state.js';

const appState = state({
  view: '',
  viewData: {},
});

function setView(view, viewData = {}) {
  appState.set('view', view);
  appState.set('viewData', viewData);
}

// basic saving to local storage
const hoursDataPersistanceKey = 'com.ryanberliner.time-log[hoursData]';
const savedInitialHoursData = window.localStorage.getItem(hoursDataPersistanceKey);

const initialHoursData = savedInitialHoursData ? JSON.parse(savedInitialHoursData) : {
  'hoursIndex': {},
  'hours': {},
};

const hoursData = state(initialHoursData, s => {
  window.localStorage.setItem(hoursDataPersistanceKey, JSON.stringify(s));
});

export { appState, hoursData, setView };
