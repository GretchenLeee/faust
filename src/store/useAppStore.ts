import { SismoClient } from "faust-sismo-client";
import { createContext, useContext } from "react";

import { AppActionType, AppContextType } from "../types";

export const AppContext = createContext<AppContextType>(
  {} as AppContextType,
);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw "AppContext undefined";
  }

  const { state, dispatch } = context;

  const setSortedStreamIds = (streamIds: string[]) => {
    dispatch({
      type: AppActionType.SetSortedStreamIds,
      payload: streamIds,
    });
  };

  const setSismoClient = (sismoClient: SismoClient) => {
    dispatch({
      type: AppActionType.SetSismoClient,
      payload: sismoClient,
    });
  };

  return {
    ...state,
    setSismoClient,
    setSortedStreamIds
  };
};
