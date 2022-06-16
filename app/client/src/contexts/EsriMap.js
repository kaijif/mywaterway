// @flow

import React, { createContext } from 'react';
import type { Node } from 'react';

const EsriMapContext: Object = createContext();

type Props = { children: Node };

function EsriMapProvider({ children }: Props) {
  // (placeholder)

  return (
    <EsriMapContext.Provider value={{}}>{children}</EsriMapContext.Provider>
  );
}

export { EsriMapContext, EsriMapProvider };
