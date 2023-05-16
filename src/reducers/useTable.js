import React, {useEffect, useMemo, useRef, useState} from "react";
import useObject from "./useObject";

const PAGE_LENGTH = 10;

export function useTable(get_callback) {
    const didMount = useRef(false)
    const [loading, set_loading] = useState(true)
    const [pageNumber, set_pageNumber] = useState(1)
    const [filter, set_filter] = useState({})
    const [data, set_data] = useState([])
    const [total, set_total] = useState(0)
    const pagesCount = useMemo(() => Math.ceil(total/PAGE_LENGTH), [total])
    const startIndex = useMemo(() => (pageNumber-1)*PAGE_LENGTH, [pageNumber])
    const form = useObject()

    const handle_change_page = (event, value) => {
        set_pageNumber(value);
    }

    useEffect(() => {
        if (didMount.current) {
            set_pageNumber(1)
            set_filter(form.data)
        } else {
            didMount.current = true
        }
    },[form.data])

    useEffect(() => {
        set_loading(true)
        const payload = {
            skip: startIndex,
            limit: PAGE_LENGTH,
        }
        get_callback(payload,filter).then(res => {
            set_loading(false)
            set_data(res.data)
            set_total(res.total)
        })
    },[pageNumber,filter])

    return {
        data,
        loading,
        total,
        pageNumber,
        pagesCount,
        startIndex,
        handle_change_page,
        form
    }
}
