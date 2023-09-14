import { ModelParser, Output } from "@dataverse/model-parser";
import { AppActionType, AppStateType } from "../types";
import app from "../../output/app.json";

export const initialState = {
  appVersion: "0.0.1",
  modelParser: new ModelParser(app as Output),
  sismoClient: undefined,
  sortedStreamIds: [],
};

export const reducer = (
  state: AppStateType,
  action: {
    type: AppActionType;
    payload: any;
  }
) => {
  const { type, payload } = action;

  switch (type) {
    case AppActionType.SetSismoClient:
      return {
        ...state,
        sismoClient: payload
      }

    case AppActionType.SetSortedStreamIds:
      return {
        ...state,
        sortedStreamIds: payload,
      };
    //   case AppActionType.SetIsDataverseExtension:
    //     return {
    //       ...state,
    //       isDataverseExtension: payload,
    //     };
    //   case AppActionType.SetNoExtensionModalVisible:
    //     return {
    //       ...state,
    //       isNoExtensionModalVisible: payload,
    //     };
    //   case AppActionType.SetIsConnecting:
    //     return {
    //       ...state,
    //       isConnecting: payload,
    //     };
  }
};
