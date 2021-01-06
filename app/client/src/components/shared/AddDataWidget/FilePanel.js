// @flow

import React from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
// components
import LoadingSpinner from 'components/shared/LoadingSpinner';
// contexts
import { AddDataWidgetContext } from 'contexts/AddDataWidget';
import { EsriModulesContext } from 'contexts/EsriModules';
import { LocationSearchContext } from 'contexts/locationSearch';
// utils
import { fetchPostFile, fetchPostForm } from 'utils/fetchUtils';
// config
import {
  fileReadErrorMessage,
  importErrorMessage,
  invalidFileTypeMessage,
  noDataMessage,
  uploadSuccessMessage,
  webServiceErrorMessage,
} from 'config/errorMessages';

/**
 * Determines if the desired name has already been used. If it has
 * it appends in index to the end (i.e. '<desiredName> (2)').
 */
function getLayerName(layers, desiredName) {
  // get a list of names in use
  let usedNames: string[] = [];
  layers.forEach((layer) => {
    usedNames.push(layer.title);
  });

  // Find a name where there is not a collision.
  // Most of the time this loop will be skipped.
  let duplicateCount = 0;
  let newName = desiredName;
  while (usedNames.includes(newName)) {
    duplicateCount += 1;
    newName = `${desiredName} (${duplicateCount})`;
  }

  return newName;
}

// --- styles (FileIcon) ---
const FileIconOuterContainer = styled.span`
  width: 2em;
  line-height: 1;
  margin: 2px;
`;

const FileIconContainer = styled.span`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  vertical-align: middle;
`;

const FileIconI = styled.i`
  color: #e6e8ed;
  width: 100%;
`;

const fileIconTextColor = `
  color: #545454;
`;

const FileIconTextColorDiv = styled.div`
  ${fileIconTextColor}
`;

const FileIconText = styled.span`
  ${fileIconTextColor}
  font-size: 16px;
  margin-top: 5px;
  width: 100%;
`;

const CheckBoxStyles = styled.input`
  margin-right: 5px;
`;

// --- components (FileIcon) ---
type FileIconProps = {
  label: string,
};

function FileIcon({ label }: FileIconProps) {
  return (
    <FileIconOuterContainer className="fa-stack fa-2x">
      <FileIconContainer>
        <FileIconI className="fas fa-file fa-stack-2x"></FileIconI>
        <FileIconText className="fa-stack-text fa-stack-1x">
          {label}
        </FileIconText>
      </FileIconContainer>
    </FileIconOuterContainer>
  );
}

// --- styles (FilePanel) ---
const SearchContainer = styled.div`
  height: 100%;
  overflow: auto;
  padding: 1em;

  .dropzone {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-width: 2px;
    border-radius: 2px;
    border-color: #eee;
    border-style: dashed;
    background-color: #fafafa;
    color: #bdbdbd;
    outline: none;
    transition: border 0.24s ease-in-out;
    text-align: center;

    .div {
      color: #545454;
    }
  }
`;

// --- components (FilePanel) ---
type UploadStatusType =
  | ''
  | 'fetching'
  | 'success'
  | 'failure'
  | 'no-data'
  | 'invalid-file-type'
  | 'import-error'
  | 'file-read-error';

function FilePanel() {
  const { widgetLayers, addWidgetLayer } = React.useContext(
    AddDataWidgetContext,
  );
  const { mapView } = React.useContext(LocationSearchContext);
  const {
    FeatureLayer,
    FeatureSet,
    Field,
    geometryJsonUtils,
    Graphic,
    Geoprocessor,
    KMLLayer,
    rendererJsonUtils,
    SpatialReference,
  } = React.useContext(EsriModulesContext);

  const [generalizeFeatures, setGeneralizeFeatures] = React.useState(false);
  const [analyzeResponse, setAnalyzeResponse] = React.useState<any>(null);
  const [generateResponse, setGenerateResponse] = React.useState<any>(null);
  const [featuresAdded, setFeaturesAdded] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<UploadStatusType>('');

  // Handles the user uploading a file
  const [file, setFile] = React.useState<any>(null);
  const onDrop = React.useCallback((acceptedFiles) => {
    // Do something with the files
    if (
      !acceptedFiles ||
      acceptedFiles.length === 0 ||
      !acceptedFiles[0].name
    ) {
      return;
    }

    // get the filetype
    const file = acceptedFiles[0];
    let fileType = '';
    if (file.name.endsWith('.zip')) fileType = 'shapefile';
    if (file.name.endsWith('.csv')) fileType = 'csv';
    if (file.name.endsWith('.kml')) fileType = 'kml';
    if (file.name.endsWith('.geojson')) fileType = 'geojson';
    if (file.name.endsWith('.geo.json')) fileType = 'geojson';
    if (file.name.endsWith('.gpx')) fileType = 'gpx';

    // set the file state
    file['esriFileType'] = fileType;
    setFile({
      file,
      lastFileName: '',
      analyzeCalled: false,
    });

    // reset state management values
    setUploadStatus('fetching');
    setAnalyzeResponse(null);
    setGenerateResponse(null);
    setFeaturesAdded(false);

    if (!fileType) {
      setUploadStatus('invalid-file-type');
      return;
    }
  }, []);

  // Configuration for the dropzone component
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  // analyze csv files
  React.useEffect(() => {
    if (!file?.file?.esriFileType || file.analyzeCalled) return;
    if (
      file.file.name === file.lastFileName ||
      file.file.esriFileType !== 'csv'
    ) {
      return;
    }

    setFile((file: any) => {
      return {
        ...file,
        analyzeCalled: true,
      };
    });

    // build request
    const analyzeParams: any = { enableGlobalGeocoding: true };

    const params: any = {
      f: 'json',
      fileType: file.file.esriFileType,
      analyzeParameters: analyzeParams,
    };

    const analyzeUrl = `https://www.arcgis.com/sharing/rest/content/features/analyze`;
    fetchPostFile(analyzeUrl, params, file.file)
      .then((res: any) => {
        setAnalyzeResponse(res);
      })
      .catch((err) => {
        console.error(err);
        setUploadStatus('failure');
      });
  }, [file]);

  // get features from file
  React.useEffect(() => {
    if (
      !mapView ||
      !file?.file?.esriFileType ||
      file.file.name === file.lastFileName
    ) {
      return;
    }
    if (file.file.esriFileType === 'kml') return; // KML doesn't need to do this
    if (file.file.esriFileType === 'csv' && !analyzeResponse) return; // CSV needs to wait for the analyze response

    setFile((file: any) => {
      return {
        ...file,
        lastFileName: file.file.name,
      };
    });

    const generateUrl = `https://www.arcgis.com/sharing/rest/content/features/generate`;

    let resParameters = {};
    if (file.file.esriFileType === 'csv' && analyzeResponse) {
      resParameters = analyzeResponse.publishParameters;
    }
    const fileForm = new FormData();
    fileForm.append('file', file.file);
    const publishParameters: any = {
      ...resParameters,
      name: file.file.name,
      targetSR: mapView.spatialReference,
      maxRecordCount: 4000, // 4000 is the absolute max for this service.
      enforceInputFileSizeLimit: true,
      enforceOutputJsonSizeLimit: true,
    };

    // generalize features since this option was selected
    if (generalizeFeatures) {
      // save the current scale
      const originalScale = mapView.scale;

      // get the width for a scale of 40000
      mapView.scale = 40000;
      const extent = mapView.extent;

      // revert the scale back to the original value
      mapView.scale = originalScale;

      // get the resolution
      let resolution = extent.width / mapView.width;

      // append the publish parameters
      publishParameters['generalize'] = true;
      publishParameters['maxAllowableOffset'] = resolution;
      publishParameters['reducePrecision'] = true;

      // get the number of digits after the decimal
      let numDecimals = 0;
      while (resolution < 1) {
        resolution = resolution * 10;
        numDecimals++;
      }
      publishParameters['numberOfDigitsAfterDecimal'] = numDecimals;
    }

    let fileTypeToSend = file.file.esriFileType;

    // generate the features
    const params = {
      f: 'json',
      filetype: fileTypeToSend,
      publishParameters,
    };
    fetchPostFile(generateUrl, params, file.file)
      .then((res: any) => {
        if (res.error) {
          setUploadStatus('import-error');
          return;
        }

        setGenerateResponse(res);
      })
      .catch((err) => {
        console.error(err);
        setUploadStatus('failure');
      });
  }, [
    // esri modules
    FeatureSet,
    Field,
    geometryJsonUtils,
    Geoprocessor,
    Graphic,
    SpatialReference,

    // app
    generalizeFeatures,
    analyzeResponse,
    file,
    mapView,
  ]);

  // add features to the map as feature layers. This is only for reference layer
  // types. This is so users can view popups but not edit the features.
  const [newLayerName, setNewLayerName] = React.useState('');
  React.useEffect(() => {
    if (!mapView?.map || !file?.file?.esriFileType || featuresAdded) {
      return;
    }
    if (!generateResponse) return;
    if (
      !generateResponse.featureCollection?.layers ||
      generateResponse.featureCollection.layers.length === 0
    ) {
      setUploadStatus('no-data');
      return;
    }

    setFeaturesAdded(true);

    const featureLayers: __esri.FeatureLayer[] = [];
    const graphicsAdded: __esri.Graphic[] = [];
    generateResponse.featureCollection.layers.forEach((layer: any) => {
      if (
        !layer?.featureSet?.features ||
        layer.featureSet.features.length === 0
      ) {
        return;
      }

      // get the list of fields
      let fields: __esri.Field[] = [];
      layer.layerDefinition.fields.forEach((field: __esri.Field) => {
        // Using Field.fromJSON to convert the Rest fields to the ArcGIS JS fields
        fields.push(Field.fromJSON(field));
      });

      // get the features from the response and add the correct type value
      const features: __esri.Graphic[] = [];
      layer.featureSet.features.forEach((feature: any) => {
        if (
          !feature?.geometry?.spatialReference &&
          file.file.esriFileType === 'kml'
        ) {
          feature.geometry['spatialReference'] =
            generateResponse.lookAtExtent.spatialReference;
        }
        const graphic = Graphic.fromJSON(feature);
        features.push(graphic);
        graphicsAdded.push(graphic);
      });

      // use jsonUtils to convert the REST API renderer to an ArcGIS JS renderer
      const renderer: __esri.Renderer = rendererJsonUtils.fromJSON(
        layer.layerDefinition.drawingInfo.renderer,
      );

      // create the popup template if popup information was provided
      let popupTemplate;
      if (layer.popupInfo) {
        popupTemplate = {
          title: layer.popupInfo.title,
          content: layer.popupInfo.description,
        };
      }

      const layerName = getLayerName(widgetLayers, file.file.name);
      setNewLayerName(layerName);
      const layerProps: __esri.FeatureLayerProperties = {
        fields,
        objectIdField: layer.layerDefinition.objectIdField,
        outFields: ['*'],
        source: features,
        title: layerName,
        renderer,
        popupTemplate,
      };

      // create the feature layer
      const layerToAdd = new FeatureLayer(layerProps);
      featureLayers.push(layerToAdd);

      addWidgetLayer(layerToAdd);
    });

    mapView.map.addMany(featureLayers);
    if (graphicsAdded.length > 0) mapView.goTo(graphicsAdded);

    setUploadStatus('success');
  }, [
    // esri modules
    FeatureLayer,
    Field,
    geometryJsonUtils,
    Graphic,
    rendererJsonUtils,

    // app
    generateResponse,
    featuresAdded,
    file,
    mapView,
    widgetLayers,
    addWidgetLayer,
  ]);

  // handle loading of the KMLLayer
  React.useEffect(() => {
    if (
      !file?.file?.esriFileType ||
      !mapView ||
      file.file.esriFileType !== 'kml'
    ) {
      return;
    }
    if (file.file.name === file.lastFileName) return;

    // read in the file
    const reader = new FileReader();
    reader.onload = function (event: Event) {
      if (reader.error || !event || !reader.result) {
        console.error('File Read Error: ', reader.error);
        setUploadStatus('file-read-error');
        return;
      }

      // build the arcgis kml call
      // this data is used to get the renderers
      const kmlUrl = 'https://utility.arcgis.com/sharing/kml';
      const contents = reader.result;
      const params = {
        kmlString: encodeURIComponent(contents),
        model: 'simple',
        folders: '',
        outSR: mapView.spatialReference,
      };
      fetchPostForm(kmlUrl, params)
        .then((res: any) => {
          setGenerateResponse(res);
        })
        .catch((err) => {
          console.error(err);
          setUploadStatus('failure');
        });
    };

    try {
      reader.readAsText(file.file);
    } catch (ex) {
      console.error('File Read Error: ', ex);
      setUploadStatus('file-read-error');
    }
  }, [KMLLayer, mapView, file]);

  const filename = file?.file?.name ? file.file.name : '';

  return (
    <SearchContainer>
      {uploadStatus === 'fetching' && <LoadingSpinner />}
      {uploadStatus !== 'fetching' && (
        <React.Fragment>
          {uploadStatus === 'invalid-file-type' &&
            invalidFileTypeMessage(filename)}
          {uploadStatus === 'import-error' && importErrorMessage}
          {uploadStatus === 'file-read-error' && fileReadErrorMessage(filename)}
          {uploadStatus === 'no-data' && noDataMessage(filename)}
          {uploadStatus === 'failure' && webServiceErrorMessage}
          {uploadStatus === 'success' &&
            uploadSuccessMessage(filename, newLayerName)}
          <CheckBoxStyles
            id="generalize-features-input"
            type="checkbox"
            checked={generalizeFeatures}
            onChange={(ev) => setGeneralizeFeatures(!generalizeFeatures)}
          />
          <label htmlFor="generalize-features-input">
            Generalize features for web display
          </label>
          <br />
          <div
            {...getRootProps({ className: 'dropzone' })}
            style={{ padding: '10px' }}
          >
            <input
              id="tots-dropzone"
              data-testid="tots-dropzone"
              {...getInputProps()}
            />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <FileIconTextColorDiv>
                <div>
                  <FileIcon label="Shape File" />
                  <FileIcon label="CSV" />
                  <FileIcon label="KML" />
                  <FileIcon label="GPX" />
                  <FileIcon label="Geo JSON" />
                </div>
                <label htmlFor="tots-dropzone">Drop or Browse</label>
                <br />
                <button onClick={open}>Browse</button>
              </FileIconTextColorDiv>
            )}
          </div>
        </React.Fragment>
      )}
    </SearchContainer>
  );
}

export default FilePanel;
