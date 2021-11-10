// @flow

import React from 'react';
import { css } from 'styled-components/macro';
// components
import LoadingSpinner from 'components/shared/LoadingSpinner';
import WaterbodyIcon from 'components/shared/WaterbodyIcon';
import WaterbodyInfo from 'components/shared/WaterbodyInfo';
import ViewOnMapButton from 'components/shared/ViewOnMapButton';
import { AccordionList, AccordionItem } from 'components/shared/Accordion';
import VirtualizedList from 'components/shared/VirtualizedList';
// utilities
import {
  getTypeFromAttributes,
  getWaterbodyCondition,
  getOrganizationLabel,
} from 'components/pages/LocationMap/MapFunctions';
// contexts
import { MapHighlightContext } from 'contexts/MapHighlight';

// --- styled components ---
const textStyles = css`
  margin: 1em;
  padding-bottom: 0;
  font-weight: bold;
`;

const legendStyles = css`
  margin: 1em;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  span {
    display: flex;
    align-items: center;
  }
`;

const waterbodyContentStyles = css`
  padding: 0.875em;

  button {
    margin-bottom: 0;
  }
`;

// --- components ---
type Props = {
  waterbodies: Array<Object>,
  type: string,
  fieldName: string,
};

function WaterbodyList({
  waterbodies,
  type = 'Waterbody',
  fieldName = '',
}: Props) {
  // Triggers the loading spinner. When a search is complete the loading
  // spinner will be displayed for 250ms.
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    if (!waterbodies) {
      setLoading(true);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 250);
    }
  }, [waterbodies]);

  // Sort the waterbodies
  const [sortBy, setSortBy] = React.useState('assessmentunitname');
  const { highlightedGraphic, selectedGraphic } = React.useContext(
    MapHighlightContext,
  );
  const [expandedRows, setExpandedRows] = React.useState([]);

  if (loading || !waterbodies) return <LoadingSpinner />;
  if (!loading && waterbodies && waterbodies.length <= 0) {
    return <p css={textStyles}>No waterbodies found.</p>;
  }

  waterbodies.sort((objA, objB) => {
    return objA['attributes'][sortBy].localeCompare(objB['attributes'][sortBy]);
  });

  return (
    <>
      <p css={textStyles}>Waterbody Conditions:</p>
      <div css={legendStyles}>
        <span>
          <WaterbodyIcon condition={'good'} selected={false} />
          &nbsp;Good
        </span>
        <span>
          <WaterbodyIcon condition={'polluted'} selected={false} />
          &nbsp;Impaired
        </span>
        <span>
          <WaterbodyIcon condition={'unassessed'} selected={false} />
          &nbsp;Condition Unknown
        </span>
      </div>
      <AccordionList
        sortOptions={[
          { value: 'assessmentunitname', label: 'Waterbody Name' },
          { value: 'assessmentunitidentifier', label: 'Assessment Unit Id' },
        ]}
        onSortChange={(sortBy) => setSortBy(sortBy.value)}
      >
        <VirtualizedList
          items={waterbodies}
          expandedRowsSetter={setExpandedRows}
          renderer={({ index, resizeCell, allExpanded }) => {
            const graphic = waterbodies[index];
            /* prettier-ignore */
            const condition = getWaterbodyCondition(graphic.attributes, fieldName, true).condition;

            let status = null;
            // ensure the key exists prior to deciding to highlight
            if (
              graphic &&
              graphic.attributes &&
              graphic.attributes['assessmentunitidentifier']
            ) {
              const id = graphic.attributes['assessmentunitidentifier'];

              const isSelected =
                selectedGraphic && selectedGraphic.attributes
                  ? selectedGraphic.attributes['assessmentunitidentifier'] ===
                    id
                  : false;

              const isHighlighted =
                highlightedGraphic && highlightedGraphic.attributes
                  ? highlightedGraphic.attributes[
                      'assessmentunitidentifier'
                    ] === id
                  : false;

              if (isSelected) status = 'selected';
              else if (isHighlighted && !isSelected) status = 'highlighted';
            }

            // get the type of symbol for creating a unique key, since it is currently
            // possible for the assessmentunitid and objectid to be duplicated across
            // layers.
            const type = getTypeFromAttributes(graphic);

            return (
              <AccordionItem
                key={
                  type +
                  graphic.attributes.organizationid +
                  graphic.attributes.assessmentunitidentifier
                }
                index={
                  type +
                  graphic.attributes.organizationid +
                  graphic.attributes.assessmentunitidentifier
                }
                title={<strong>{graphic.attributes.assessmentunitname}</strong>}
                subTitle={`${getOrganizationLabel(graphic.attributes)} ${
                  graphic.attributes.assessmentunitidentifier
                }`}
                icon={<WaterbodyIcon condition={condition} selected={false} />}
                feature={graphic}
                idKey={'assessmentunitidentifier'}
                status={status}
                allExpanded={allExpanded || expandedRows.includes(index)}
                onChange={() => {
                  // ensure the cell is sized appropriately
                  resizeCell();

                  // add the item to the expandedRows array so the accordion item
                  // will stay expanded when the user scrolls or highlights map items
                  if (expandedRows.includes(index)) {
                    setExpandedRows(
                      expandedRows.filter((item) => item !== index),
                    );
                  } else setExpandedRows(expandedRows.concat(index));
                }}
              >
                <div css={waterbodyContentStyles}>
                  <WaterbodyInfo
                    type={'Waterbody State Overview'}
                    feature={graphic}
                  />
                  <ViewOnMapButton feature={graphic} />
                </div>
              </AccordionItem>
            );
          }}
        />
      </AccordionList>
    </>
  );
}

export default WaterbodyList;
