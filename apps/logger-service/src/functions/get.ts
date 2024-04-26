import * as dyn from "@logger/logger-sdk";


export async function handler(event: any) {
   try {
    if (!event.Records) {
        console.log(JSON.stringify(event, null, 2));
        console.log( JSON.stringify(event.body, null, 2));
        if (event.rawPath === "/item") {
            return getItemsFromTable(process.env.TABLE_NAME);
        }
        return {
            statusCode: 404,
            body: JSON.stringify({message: "Not found"})
        };
    }
    } catch (error) {
        console.log("Internal Server Error");
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Internal Server Error"})
        };

   }
}

export async function getItemsFromTable(tableName: string) {
    const items = await dyn.getItems(tableName);
    return {
        statusCode: 200,
        body: JSON.stringify(items)
    };
}
