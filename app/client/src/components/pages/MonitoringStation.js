import Basemap from '@arcgis/core/Basemap';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Viewpoint from '@arcgis/core/Viewpoint';
import Papa from 'papaparse';
import WindowSize from '@reach/window-size';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { css } from 'styled-components/macro';
// components
import { AccordionList, AccordionItem } from 'components/shared/Accordion';
import DateSlider from 'components/shared/DateSlider';
import MapErrorBoundary from 'components/shared/ErrorBoundary.MapErrorBoundary';
import { GlossaryTerm } from 'components/shared/GlossaryPanel';
import LineChart from 'components/shared/LineChart';
import LoadingSpinner from 'components/shared/LoadingSpinner';
import Map from 'components/shared/Map';
import MapLoadingSpinner from 'components/shared/MapLoadingSpinner';
import MapVisibilityButton from 'components/shared/MapVisibilityButton';
import { errorBoxStyles, infoBoxStyles } from 'components/shared/MessageBoxes';
import NavBar from 'components/shared/NavBar';
import Page from 'components/shared/Page';
import ReactTable from 'components/shared/ReactTable';
import {
  splitLayoutContainerStyles,
  splitLayoutColumnsStyles,
  splitLayoutColumnStyles,
} from 'components/shared/SplitLayout';
// config
import { characteristicGroupMappings } from 'config/characteristicGroupMappings';
import { characteristicsByType } from 'config/characteristicsByType';
import { monitoringError } from 'config/errorMessages';
// contexts
import { FullscreenContext, FullscreenProvider } from 'contexts/Fullscreen';
import { LocationSearchContext } from 'contexts/locationSearch';
import { useServicesContext } from 'contexts/LookupFiles';
import { MapHighlightProvider } from 'contexts/MapHighlight';
// helpers
import { fetchCheck } from 'utils/fetchUtils';
import { useSharedLayers } from 'utils/hooks';
import { getPopupContent, getPopupTitle } from 'utils/mapFunctions';
import { titleCaseWithExceptions } from 'utils/utils';
// styles
import { boxStyles, boxHeadingStyles } from 'components/shared/Box';
import { colors, disclaimerStyles } from 'styles';

/*
 * Styles
 */

const accordionFlexStyles = css`
  display: flex;
  justify-content: space-between;
`;

const accordionHeadingStyles = css`
  ${accordionFlexStyles}
  font-size: 0.875rem;
  margin-top: 0 !important;
  padding: 0.75em 1em !important;
`;

const accordionRowStyles = css`
  ${accordionFlexStyles}
  ${accordionHeadingStyles}
  border-top: 1px solid #d8dfe2;
`;

const accordionStyles = css`
  margin-bottom: 1.25rem;
  width: 100%;

  .accordion-list > p {
    margin-top: 0;
    padding-bottom: 0.625em;
    text-align: left;
  }

  .charc-name {
    margin-left: 2em;
    margin-right: 2.5em;
  }

  .charc-type {
    margin-left: 1em;
    margin-right: 1.25em;
  }

  .checkbox-label {
    display: flex;
  }

  .total-row {
    margin-right: 1.75em;
  }

  input[type='checkbox'] {
    margin-right: 1em;
    position: relative;
    top: 0.15em;
    transform: scale(1.2);
  }
`;

const boxSectionStyles = css`
  padding: 0.4375rem 0.875rem;
`;

const charcsTableStyles = css`
  ${boxSectionStyles}
  height: 50vh;
  overflow-y: scroll;
  .rt-table .rt-td {
    margin: auto;
  }
`;

const containerStyles = css`
  ${splitLayoutContainerStyles};
  max-width: 1800px;

  th,
  td {
    font-size: 0.875rem;
    line-height: 1.25;

    &:last-child {
      text-align: right;
    }
  }

  hr {
    margin-top: 0.125rem;
    margin-bottom: 0.875rem;
    border-top-color: #aebac3;
  }
`;

const downloadLinksStyles = css`
  span {
    display: inline-block;
    margin-bottom: 0.25em;
  }

  div {
    display: inline-block;
    vertical-align: top;
    width: 50%;

    &:first-child {
      padding-left: 1rem;
      text-align: start;
    }
    &:last-child {
      font-weight: bold;
      padding-right: 1rem;
      text-align: end;
    }
  }
`;

const flexboxSectionStyles = css`
  ${boxSectionStyles}
  display: flex;
`;

const iconStyles = css`
  margin-right: 5px;
`;

const infoBoxHeadingStyles = css`
  ${boxHeadingStyles};
  display: flex;
  align-items: flex-start;

  small {
    display: block;
    margin-top: 0.125rem;
  }

  /* loading icon */
  svg {
    margin: 0 -0.375rem 0 -0.875rem;
    height: 1.5rem;
  }
`;

const inlineBoxSectionStyles = css`
  padding: 0.4375rem 0.875rem;

  /* loading icon */
  svg {
    display: inline-block;
    margin: -0.5rem;
    height: 1.25rem;
  }

  h3,
  p {
    display: inline-block;
    margin-top: 0;
    margin-bottom: 0;
    line-height: 1.25;
  }
`;

const leftColumnStyles = css`
  ${splitLayoutColumnStyles}

  @media (min-width: 960px) {
    max-width: 582px;
  }
`;

const mapContainerStyles = css`
  display: flex;
  height: 100%;
  position: relative;
`;

const modifiedDisclaimerStyles = css`
  ${disclaimerStyles};

  padding-bottom: 0;
`;

const modifiedErrorBoxStyles = css`
  ${errorBoxStyles};
  text-align: center;
`;

const modifiedInfoBoxStyles = css`
  ${infoBoxStyles};
  text-align: center;
  margin: 1rem auto;
  padding: 0.7rem 1rem !important;
  width: max-content;
`;

const modifiedSplitLayoutColumnsStyles = css`
  ${splitLayoutColumnsStyles};

  @media (min-width: 960px) {
    flex-flow: row nowrap;
  }
`;

const rightColumnStyles = css`
  ${splitLayoutColumnStyles}

  @media (min-width: 960px) {
    flex-grow: 3;
    width: auto;
  }
`;

const sliderContainerStyles = css`
  align-items: flex-end;
  display: flex;
  justify-content: center;
  width: 100%;
  span {
    margin-bottom: 0.1em;
    &:first-of-type {
      margin-left: 1em;
    }
    &:last-of-type {
      margin-right: 1em;
    }
  }
`;

const pageErrorBoxStyles = css`
  ${errorBoxStyles};
  margin: 1rem;
  text-align: center;
`;

const radioStyles = css`
  display: flex;
  height: 100%;
  width: 100%;
  input {
    appearance: none;
    margin: 0;
  }
  input:checked + label:before {
    background-color: #38a6ee;
    box-shadow: 0 0 0 1px ${colors.steel()}, inset 0 0 0 1px ${colors.white()};
  }
  label {
    cursor: pointer;
    font-size: 0.875em;
    margin: auto;
    padding-left: 1em;
    text-indent: -1em;
    &:before {
      background: ${colors.white()};
      border-radius: 100%;
      box-shadow: 0 0 0 1px ${colors.steel()};
      content: ' ';
      display: inline-block;
      height: 1em;
      line-height: 1.25em;
      margin-right: 1em;
      position: relative;
      text-indent: 0;
      top: -1px;
      vertical-align: middle;
      white-space: pre;
      width: 1em;
    }
  }
`;

/*
 * Helpers
 */

function buildDateFilter(range, minYear, maxYear) {
  if (!range) return;
  let filter = '';
  if (range[0] !== minYear) {
    filter += `&startDateLo=01-01-${range[0]}`;
  }
  if (range[1] !== maxYear) {
    filter += `&startDateHi=12-31-${range[1]}`;
  }
  return filter;
}

function buildCharcsFilter(checkboxes) {
  let filter = '';
  if (checkboxes.all === 1 || checkboxes.all === 0) return filter;
  Object.values(checkboxes.types).forEach((type) => {
    if (type.selected === 1) {
      filter += `&characteristicType=${type.id}`;
    } else if (type.selected === 2) {
      type.charcs.forEach((charcId) => {
        const charc = checkboxes.charcs[charcId];
        if (charc.selected === 1) {
          filter += `&characteristicName=${charc.id}`;
        }
      });
    }
  });
  return filter;
}

function checkboxReducer(state, action) {
  switch (action.type) {
    case 'all': {
      return toggleAll(state);
    }
    case 'load': {
      const { data } = action.payload;
      return loadNewData(data, state);
    }
    case 'group': {
      const { id } = action.payload;
      const entity = state.groups[id];
      return toggle(state, id, entity, action.type);
    }
    case 'type': {
      const { id } = action.payload;
      const entity = state.types[id];
      return toggle(state, id, entity, action.type);
    }
    case 'characteristic': {
      const { id } = action.payload;
      const entity = state.charcs[id];
      return toggle(state, id, entity, action.type);
    }
    default:
      throw new Error('Invalid action type');
  }
}

async function fetchStationDetails(url, setData, setStatus) {
  const res = await fetchCheck(url);
  if (res.features.length < 1) {
    setStatus('success');
    setData({});
    return;
  }
  const feature = res.features[0];
  const stationDetails = {
    county: feature.properties.CountyName,
    charcTypeCounts: feature.properties.characteristicGroupResultCount,
    charcGroups: groupTypes(
      feature.properties.characteristicGroupResultCount,
      characteristicGroupMappings,
    ),
    huc8: feature.properties.HUCEightDigitCode,
    locationLongitude: feature.geometry.coordinates[0],
    locationLatitude: feature.geometry.coordinates[1],
    locationName: feature.properties.MonitoringLocationName,
    locationType: feature.properties.MonitoringLocationTypeName,
    monitoringType: 'Past Water Conditions',
    orgId: feature.properties.OrganizationIdentifier,
    orgName: feature.properties.OrganizationFormalName,
    siteId: feature.properties.MonitoringLocationIdentifier,
    providerName: feature.properties.ProviderName,
    state: feature.properties.StateName,
    totalSamples: parseInt(feature.properties.activityCount),
    totalMeasurements: parseInt(feature.properties.resultCount),
    uniqueId:
      `${feature.properties.MonitoringLocationIdentifier}/` +
      `${feature.properties.ProviderName}/` +
      `${feature.properties.OrganizationIdentifier}`,
  };
  stationDetails.charcGroupCounts = parseGroupCounts(
    stationDetails.charcTypeCounts,
    stationDetails.charcGroups,
    characteristicGroupMappings,
  );
  setData(stationDetails);
  setStatus('success');
}

async function drawStation(station, layer) {
  if (isEmpty(station)) return false;
  const newFeature = new Graphic({
    geometry: {
      type: 'point',
      latitude: station.locationLatitude,
      longitude: station.locationLongitude,
    },
    attributes: {
      ...station,
      locationUrl: window.location.href,
      stationProviderName: station.providerName,
      stationTotalSamples: station.totalSamples,
      stationTotalMeasurements: station.totalMeasurements,
      stationTotalsByCategory: JSON.stringify(station.charcTypeCounts),
    },
  });
  const featureSet = await layer.queryFeatures();
  const editResults = await layer.applyEdits({
    deleteFeatures: featureSet.features,
    addFeatures: [newFeature],
  });
  return editResults?.addFeatureResults?.length ? true : false;
}

function fetchParseCsv(url) {
  return new Promise((complete, error) => {
    Papa.parse(url, {
      complete,
      download: true,
      dynamicTyping: true,
      error,
      header: true,
      worker: true,
    });
  });
}

function getCharcGroup(charcType, groupMappings) {
  for (let mapping of groupMappings) {
    if (mapping.groupNames.includes(charcType)) return mapping.label;
  }
  return 'Other';
}

function getCharcType(charcName, typeMappings) {
  for (let mapping of Object.keys(typeMappings)) {
    if (typeMappings[mapping].includes(charcName)) return mapping;
  }
  return 'Not Assigned';
}

function getFilteredCount(range, records, count) {
  if (range) {
    let filteredCount = 0;
    records.forEach((record) => {
      if (record.year >= range[0] && record.year <= range[1]) {
        filteredCount += 1;
      }
    });
    return filteredCount;
  }
  return count;
}

function getMean(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  return mean.toFixed(3);
}

function getMedian(values) {
  const sorted = [...values].sort();
  const numValues = values.length;
  let median = 0;
  if (numValues % 2 === 0) {
    median = (sorted[numValues / 2 - 1] + sorted[numValues / 2]) / 2;
  } else {
    median = sorted[(numValues - 1) / 2];
  }
  return median.toFixed(3);
}

function getStdDev(values, mean = null) {
  const sampleMean = mean ?? getMean(values);
  const tss = values.reduce((a, b) => a + (b - sampleMean) ** 2, 0);
  const variance = tss / (values.length - 1);
  const stdDev = Math.sqrt(variance);
  return stdDev.toFixed(3);
}

function getTotalCount(charcs) {
  let totalCount = 0;
  Object.values(charcs).forEach((charc) => {
    if (charc.selected) totalCount += charc.count;
  });
  return totalCount;
}

async function getZoomParams(layer) {
  const featureSet = await layer.queryFeatures();
  const graphics = featureSet.features;
  if (graphics.length === 1 && graphics[0].geometry.type === 'point') {
    // handle zooming to a single point graphic
    const zoomParams = {
      target: graphics[0],
      zoom: 16, // set zoom 1 higher since it gets decremented later
    };
    return zoomParams;
  }
}

function groupTypes(charcTypes, mappings) {
  const groups = {};
  mappings
    .filter((mapping) => mapping.label !== 'All')
    .forEach((mapping) => {
      for (const charcType in charcTypes) {
        if (mapping.groupNames.includes(charcType)) {
          if (!groups[mapping.label]) groups[mapping.label] = [];
          groups[mapping.label].push(charcType);
        }
      }
    });

  // add any leftover lower-tier group counts to the 'Other' category
  const typesGrouped = Object.values(groups).reduce((a, b) => {
    a.push(...b);
    return a;
  }, []);
  for (const charcType in charcTypes) {
    if (!typesGrouped.includes(charcType)) {
      if (!groups['Other']) groups['Other'] = [];
      groups['Other'].push(charcType);
    }
  }
  return groups;
}

const initialCheckboxes = {
  all: 0,
  groups: {},
  types: {},
  charcs: {},
};

function isEmpty(obj) {
  for (var _x in obj) {
    return false;
  }
  return true;
}

const lineColors = {
  Bacterial: '#03a66a',
  Metals: '#526571',
  Nutrients: '#00de04',
  Other: '#38a6ee',
  Pesticides: '#400587',
  PFAS: '#eb4034',
  Physical: '#ad9e71',
  Sediments: '#9c7803',
};

function loadNewData(data, state) {
  const newCharcs = {};
  const newGroups = {};
  const newTypes = {};

  const { charcs, groups, types } = data;

  // loop once to build the new data structure
  Object.values(charcs).forEach((charc) => {
    newCharcs[charc.id] = {
      ...charc,
      selected: state.charcs[charc.id]?.selected ?? 1,
    };
  });
  Object.values(types).forEach((type) => {
    newTypes[type.id] = {
      ...type,
      charcs: Array.from(type.charcs),
      selected: 0,
    };
  });
  Object.values(groups).forEach((group) => {
    newGroups[group.id] = {
      ...group,
      selected: 0,
      types: Array.from(group.types),
    };
  });

  const allSelected = updateSelected(newCharcs, newTypes, newGroups);

  return {
    all: allSelected,
    charcs: newCharcs,
    groups: newGroups,
    types: newTypes,
  };
}

function parseGroupCounts(typeCounts, charcGroups, mappings) {
  const groupCounts = {};
  mappings
    .filter((mapping) => mapping.label !== 'All')
    .forEach((mapping) => (groupCounts[mapping.label] = 0));
  Object.entries(charcGroups).forEach(([charcGroup, charcTypes]) => {
    charcTypes.forEach(
      (charcType) => (groupCounts[charcGroup] += typeCounts[charcType]),
    );
  });

  return groupCounts;
}

function parseCharcs(charcs, range) {
  const result = {
    groups: {},
    types: {},
    charcs: {},
  };
  // structure characteristcs by group, then type
  Object.entries(charcs).forEach(([charc, data]) => {
    const { group, type, count, records } = data;

    let newCount = getFilteredCount(range, records, count);

    if (newCount > 0) {
      if (!result.groups[group]) {
        result.groups[group] = {
          count: 0,
          id: group,
          types: new Set(),
        };
      }
      if (!result.types[type]) {
        result.types[type] = {
          charcs: new Set(),
          count: 0,
          group,
          id: type,
        };
      }
      result.charcs[charc] = {
        count: newCount,
        group,
        id: charc,
        type,
      };

      result.groups[group].count += newCount;
      result.types[type].count += newCount;
      result.groups[group].types.add(type);
      result.types[type].charcs.add(charc);
    }
  });
  return result;
}

const sectionRow = (label, value, style, dataStatus) => (
  <div css={style}>
    <h3>{label}:</h3>
    {dataStatus === 'fetching' && <LoadingSpinner />}
    {dataStatus === 'failure' && (
      <div css={modifiedErrorBoxStyles}>
        <p>{monitoringError}</p>
      </div>
    )}
    {dataStatus === 'success' && <p>&nbsp; {value}</p>}
  </div>
);

const sectionRowInline = (label, value, dataStatus = 'success') => {
  return sectionRow(label, value, inlineBoxSectionStyles, dataStatus);
};

function toggle(state, id, entity, level) {
  const newSelected = entity.selected === 0 ? 1 : 0;

  const newCharcs = { ...state.charcs };
  const newTypes = { ...state.types };
  const newGroups = { ...state.groups };

  switch (level) {
    case 'characteristic': {
      updateEntity(newCharcs, id, entity, newSelected);
      const charcIds = newTypes[entity.type].charcs;
      updateParent(newTypes, newCharcs, entity.type, charcIds);
      const typeIds = newGroups[entity.group].types;
      updateParent(newGroups, newTypes, entity.group, typeIds);
      break;
    }
    case 'group': {
      const ref = 'group';
      updateEntity(newGroups, id, entity, newSelected);
      updateDescendants(newTypes, ref, id, newSelected);
      updateDescendants(newCharcs, ref, id, newSelected);
      break;
    }
    case 'type': {
      const ref = 'type';
      updateEntity(newTypes, id, entity, newSelected);
      updateDescendants(newCharcs, ref, id, newSelected);
      const typeIds = newGroups[entity.group].types;
      updateParent(newGroups, newTypes, entity.group, typeIds);
      break;
    }
    default:
      throw new Error('Invalid action type');
  }

  const groupIds = Object.keys(newGroups);
  let groupsSelected = 0;
  groupIds.forEach((groupId) => {
    groupsSelected += newGroups[groupId].selected;
  });
  const allSelected =
    groupsSelected === 0 ? 0 : groupsSelected === groupIds.length ? 1 : 2;

  return {
    all: allSelected,
    charcs: newCharcs,
    groups: newGroups,
    types: newTypes,
  };
}

function toggleAll(state) {
  const newSelected = state.all === 0 ? 1 : 0;
  const newCharcs = {};
  Object.values(state.charcs).forEach((charc) => {
    newCharcs[charc.id] = {
      ...charc,
      selected: newSelected,
    };
  });
  const newGroups = {};
  Object.values(state.groups).forEach((group) => {
    newGroups[group.id] = {
      ...group,
      selected: newSelected,
    };
  });
  const newTypes = {};
  Object.values(state.types).forEach((type) => {
    newTypes[type.id] = {
      ...type,
      selected: newSelected,
    };
  });
  return {
    all: newSelected,
    charcs: newCharcs,
    groups: newGroups,
    types: newTypes,
  };
}

function updateEntity(obj, id, entity, selected) {
  obj[id] = {
    ...entity,
    selected,
  };
}

function updateDescendants(obj, ref, id, selected) {
  Object.values(obj).forEach((entity) => {
    if (entity[ref] === id) {
      obj[entity.id] = {
        ...entity,
        selected,
      };
    }
  });
}

function updateParent(parentObj, childObj, parentId, childIds) {
  let childrenSelected = 0;
  childIds.forEach((childId) => {
    childrenSelected += childObj[childId].selected;
  });
  const parentSelected =
    childrenSelected === 0 ? 0 : childrenSelected === childIds.length ? 1 : 2;
  parentObj[parentId] = {
    ...parentObj[parentId],
    selected: parentSelected,
  };
}

function updateSelected(charcs, types, groups) {
  let groupsSelected = 0;

  // loop over again to get checkbox values
  Object.values(charcs).forEach((charc) => {
    types[charc.type].selected += charc.selected;
  });
  Object.values(types).forEach((type) => {
    type.selected =
      type.selected === 0 ? 0 : type.selected === type.charcs.length ? 1 : 2;
    groups[type.group].selected += type.selected;
  });
  Object.values(groups).forEach((group) => {
    group.selected =
      group.selected === 0 ? 0 : group.selected === group.types.length ? 1 : 2;
    groupsSelected += group.selected;
  });

  const allSelected =
    groupsSelected === 0
      ? 0
      : groupsSelected === Object.keys(groups).length
      ? 1
      : 2;

  return allSelected;
}

function useCharacteristics(provider, orgId, siteId) {
  const services = useServicesContext();

  // charcs => characteristics
  const [charcs, setCharcs] = useState({});
  const [status, setStatus] = useState('idle');

  const structureRecords = useCallback(
    (records) => {
      const recordsByCharc = {};
      records.forEach((record) => {
        if (!recordsByCharc[record.CharacteristicName]) {
          const charcType = getCharcType(
            record.CharacteristicName,
            characteristicsByType,
          );
          recordsByCharc[record.CharacteristicName] = {
            name: record.CharacteristicName,
            group: getCharcGroup(charcType, characteristicGroupMappings),
            records: [],
            type: charcType,
            count: 0,
          };
        }
        const curCharc = recordsByCharc[record.CharacteristicName];
        curCharc.count += 1;
        const recordDate = record.ActivityStartDate.split('-');
        curCharc.records.push({
          year: parseInt(recordDate[0]),
          month: parseInt(recordDate[1]),
          day: parseInt(recordDate[2]),
          measurement: record.ResultMeasureValue ?? null,
          unit: record['ResultMeasure/MeasureUnitCode'] || null,
        });
      });
      setCharcs(recordsByCharc);
      setStatus('success');
    },
    [setCharcs, setStatus],
  );

  useEffect(() => {
    if (status !== 'idle' || services.status !== 'success') return;
    setStatus('fetching');
    const url =
      `${services.data.waterQualityPortal.resultSearch}` +
      `&mimeType=csv&zip=no&dataProfile=narrowResult` +
      `&providers=${provider}&organization=${orgId}&siteid=${siteId}`;
    try {
      fetchParseCsv(url).then((results) => structureRecords(results.data));
    } catch (err) {
      setStatus('failure');
      console.error('Papa Parse error');
    }
  }, [orgId, provider, services, siteId, status, structureRecords]);

  return [charcs, status];
}

function useStationDetails(provider, orgId, siteId) {
  const services = useServicesContext();

  const [station, setStation] = useState({});
  const [stationStatus, setStationStatus] = useState('fetching');

  useEffect(() => {
    const url =
      `${services.data.waterQualityPortal.monitoringLocation}` +
      `search?mimeType=geojson&zip=no&provider=${provider}&organization=${orgId}&siteid=${siteId}`;

    fetchStationDetails(url, setStation, setStationStatus).catch((err) => {
      console.error(err);
      setStationStatus('failure');
      setStation({});
    });
  }, [provider, services, setStation, setStationStatus, orgId, siteId]);

  return [station, stationStatus];
}

/*
 * Components
 */

function CharacteristicChart({
  charcGroup,
  charcName,
  charcsStatus,
  records = [],
}) {
  const [measurements, setMeasurements] = useState(null);
  const [unit, setUnit] = useState(null);
  useEffect(() => {
    if (!records.length) return;
    const newMeasurements = {};
    records.forEach((record) => {
      if (!record.measurement || !record.unit) return;

      if (!newMeasurements[record.unit]) newMeasurements[record.unit] = {};
      const unitMeasurements = newMeasurements[record.unit];

      // group by unit and date
      const date =
        `${record.year}` +
        `-${record.month < 10 ? `0${record.month}` : record.month}` +
        `-${record.day < 10 ? `0${record.day}` : record.day}`;
      if (!unitMeasurements[date]) {
        unitMeasurements[date] = {
          ...record,
          measurement: [record.measurement],
          date,
        };
      } else {
        unitMeasurements[date].measurement.push(record.measurement);
      }
    });

    // store in arrays by unit and sort by date
    const sortedMeasurements = {};
    Object.entries(newMeasurements).forEach(([unitKey, unitMeasurements]) => {
      Object.values(unitMeasurements).forEach((date) => {
        date.measurement = parseFloat(
          (
            date.measurement.reduce((a, b) => a + b) / date.measurement.length
          ).toFixed(3),
        );
      });
      sortedMeasurements[unitKey] = Object.values(unitMeasurements)
        .sort((a, b) => a.day - b.day)
        .sort((a, b) => a.month - b.month)
        .sort((a, b) => a.year - b.year);
    });
    setMeasurements(sortedMeasurements);

    // initialize selected unit
    const units = Object.keys(sortedMeasurements);
    if (units.length) setUnit(units[0]);
  }, [records]);

  const [chartData, setChartData] = useState(null);
  const [domain, setDomain] = useState(null);
  const [range, setRange] = useState(null);
  const [mean, setMean] = useState(null);
  const [median, setMedian] = useState(null);
  const [stdDev, setStdDev] = useState(null);
  const getNewChartData = useCallback((domain, msmts) => {
    let newChartData = [];
    msmts.forEach((msmt) => {
      if (msmt.year >= domain[0] && msmt.year <= domain[1]) {
        newChartData.push({ x: msmt.date, y: msmt.measurement });
      }
    });
    setChartData(newChartData);
    // data is already sorted by date
    setDomain([newChartData[0].x, newChartData[newChartData.length - 1].x]);
    const yValues = newChartData.map((datum) => datum.y);
    setRange([Math.min(...yValues), Math.max(...yValues)]);
    const newMean = getMean(yValues);
    setMean(newMean);
    setMedian(getMedian(yValues));
    setStdDev(getStdDev(yValues, newMean));
  }, []);

  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(null);
  useEffect(() => {
    if (!measurements || !unit) return;
    const unitMeasurements = measurements[unit];
    const yearLow = unitMeasurements[0].year;
    const yearHigh = unitMeasurements[unitMeasurements.length - 1].year;
    setMinYear(yearLow);
    setMaxYear(yearHigh);
    getNewChartData([yearLow, yearHigh], unitMeasurements);
  }, [charcsStatus, getNewChartData, measurements, unit]);

  const chartRef = useRef(null);

  return (
    <div css={boxStyles}>
      <h2 css={infoBoxHeadingStyles}>
        Chart of Results for{' '}
        {!charcName || charcName === 'None'
          ? 'Selected Characteristic'
          : titleCaseWithExceptions(charcName)}
        {unit && ` (${unit})`}
      </h2>
      {charcsStatus === 'fetching' ? (
        <LoadingSpinner />
      ) : !charcName ? (
        <p css={modifiedInfoBoxStyles}>
          No data available for this monitoring location.
        </p>
      ) : charcName === 'None' ? (
        <p css={modifiedInfoBoxStyles}>
          Select a characteristic from the table above to graph its results.
        </p>
      ) : (
        <>
          <div css={sliderContainerStyles}>
            {!minYear || !maxYear ? (
              <LoadingSpinner />
            ) : (
              <DateSlider
                disabled={!Boolean(records.length)}
                min={minYear}
                max={maxYear}
                onChange={(newDomain) =>
                  getNewChartData(newDomain, measurements[unit])
                }
              />
            )}
          </div>
          <div ref={chartRef}>
            {!chartData || !range ? (
              <LoadingSpinner />
            ) : (
              <LineChart
                color={lineColors[charcGroup]}
                containerRef={chartRef.current}
                data={chartData}
                dataKey={charcName}
                range={range}
                yUnit={unit}
              />
            )}
          </div>
          <div css={boxSectionStyles}>
            {mean && sectionRowInline('Average of Values', `${mean} ${unit}`)}
            {median && sectionRowInline('Median Value', `${median} ${unit}`)}
            {domain &&
              sectionRowInline(
                'Selected Date Range',
                `${new Date(domain[0]).toDateString()} - ` +
                  `${new Date(domain[1]).toDateString()}`,
              )}
            {stdDev &&
              sectionRowInline('Standard Deviation', `${stdDev} ${unit}`)}
          </div>
        </>
      )}
    </div>
  );
}

function CharacteristicsTable({ charcs, charcsStatus, selected, setSelected }) {
  const tableData = useMemo(() => {
    return Object.values(charcs)
      .map((charc) => {
        const selector = (
          <div css={radioStyles}>
            <input
              checked={selected === charc.name}
              id={charc.name}
              onChange={(e) => setSelected(e.target.value)}
              type="radio"
              value={charc.name}
            />
            <label htmlFor={charc.name}></label>
          </div>
        );
        const measurementCount = charc.records.reduce((a, b) => {
          if (b.measurement) return a + 1;
          return a;
        }, 0);
        return {
          group: charc.group,
          measurementCount,
          name: charc.name,
          resultCount: charc.count,
          select: selector,
          type: charc.type,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [charcs, selected, setSelected]);

  return (
    <div css={boxStyles}>
      <h2 css={infoBoxHeadingStyles}>Characteristics</h2>
      <div css={charcsTableStyles}>
        {charcsStatus === 'fetching' && <LoadingSpinner />}
        {charcsStatus === 'success' &&
          (isEmpty(charcs) ? (
            <p css={modifiedInfoBoxStyles}>
              No records found for this location.
            </p>
          ) : (
            <>
              {sectionRowInline(
                'Selected Characteristic',
                selected,
                charcsStatus,
              )}
              <ReactTable
                data={tableData}
                placeholder="Filter..."
                striped={false}
                getColumns={(tableWidth) => {
                  const columnWidth = 2 * (tableWidth / 7) - 6;
                  const halfColumnWidth = tableWidth / 7 - 6;

                  return [
                    {
                      Header: '',
                      accessor: 'select',
                      minWidth: 24,
                      width: 24,
                      filterable: false,
                    },
                    {
                      Header: 'Name',
                      accessor: 'name',
                      width: columnWidth,
                      filterable: true,
                    },
                    {
                      Header: 'Type',
                      accessor: 'type',
                      width: columnWidth,
                      filterable: true,
                    },
                    {
                      Header: 'Group',
                      accessor: 'group',
                      width: halfColumnWidth,
                      filterable: true,
                    },
                    {
                      Header: 'Total Result Count',
                      accessor: 'resultCount',
                      width: halfColumnWidth,
                      filterable: false,
                    },
                    {
                      Header: 'Detectable Result Count',
                      accessor: 'measurementCount',
                      width: halfColumnWidth,
                      filterable: false,
                    },
                  ];
                }}
              />
            </>
          ))}
      </div>
    </div>
  );
}

function DownloadSection({ charcs, charcsStatus, station, stationStatus }) {
  const [range, setRange] = useState(null);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(null);
  const [checkboxes, checkboxDispatch] = useReducer(
    checkboxReducer,
    initialCheckboxes,
  );
  const [expanded, setExpanded] = useState(false);

  const services = useServicesContext();

  const downloadUrl =
    stationStatus === 'success' &&
    `${services.data.waterQualityPortal.resultSearch}` +
      `zip=no&dataProfile=narrowResult` +
      `&organization=${station.orgId}` +
      `&siteid=${station.siteId}` +
      `&providers=${station.providerName}` +
      `${buildCharcsFilter(checkboxes)}` +
      `${buildDateFilter(range, minYear, maxYear)}`;

  const portalUrl =
    stationStatus === 'success' &&
    `${services.data.waterQualityPortal.userInterface}#` +
      `mimeType=xlsx&dataProfile=narrowResult` +
      `&organization=${station.orgId}` +
      `&siteid=${station.siteId}` +
      `&providers=${station.providerName}` +
      `${buildCharcsFilter(checkboxes)}` +
      `${buildDateFilter(range, minYear, maxYear)}`;

  useEffect(() => {
    if (charcsStatus !== 'success') return;
    const data = parseCharcs(charcs, range);
    checkboxDispatch({ type: 'load', payload: { data } });
  }, [charcs, charcsStatus, range]);

  useEffect(() => {
    if (charcsStatus !== 'success') return;
    if (minYear || maxYear) return;
    let newMinYear = Infinity;
    let newMaxYear = 0;
    Object.values(charcs).forEach((charc) => {
      const { records } = charc;
      records.forEach((record) => {
        if (record.year < newMinYear) newMinYear = record.year;
        if (record.year > newMaxYear) newMaxYear = record.year;
      });
    });
    setMinYear(newMinYear);
    setMaxYear(newMaxYear);
    setRange([newMinYear, newMaxYear]);
  }, [charcs, charcsStatus, maxYear, minYear]);

  return (
    <div css={boxStyles}>
      <h2 css={boxHeadingStyles}>Download Station Data</h2>
      {charcsStatus === 'fetching' ? (
        <LoadingSpinner />
      ) : Object.keys(charcs).length === 0 ? (
        <p>No data available for this monitoring location.</p>
      ) : (
        <>
          <div css={sliderContainerStyles}>
            {!range ? (
              <LoadingSpinner />
            ) : (
              <DateSlider
                max={maxYear}
                min={minYear}
                disabled={!Boolean(Object.keys(charcs).length)}
                onChange={(newRange) => setRange(newRange)}
              />
            )}
          </div>
          <div css={flexboxSectionStyles}>
            {charcsStatus === 'idle' || charcsStatus === 'fetching' ? (
              <LoadingSpinner />
            ) : charcsStatus === 'failure' ? (
              <div css={modifiedErrorBoxStyles}>
                <p>{monitoringError}</p>
              </div>
            ) : charcsStatus === 'success' ? (
              <div css={accordionStyles}>
                <AccordionList
                  className="accordion-list"
                  onExpandCollapse={(newExpanded) => setExpanded(newExpanded)}
                  title={
                    <span className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checkboxes.all === 1}
                        ref={(input) => {
                          if (input) input.indeterminate = checkboxes.all === 2;
                        }}
                        onChange={(_ev) => checkboxDispatch({ type: 'all' })}
                      />
                      <strong>Toggle All</strong>
                    </span>
                  }
                >
                  <p css={accordionHeadingStyles}>
                    <strong>
                      <em>
                        <GlossaryTerm term="Characteristic Group">
                          Character&shy;istic Groups
                        </GlossaryTerm>
                      </em>
                    </strong>
                    <strong>
                      <em>
                        <GlossaryTerm
                          className="count"
                          term="Monitoring Measurements"
                        >
                          Number of Measurements
                        </GlossaryTerm>
                      </em>
                    </strong>
                  </p>
                  {Object.values(checkboxes.groups)
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map((group) => (
                      <AccordionItem
                        allExpanded={expanded}
                        key={group.id}
                        highlightContent={false}
                        title={
                          <span css={accordionFlexStyles}>
                            <span className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={group.selected === 1}
                                ref={(input) => {
                                  if (input)
                                    input.indeterminate = group.selected === 2;
                                }}
                                onChange={(_ev) => {
                                  checkboxDispatch({
                                    type: 'group',
                                    payload: { id: group.id },
                                  });
                                }}
                                onClick={(ev) => ev.stopPropagation()}
                              />
                              <strong>{group.id}</strong>
                            </span>
                            <span>
                              <strong>{group.count}</strong>
                            </span>
                          </span>
                        }
                      >
                        <p className="charc-type" css={accordionHeadingStyles}>
                          <strong>
                            <em>Character&shy;istic Types</em>
                          </strong>
                        </p>
                        {group.types
                          .sort((a, b) => a.localeCompare(b))
                          .map((typeId) => {
                            const type = checkboxes.types[typeId];
                            return (
                              <div className="charc-type" key={typeId}>
                                <AccordionItem
                                  allExpanded={expanded}
                                  highlightContent={false}
                                  title={
                                    <span css={accordionFlexStyles}>
                                      <span className="checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={type.selected === 1}
                                          ref={(input) => {
                                            if (input)
                                              input.indeterminate =
                                                type.selected === 2;
                                          }}
                                          onChange={(_ev) =>
                                            checkboxDispatch({
                                              type: 'type',
                                              payload: { id: typeId },
                                            })
                                          }
                                          onClick={(ev) => ev.stopPropagation()}
                                        />
                                        <strong>{typeId}</strong>
                                      </span>
                                      <strong>{type.count}</strong>
                                    </span>
                                  }
                                >
                                  <p
                                    className="charc-name"
                                    css={accordionHeadingStyles}
                                  >
                                    <strong>
                                      <em>Character&shy;istic Names</em>
                                    </strong>
                                  </p>
                                  {type.charcs
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((charcId) => {
                                      const charc = checkboxes.charcs[charcId];
                                      return (
                                        <div
                                          className="charc-name"
                                          css={accordionRowStyles}
                                          key={charcId}
                                        >
                                          <span className="checkbox-label">
                                            <input
                                              type="checkbox"
                                              checked={charc.selected === 1}
                                              ref={(input) => {
                                                if (input)
                                                  input.indeterminate =
                                                    charc.selected === 2;
                                              }}
                                              onChange={(_ev) =>
                                                checkboxDispatch({
                                                  type: 'characteristic',
                                                  payload: { id: charcId },
                                                })
                                              }
                                            />
                                            <strong>{charcId}</strong>
                                          </span>
                                          <strong>{charc.count}</strong>
                                        </div>
                                      );
                                    })}
                                </AccordionItem>
                              </div>
                            );
                          })}
                      </AccordionItem>
                    ))}
                  <p className="total-row" css={accordionHeadingStyles}>
                    <strong>
                      <em>Total Measurements Selected:</em>
                    </strong>
                    <strong className="count">
                      {getTotalCount(checkboxes.charcs)}
                    </strong>
                  </p>
                </AccordionList>
              </div>
            ) : null}
          </div>
          <div id="download-links" css={downloadLinksStyles}>
            <div>
              <a
                rel="noopener noreferrer"
                target="_blank"
                data-cy="portal"
                href={portalUrl}
                style={{ fontWeight: 'normal' }}
              >
                <i
                  css={iconStyles}
                  className="fas fa-filter"
                  aria-hidden="true"
                />
                Advanced Filtering
              </a>
              &nbsp;&nbsp;
              <small css={modifiedDisclaimerStyles}>
                (opens new browser tab)
              </small>
            </div>
            <div>
              <span>Download Selected Data</span>
              <span>
                &nbsp;&nbsp;
                {checkboxes.all > 0 ? (
                  <a href={`${downloadUrl}&mimeType=xlsx`}>
                    <i className="fas fa-file-excel" aria-hidden="true" />
                  </a>
                ) : (
                  <i
                    className="fas fa-file-excel"
                    aria-hidden="true"
                    style={{ color: '#ccc' }}
                  />
                )}
                &nbsp;&nbsp;
                {checkboxes.all > 0 ? (
                  <a href={`${downloadUrl}&mimeType=csv`}>
                    <i className="fas fa-file-csv" aria-hidden="true" />
                  </a>
                ) : (
                  <i
                    className="fas fa-file-csv"
                    aria-hidden="true"
                    style={{ color: '#ccc' }}
                  />
                )}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InformationSection({ orgId, siteId, station, stationStatus }) {
  const trimmedSiteId = siteId.replace(orgId + '-', '');

  return (
    <div css={boxStyles}>
      <h2 css={infoBoxHeadingStyles}>
        {stationStatus === 'fetching' && <LoadingSpinner />}
        <span>
          {stationStatus === 'success' && station.locationName}
          <small>
            <strong>Monitoring Station ID:</strong>&nbsp; {trimmedSiteId}
          </small>
        </span>
      </h2>
      {sectionRowInline('Organization Name', station.orgName, stationStatus)}
      {sectionRowInline('Organization ID', station.orgId, stationStatus)}
      {sectionRowInline(
        'Location',
        `${station.county}, ${station.state}`,
        stationStatus,
      )}
      {sectionRowInline('Water Type', station.locationType, stationStatus)}
    </div>
  );
}

function MonitoringStation({ fullscreen }) {
  const { orgId, provider, siteId } = useParams();
  const [station, stationStatus] = useStationDetails(provider, orgId, siteId);
  const [characteristics, characteristicsStatus] = useCharacteristics(
    provider,
    orgId,
    siteId,
  );
  const [selectedCharc, setSelectedCharc] = useState(null);
  useEffect(() => {
    if (characteristicsStatus !== 'success') return;
    setSelectedCharc('None');
  }, [characteristicsStatus]);

  const [mapWidth, setMapWidth] = useState(0);
  const widthRef = useCallback((node) => {
    if (!node) return;
    setMapWidth(node.getBoundingClientRect().width);
  }, []);

  const mapNarrow = (height) => (
    <>
      <MapVisibilityButton>
        {(mapShown) => (
          <div
            style={{
              display: mapShown ? 'block' : 'none',
              height: height - 40,
            }}
            css={`
              ${boxStyles};
            `}
          >
            <StationMapContainer
              layout="narrow"
              station={station}
              stationStatus={stationStatus}
              widthRef={widthRef}
            />
          </div>
        )}
      </MapVisibilityButton>
    </>
  );

  const mapWide = (
    <div
      id="waterbody-report-map"
      style={{
        height: mapWidth,
        minHeight: '400px',
      }}
      css={`
        ${boxStyles};
      `}
    >
      <StationMapContainer
        layout="wide"
        station={station}
        stationStatus={stationStatus}
        widthRef={widthRef}
      />
    </div>
  );

  const noStationView = (
    <Page>
      <NavBar title="Plan Summary" />

      <div css={containerStyles}>
        <div css={pageErrorBoxStyles}>
          <p>
            The monitoring location <strong>{siteId}</strong> could not be
            found.
          </p>
        </div>
      </div>
    </Page>
  );

  const fullScreenView = (
    <WindowSize>
      {({ width, height }) => (
        <div data-content="stationmap" style={{ width, height }}>
          <StationMapContainer
            layout="fullscreen"
            station={station}
            widthRef={widthRef}
          />
        </div>
      )}
    </WindowSize>
  );

  const twoColumnView = (
    <Page>
      <NavBar title="Monitoring Station Details" />
      <div css={containerStyles} data-content="container">
        <WindowSize>
          {({ width, height }) => {
            return (
              <div css={modifiedSplitLayoutColumnsStyles}>
                <div className="static" css={leftColumnStyles}>
                  <InformationSection
                    orgId={orgId}
                    station={station}
                    stationStatus={stationStatus}
                    siteId={siteId}
                  />
                  {width < 960 ? mapNarrow(height) : mapWide}
                  <DownloadSection
                    charcs={characteristics}
                    charcsStatus={characteristicsStatus}
                    station={station}
                    stationStatus={stationStatus}
                  />
                </div>
                <div css={rightColumnStyles}>
                  <CharacteristicsTable
                    charcs={characteristics}
                    charcsStatus={characteristicsStatus}
                    selected={selectedCharc}
                    setSelected={setSelectedCharc}
                  />
                  <CharacteristicChart
                    charcGroup={
                      selectedCharc &&
                      getCharcGroup(
                        characteristics[selectedCharc]?.type,
                        characteristicGroupMappings,
                      )
                    }
                    charcName={selectedCharc}
                    charcsStatus={characteristicsStatus}
                    records={characteristics[selectedCharc]?.records}
                  />
                </div>
              </div>
            );
          }}
        </WindowSize>
      </div>
    </Page>
  );

  switch (stationStatus) {
    case 'success':
      return isEmpty(station)
        ? noStationView
        : fullscreen.fullscreenActive
        ? fullScreenView
        : twoColumnView;
    case 'failure':
      // TODO: add error box
      return null;
    default:
      return fullscreen.fullscreenActive ? fullScreenView : twoColumnView;
  }
}

function MonitoringStationContainer(props) {
  return (
    <MapHighlightProvider>
      <FullscreenProvider>
        <FullscreenContext.Consumer>
          {(fullscreen) => (
            <MonitoringStation fullscreen={fullscreen} {...props} />
          )}
        </FullscreenContext.Consumer>
      </FullscreenProvider>
    </MapHighlightProvider>
  );
}

function StationMap({ layout, station, stationStatus, widthRef }) {
  const [layersInitialized, setLayersInitialized] = useState(false);
  const [doneDrawing, setDoneDrawing] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const services = useServicesContext();
  const getSharedLayers = useSharedLayers();
  const {
    homeWidget,
    layers,
    mapView,
    monitoringLocationsLayer,
    resetData,
    setLayers,
    setMonitoringLocationsLayer,
    setVisibleLayers,
  } = useContext(LocationSearchContext);

  useEffect(() => {
    if (!mapView) return;
    mapView.map.basemap = new Basemap({
      portalItem: {
        id: '588f0e0acc514c11bc7c898fed9fc651',
      },
    });

    return function cleanup() {
      mapView.map.basemap = 'gray-vector';
    };
  }, [mapView]);

  // Initialize the layers
  useEffect(() => {
    if (!getSharedLayers || layersInitialized) return;

    if (!monitoringLocationsLayer) {
      const newMonitoringLocationsLayer = new FeatureLayer({
        id: 'monitoringLocationsLayer',
        title: 'Past Water Conditions',
        listMode: 'hide',
        legendEnabled: true,
        fields: [
          { name: 'OBJECTID', type: 'oid' },
          { name: 'monitoringType', type: 'string' },
          { name: 'siteId', type: 'string' },
          { name: 'orgId', type: 'string' },
          { name: 'orgName', type: 'string' },
          { name: 'locationLongitude', type: 'double' },
          { name: 'locationLatitude', type: 'double' },
          { name: 'locationName', type: 'string' },
          { name: 'locationType', type: 'string' },
          { name: 'locationUrl', type: 'string' },
          { name: 'stationProviderName', type: 'string' },
          { name: 'stationTotalSamples', type: 'integer' },
          { name: 'stationTotalMeasurements', type: 'integer' },
          { name: 'stationTotalsByCategory', type: 'string' },
          { name: 'uniqueId', type: 'string' },
        ],
        outFields: ['*'],
        source: [
          new Graphic({
            geometry: { type: 'point', longitude: -98.5795, latitude: 39.8283 },
            attributes: { OBJECTID: 1 },
          }),
        ],
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            style: 'square',
            color: colors.lightPurple(),
            outline: {
              width: 0.75,
            },
          },
        },
        popupTemplate: {
          outFields: ['*'],
          title: (feature) => getPopupTitle(feature.graphic.attributes),
          content: (feature) =>
            getPopupContent({ feature: feature.graphic, services }),
        },
      });
      setMonitoringLocationsLayer(newMonitoringLocationsLayer);
      setLayers([...getSharedLayers(), newMonitoringLocationsLayer]);
      setVisibleLayers({ monitoringLocationsLayer: true });
    } else {
      setLayersInitialized(true);
    }
  }, [
    getSharedLayers,
    layers,
    layersInitialized,
    monitoringLocationsLayer,
    services,
    setLayers,
    setMonitoringLocationsLayer,
    setVisibleLayers,
    station,
    stationStatus,
  ]);

  // Draw the station on the map
  useEffect(() => {
    if (!layersInitialized || doneDrawing) return;
    drawStation(station, monitoringLocationsLayer, services).then((result) => {
      setDoneDrawing(result);
    });
  }, [
    doneDrawing,
    layersInitialized,
    station,
    monitoringLocationsLayer,
    services,
  ]);

  // Zoom to the location of the station
  useEffect(() => {
    if (!doneDrawing || !mapView || !monitoringLocationsLayer || !homeWidget)
      return;

    getZoomParams(monitoringLocationsLayer).then((zoomParams) => {
      mapView.goTo(zoomParams).then(() => {
        // set map zoom and home widget's viewpoint
        mapView.zoom = mapView.zoom - 1;
        homeWidget.viewpoint = new Viewpoint({
          targetGeometry: mapView.extent,
        });
        setMapLoading(false);
      });
    });
  }, [doneDrawing, mapView, monitoringLocationsLayer, homeWidget]);

  // Function for resetting the LocationSearch context when the map is removed
  useEffect(() => {
    return function cleanup() {
      resetData();
    };
  }, [resetData]);

  // Scrolls to the map when switching layouts
  useEffect(() => {
    const itemName = layout === 'fullscreen' ? 'stationmap' : 'container';
    const content = document.querySelector(`[data-content="${itemName}"]`);
    if (content) {
      let pos = content.getBoundingClientRect();

      window.scrollTo(pos.left + window.scrollX, pos.top + window.scrollY);
    }
  }, [layout]);

  return (
    <div css={mapContainerStyles} data-testid="hmw-station-map" ref={widthRef}>
      {stationStatus === 'fetching' ? (
        <LoadingSpinner />
      ) : (
        <Map layers={layers} />
      )}
      {mapView && mapLoading && <MapLoadingSpinner />}
    </div>
  );
}

function StationMapContainer({ ...props }) {
  return (
    <MapErrorBoundary>
      <StationMap {...props} />
    </MapErrorBoundary>
  );
}

export default MonitoringStationContainer;
