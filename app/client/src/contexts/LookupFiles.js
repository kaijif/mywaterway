// @flow

import React, { createContext, useContext, useState } from 'react';
import type { Node } from 'react';
// utilities
import { fetchCheck, lookupFetch } from 'utils/fetchUtils';

// Common function for setting the context/state of lookup files.
function getLookupFile(filename: string, setVariable: Function) {
  // fetch the lookup file
  lookupFetch(filename)
    .then((data) => {
      setVariable({ status: 'success', data });
    })
    .catch((err) => {
      console.error(err);
      setVariable({ status: 'failure', data: err });
    });
}

// --- components ---
type LookupFile = {
  status: 'fetching' | 'success' | 'failure',
  data: Object,
};

type LookupFiles = {
  documentOrder: LookupFile,
  setDocumentOrder: Function,
  educatorMaterials: LookupFile,
  setEducatorMaterials: Function,
  reportStatusMapping: LookupFile,
  setReportStatusMapping: Function,
  stateNationalUses: LookupFile,
  setStateNationalUses: Function,
  surveyMapping: LookupFile,
  setSurveyMapping: Function,
  waterTypeOptions: LookupFile,
  setWaterTypeOptions: Function,
  nars: LookupFile,
  setNars: Function,
  notifications: LookupFile,
  setNotifications: Function,
  services: LookupFile,
  setServices: Function,
};

const LookupFilesContext: Object = createContext<LookupFiles>({
  documentOrder: { status: 'fetching', data: null },
  setDocumentOrder: () => {},
  educatorMaterials: { status: 'fetching', data: null },
  setEducatorMaterials: () => {},
  reportStatusMapping: { status: 'fetching', data: null },
  setReportStatusMapping: () => {},
  stateNationalUses: { status: 'fetching', data: null },
  setStateNationalUses: () => {},
  surveyMapping: { status: 'fetching', data: null },
  setSurveyMapping: () => {},
  waterTypeOptions: { status: 'fetching', data: null },
  setWaterTypeOptions: () => {},
  nars: { status: 'fetching', data: null },
  setNars: () => {},
  notifications: { status: 'fetching', data: null },
  setNotifications: () => {},
  services: { status: 'fetching', data: null },
  setServices: () => {},
});

type Props = {
  children: Node,
};

function LookupFilesProvider({ children }: Props) {
  const [documentOrder, setDocumentOrder] = useState({
    status: 'fetching',
    data: {},
  });
  const [educatorMaterials, setEducatorMaterials] = useState({
    status: 'fetching',
    data: {},
  });
  const [reportStatusMapping, setReportStatusMapping] = useState({
    status: 'fetching',
    data: {},
  });
  const [stateNationalUses, setStateNationalUses] = useState({
    status: 'fetching',
    data: [],
  });
  const [surveyMapping, setSurveyMapping] = useState({
    status: 'fetching',
    data: [],
  });
  const [waterTypeOptions, setWaterTypeOptions] = useState({
    status: 'fetching',
    data: {},
  });
  const [nars, setNars] = useState({
    status: 'fetching',
    data: {},
  });
  const [notifications, setNotifications] = useState({
    status: 'fetching',
    data: [],
  });
  const [services, setServices] = useState({
    status: 'fetching',
    data: {},
  });
  const [organizations, setOrganizations] = useState({
    status: 'fetching',
    data: {},
  });

  return (
    <LookupFilesContext.Provider
      value={{
        documentOrder,
        setDocumentOrder,
        educatorMaterials,
        setEducatorMaterials,
        reportStatusMapping,
        setReportStatusMapping,
        stateNationalUses,
        setStateNationalUses,
        surveyMapping,
        setSurveyMapping,
        waterTypeOptions,
        setWaterTypeOptions,
        nars,
        setNars,
        notifications,
        setNotifications,
        services,
        setServices,
        organizations,
        setOrganizations,
      }}
    >
      {children}
    </LookupFilesContext.Provider>
  );
}

// Custom hook for the documentOrder.json lookup file.
let documentOrderInitialized = false; // global var for ensuring fetch only happens once
function useDocumentOrderContext() {
  const { documentOrder, setDocumentOrder } = useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!documentOrderInitialized) {
    documentOrderInitialized = true;
    getLookupFile('state/documentOrder.json', setDocumentOrder);
  }

  return documentOrder;
}

// Custom hook for the reportStatusMapping.json lookup file.
let reportStatusMappingInitialized = false; // global var for ensuring fetch only happens once
function useReportStatusMappingContext() {
  const { reportStatusMapping, setReportStatusMapping } =
    useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!reportStatusMappingInitialized) {
    reportStatusMappingInitialized = true;
    getLookupFile('state/reportStatusMapping.json', setReportStatusMapping);
  }

  return reportStatusMapping;
}

// Custom hook for the stateNationalUses.json lookup file.
let stateNationalUsesInitialized = false; // global var for ensuring fetch only happens once
function useStateNationalUsesContext() {
  const { stateNationalUses, setStateNationalUses } =
    useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!stateNationalUsesInitialized) {
    stateNationalUsesInitialized = true;
    getLookupFile('state/stateNationalUses.json', setStateNationalUses);
  }

  return stateNationalUses;
}

// Custom hook for the surveyMapping.json lookup file.
let surveyMappingInitialized = false; // global var for ensuring fetch only happens once
function useSurveyMappingContext() {
  const { surveyMapping, setSurveyMapping } = useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!surveyMappingInitialized) {
    surveyMappingInitialized = true;
    getLookupFile('state/surveyMapping.json', setSurveyMapping);
  }

  return surveyMapping;
}

// Custom hook for the waterTypeOptions.json lookup file.
let waterTypeOptionsInitialized = false; // global var for ensuring fetch only happens once
function useWaterTypeOptionsContext() {
  const { waterTypeOptions, setWaterTypeOptions } =
    useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!waterTypeOptionsInitialized) {
    waterTypeOptionsInitialized = true;
    getLookupFile('state/waterTypeOptions.json', setWaterTypeOptions);
  }

  return waterTypeOptions;
}

// Custom hook for the waterTypeOptions.json lookup file.
let narsInitialized = false; // global var for ensuring fetch only happens once
function useNarsContext() {
  const { nars, setNars } = useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!narsInitialized) {
    narsInitialized = true;
    getLookupFile('national/NARS.json', setNars);
  }

  return nars;
}

// Custom hook for the messages.json file.
let notificationsInitialized = false; // global var for ensuring fetch only happens once
function useNotificationsContext() {
  const { notifications, setNotifications } = useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!notificationsInitialized) {
    notificationsInitialized = true;
    getLookupFile('notifications/messages.json', setNotifications);
  }

  return notifications;
}

// Custom hook for the services.json file.
let servicesInitialized = false; // global var for ensuring fetch only happens once
function useServicesContext() {
  const { services, setServices } = useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!servicesInitialized) {
    servicesInitialized = true;

    // get origin for mapping proxy calls
    const loc = window.location;
    const origin =
      loc.hostname === 'localhost'
        ? `${loc.protocol}//${loc.hostname}:9091`
        : loc.origin;

    // fetch the lookup file
    lookupFetch('config/services.json')
      .then((data) => {
        const googleAnalyticsMapping = [];
        data.googleAnalyticsMapping.forEach((item) => {
          // get base url
          let urlLookup = origin;
          if (item.urlLookup !== 'origin') {
            urlLookup = data;
            const pathParts = item.urlLookup.split('.');
            pathParts.forEach((part) => {
              urlLookup = urlLookup[part];
            });
          }

          let wildcardUrl = item.wildcardUrl;
          wildcardUrl = wildcardUrl.replace(/\{urlLookup\}/g, urlLookup);

          googleAnalyticsMapping.push({
            wildcardUrl,
            name: item.name,
          });
        });

        window.googleAnalyticsMapping = googleAnalyticsMapping;

        setServices({ status: 'success', data });
      })
      .catch((err) => {
        console.error(err);
        setServices({ status: 'failure', data: err });
      });
  }

  return services;
}

// Custom hook for the services.json file.
let organizationsInitialized = false; // global var for ensuring fetch only happens once
function useOrganizationsContext() {
  const { services, organizations, setOrganizations } =
    useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!organizationsInitialized && services.status === 'success') {
    organizationsInitialized = true;

    // fetch the lookup file
    const outFields = ['organizationid', 'orgtype', 'reportingcycle', 'state'];
    fetchCheck(
      `${
        services.data.waterbodyService.controlTable
      }/query?where=1%3D1&outFields=${outFields.join('%2C')}&f=json`,
    )
      .then((data) => {
        setOrganizations({ status: 'success', data });
      })
      .catch((err) => {
        console.error(err);
        setOrganizations({ status: 'failure', data: err });
      });
  }

  return organizations;
}

// Custom hook for the educators.json file.
let educatorMaterialsInitialized = false; // global var for ensuring fetch only happens once
function useEducatorMaterialsContext() {
  const { educatorMaterials, setEducatorMaterials } =
    useContext(LookupFilesContext);

  // fetch the lookup file if necessary
  if (!educatorMaterialsInitialized) {
    educatorMaterialsInitialized = true;
    getLookupFile('educators.json', setEducatorMaterials);
  }

  return educatorMaterials;
}

export {
  LookupFilesContext,
  LookupFilesProvider,
  useDocumentOrderContext,
  useEducatorMaterialsContext,
  useNarsContext,
  useNotificationsContext,
  useOrganizationsContext,
  useReportStatusMappingContext,
  useServicesContext,
  useStateNationalUsesContext,
  useSurveyMappingContext,
  useWaterTypeOptionsContext,
};
