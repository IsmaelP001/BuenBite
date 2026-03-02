

export interface ApiResponse<T>{
    status:number;
    data:T
    hasMore?:boolean;
    page?:number
}

export interface Pagination{
    limit?:number;
    page?:number
}