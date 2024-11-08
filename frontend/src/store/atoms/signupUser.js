import { atom } from "recoil";

export const signupuser=atom({
    key: "signupuser",
    default: {
        Name: "",
        Email: "",
        Phone: 0,
        Password: "",
        ConfirmPassword: ""  
    }
})