export interface AppDbClient {
  create<I, R>(input: I): Promise<R>;
  update<I, R>(input: I): Promise<R>;
  find<I, R>(input: I): Promise<R>;
}
