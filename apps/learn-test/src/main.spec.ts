import { add, graiterThan, getItemsFromTable, setItemsInTable, itemIsInTable, deleteItemInTableById, streamConnectionOnline } from './main';

jest.setTimeout(50001)

describe('add', () => { 
    it('should add two numbers', () => {
        expect(add(1, 2)).toEqual(3);
    });
});

describe('graiterThan', () => {
    it('should return true if a is greater than b', () => {
        expect(graiterThan(2, 1)).toEqual(true);
    });

    it('should return false if a is less than b', () => {
        expect(graiterThan(1, 2)).toEqual(false);
    });
})

// describe('logTable-test', () => {
//     const tableName = 'logTable-6e5f217';
//     const endpoint = 'https://jyb0pgmaq3.execute-api.eu-north-1.amazonaws.com/dev';
//     const connection = { endpoint: endpoint, ConnectionId: 'W1UTNfUYAi0CImw='};
//     it('should return 404 if item not found', async () => {
//         const items = await getItemsFromTable('table-not-exist');
//         expect(items.statusCode).toEqual(404);
//         console.log("items: ", items.body);
//     });
//     it('should return items from table', async () => {
//         const items = await getItemsFromTable(tableName);
//         expect(items.statusCode).toEqual(200);
//         console.log("items: ", items.body);
//     });

//     it('should set items in table', async () => {
//         const items = await setItemsInTable(tableName, {id:"test", message: "Direct", metric: "test"});
//         expect(items.statusCode).toEqual(200);
//         console.log("items: ", items.body);
//     });
    
//     it('should return 200 if item in table', async () => {
//         const items = await itemIsInTable(tableName, 'test');
//         expect(items.statusCode).toEqual(200);
//         console.log("items: ", items.body);
//     });

//     it('should delete item in table by id', async () => {
//         const items = await deleteItemInTableById(tableName, 'test');
//         expect(items.statusCode).toEqual(200);
//         console.log("items: ", items.body);
//     });
//     it('should return 404 if item not table', async () => {
//         const items = await itemIsInTable(tableName, 'test');
//         expect(items.statusCode).toEqual(404);
//         console.log("items: ", items.body);
//     });

//     it('should return 500 if no conecting to stream', async () => {
//         const items = await streamConnectionOnline({ endpoint: 'https://wrong/dev', ConnectionId: 'wrong'}, { id: "Trough stream", message: "test", metric: "test" });
//         expect(items.statusCode).toEqual(500);
//     });
//     it('should return 200 if conecting to stream', async () => {
//         const items = await streamConnectionOnline(connection, { id: "test", message: "Trough stream", metric: "test" });
//         console.log("items: ", items.body);
//         expect(items.statusCode).toEqual(200);
//     });
    
// });