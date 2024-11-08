import { atom } from "recoil";

export const signin=atom({
    key: "signin",
    default: {
        Email: "",
        Password: "" 
    }
})