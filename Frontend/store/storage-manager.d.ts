export default StorageManager;
declare class StorageManager {
    constructor(crypto?: any);
    crypto: any;
    asyncManager: any;
    db: any;
    _dbPromise: Promise<any>;
    openDatabase(): Promise<any>;
    _ready(): Promise<any>;
    writeValue(id: any, value: any): Promise<any>;
    readValue(id: any, newState: any): Promise<any>;
    loadFromDatabase: (store: any, listenerId: any) => void;
}
//# sourceMappingURL=storage-manager.d.ts.map