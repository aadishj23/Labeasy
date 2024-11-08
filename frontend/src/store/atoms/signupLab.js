import { atom } from "recoil";

export const signuplab=atom({
    key: "signuplab",
    default: {
        LabName: "",
        OwnerName: "",
        Email: "",
        Phone: 0,
        Password: "",
        ConfirmPassword: "" , 
        LicenseNo: "",
        GSTNo: "",
        Address: "",
        City: "",
        State: "",
        Pincode: 0
    }
})