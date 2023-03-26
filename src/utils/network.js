import { default as axios } from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const apiInstance = axios.create({
    baseURL: `${API_URL}/v1`,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});
