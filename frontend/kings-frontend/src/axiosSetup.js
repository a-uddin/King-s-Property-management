// src/axiosSetup.js
import axios from 'axios';

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : process.env.REACT_APP_API_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
