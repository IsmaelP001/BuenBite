export interface PaginatedResponse<T> {
  items: T[];
  hasMore?:boolean
  page?:number
}