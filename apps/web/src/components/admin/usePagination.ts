import { useState } from "react";

export const usePagination = (initialSize = 10) => {
    const [pagination, setPagination] = useState({
        pageSize: initialSize,
        pageIndex: 0,
    });
    const { pageSize, pageIndex } = pagination;

    return {
        // table state
        onPaginationChange: setPagination,
        pagination,
        // API
        limit: pageSize,
        skip: pageSize * pageIndex,
    };
}