const getPagination = (params) => {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
    const skip = (page - 1) * pageSize;
    return { page, pageSize, skip, take: pageSize };
};

const buildMeta = (page, pageSize, total) => ({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
});

module.exports = {
    getPagination,
    buildMeta,
};
