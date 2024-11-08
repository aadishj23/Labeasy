import { atom } from "recoil";

export const signin=atom({
    key: "signin",
    default: {
        Name: "",
        Password: "" 
    }
})