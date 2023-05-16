import React, {cloneElement, Fragment} from "react";
import {
    Box,
    CircularProgress,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import {useMedia} from "reducers/useMedia";
import {useTable} from "reducers/useTable";
import TablePagination from "./TablePagination";
import PerfectScrollbar from "react-perfect-scrollbar";

export default function ({onGet, Row, Filter, ...restProps}) {
    const {data, loading, startIndex, pagesCount, pageNumber, total, handle_change_page, form} = useTable(onGet)
    const {isMobile} = useMedia()
    const Columns = restProps.children
    const numberOfColumns = Columns.length

    return (
        <Fragment>
            {Filter && cloneElement(Filter, {form})}
            <PerfectScrollbar>
                <Table>
                    {!isMobile && (
                        <TableHead>
                            <TableRow>
                                { Columns }
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={isMobile ? 2 : numberOfColumns}>
                                    <Box py={2} sx={{textAlign: 'center'}}>
                                        <CircularProgress/>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && data.map((row, index) => (
                            <Fragment key={index}>{cloneElement(Row, row)}</Fragment>
                        ))}
                    </TableBody>
                </Table>
            </PerfectScrollbar>
            <Divider/>
            <TablePagination
                total={total}
                pageNumber={pageNumber}
                pagesCount={pagesCount}
                startIndex={startIndex}
                pageLength={data.length}
                handle_change_page={handle_change_page}
            />
        </Fragment>
    )
}
