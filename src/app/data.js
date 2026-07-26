import { state } from '../lib/state.js';

const appState = state({
  view: '',
  viewData: {},
});

function setView(view, viewData = {}) {
  // TODO: should have a way of batching state updates so the order here
  //       doesnt matter in any real sense
  appState.set('viewData', viewData);
  appState.set('view', view);
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
