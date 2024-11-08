import { atom } from "recoil";
import { loginSelector } from "../selectors/loginSelector";

export const loggedin = atom({
    key: "loggedin",
    default: loginSelector
});