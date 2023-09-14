import { ModelParser } from "@dataverse/model-parser";
import { SismoClient } from "faust-sismo-client";

export type AppStateType = {
  appVersion: string;
  modelParser: ModelParser;
  sortedStreamIds: string[];
  sismoClient: SismoClient;
};

export enum AppActionType {
  SetSortedStreamIds,
  SetSismoClient
}

export type AppContextType = {
  state: AppStateType;
  dispatch: React.Dispatch<any>;
};
