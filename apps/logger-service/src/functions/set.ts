import * as dyn from "@logger/logger-sdk";

export async function handler(event: any) {
   try {
    if (!event.Records) {
        console.log(JSON.stringify(event, null, 2));
        console.log( JSON.stringify(event.body, null, 2));
        if (event.rawPath === "/create") {
            console.log(" tablename: " + process.env.TABLE_NAME + "   event.body: " + event.body, typeof JSON.parse(event.body))
            return setItemsInTable(process.env.TABLE_NAME, JSON.parse(event.body));
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

export async function setItemsInTable(tableName: string, items: Record<string, string>) {
    console.log("tablename: ", tableName, items);
    const isSuccessful = await dyn.setItems(tableName, items);
    if (isSuccessful) {
        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    } else {
        return {
            statusCode: 404,
            body: JSON.stringify({message: "not Successful setItems"})
        };
    }
}
