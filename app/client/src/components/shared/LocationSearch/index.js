// @flow

import React from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { isIE } from 'components/pages/LocationMap/MapFunctions';
// contexts
import { EsriModulesContext } from 'contexts/EsriModules';
import { LocationSearchContext } from 'contexts/locationSearch';
// config
import { locatorUrl } from 'config/mapServiceConfig';
// styles
import { colors } from 'styles/index.js';

// --- styled components ---
const Form = styled.form`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
`;

const Input = styled.input`
  margin-top: 1em;
  width: 100%;
  font-size: 0.9375em;

  @media (min-width: 480px) {
    flex: 1;
    margin-right: 0.5em;
  }
`;

const Button = styled.button`
  margin-top: 1em;
  margin-bottom: 0;
  font-size: 0.9375em;
  font-weight: bold;
  color: ${colors.white()};
  background-color: ${colors.blue()};

  &:not(.btn-danger):hover,
  &:not(.btn-danger):focus {
    color: ${colors.white()};
    background-color: ${colors.purple()};
  }

  &:disabled {
    cursor: default;
  }
`;

const Text = styled.p`
  margin: 1em 0.5em 0;
  padding: 0 !important;
  font-size: 0.875em;
  font-weight: bold;
`;

// --- components ---
type Props = {
  route: string,
};

function LocationSearch({ route }: Props) {
  const { Locator, Point } = React.useContext(EsriModulesContext);
  const { searchText } = React.useContext(LocationSearchContext);

  // geolocating state for updating the 'Use My Location' button
  const [geolocating, setGeolocating] = React.useState(false);

  // geolocationError state for disabling the 'Use My Location' button
  const [geolocationError, setGeolocationError] = React.useState(false);

  // initialize inputText from searchText context
  const [inputText, setInputText] = React.useState(searchText);

  // update inputText whenever searchText changes (i.e. Form onSubmit)
  React.useEffect(() => setInputText(searchText), [searchText]);

  return (
    <Form
      onSubmit={(ev) => {
        ev.preventDefault();
        if (inputText) {
          setGeolocationError(false);
          // only navigate if search box contains text
          navigate(encodeURI(route.replace('{urlSearch}', inputText.trim())));
        }
      }}
    >
      <label className="sr-only">Location</label>

      <Input
        className="form-control"
        placeholder="Search by address, zip code, or place..."
        value={inputText}
        onChange={(ev) => setInputText(ev.target.value)}
      />

      <Button className="btn" type="submit" disabled={inputText === searchText}>
        <i className="fas fa-angle-double-right" /> Go
      </Button>

      {navigator.geolocation && (
        <>
          <Text>OR</Text>

          {geolocationError ? (
            <Button className="btn btn-danger" type="button" disabled>
              <i className="fas fa-exclamation-triangle" />
              &nbsp;&nbsp;Error Getting Location
            </Button>
          ) : (
            <Button
              className="btn"
              type="button"
              onClick={(ev) => {
                setGeolocating(true);

                navigator.geolocation.getCurrentPosition(
                  // success function called when geolocation succeeds
                  (position) => {
                    const locatorTask = new Locator({ url: locatorUrl });
                    const params = {
                      location: new Point({
                        x: position.coords.longitude,
                        y: position.coords.latitude,
                      }),
                    };

                    locatorTask.locationToAddress(params).then((candidate) => {
                      setGeolocating(false);
                      navigate(
                        encodeURI(
                          route.replace('{urlSearch}', candidate.address),
                        ),
                      );
                    });
                  },
                  // failure function called when geolocation fails
                  (err) => {
                    console.error(err);
                    setGeolocating(false);
                    setGeolocationError(true);
                  },
                );
              }}
            >
              {/* don't display the loading indicator in IE11 */}
              {!geolocating || isIE() ? (
                <>
                  <i className="fas fa-crosshairs" />
                  &nbsp;&nbsp;Use My Location
                </>
              ) : (
                <>
                  <i className="fas fa-spinner fa-pulse" />
                  &nbsp;&nbsp;Getting Location...
                </>
              )}
            </Button>
          )}
        </>
      )}
    </Form>
  );
}

export default LocationSearch;
