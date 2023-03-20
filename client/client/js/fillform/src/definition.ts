import { Page } from "puppeteer";

export enum Message {
  SUCCESS,
  ERROR,
  WARNING,
  LOG,
  INFO,
}

export interface ActArgs {
  rcic?: string;
  page: Page;
  mode: object;
  verbose: boolean; //determine if display details in element, bloack levels. section, page levels will be displayed automatically.
  exit_on_error: boolean; // if exit on error
  delay: number; // for type delay for ms
  snapshot: boolean;  // take snapshot as pdf for every page
  path: string; // path to save pdf files
}

export enum Action {
  Page = "Page",
  Radio_Yes_No = "Radio_Yes_No",
  Radio_Yes_No_Null = "Radio_Yes_No_Null",
  Checkbox = "Checkbox",
  Input = "Input",
  Areatext = "Areatext",
  Select = "Select",
  DependantSelect = "DependantSelect",
  Radio = "Radio",
  Button = "Button",
  Turnpage = "Turnpage",
  Wait4Element = "Wait4Elment",
  GotoPage = "GotoPage",
  Login = "Login",
  Security = "Security",
  Upload = "Upload",
  Pdf = "Pdf",
  RepeatSection = "RepeatSection",
  PrPortalPick = "PrPortalPick",
  BcpnpPick = "BcpnpPick",
  LmiaEmployerPick = "LmiaEmployerPick",
  Wait = "Wait",
  Continue = "Continue",
  PressKey = "PressKey"
}
