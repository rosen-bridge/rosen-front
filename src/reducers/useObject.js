import React, { useState } from "react";

export default function useObject() {
    const [data, set_data] = useState({});

    return {
        get data() {
            return data;
        },
        set data(value) {
            return set_data(value);
        },
        put(name, value) {
            set_data((prevState) => ({ ...prevState, [name]: value }));
        }
    };
}
