/*******Handler*******/
/* @author: Angel Renteria
/* @date: 2023-04-26
/* @description: Handler para la prueba tecnica de FiduOccidente
/* @version: 1
*/

/*/******** Importaciones ********/
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

/******** Acceso a DynamoDB ********/
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'products';


/******** Funciones / Rutas Api ********/
const productsAllPath = '/products';
const productPath = '/product';
const productPostPath = '/createproduct';
const productPutPath = '/updateproduct';
const productDeletePath = '/deleteproduct';

exports.handler = async function handler(event) {

    let response;

/******** Switch para las diferentes rutas ********/

    switch (true) {
        case event.httpMethod === 'GET' && event.path === productsAllPath:
            response = await getProducts();
            break;
        case event.httpMethod === 'GET' && event.path === productPath:
            response = await getProduct(event.queryStringParameters.productId);
            break;
        case event.httpMethod === 'POST' && event.path === productPostPath || event.operation === 'createProduct':
            if (event.operation === 'createProduct') {
                event.body = JSON.stringify(event.body);
            }
            response = await saveProduct(JSON.parse(event.body));
            break;
        case event.httpMethod === 'PATCH' && event.path === productPutPath:
            const requestBody = JSON.parse(event.body);
            response = await modifyProduct(requestBody.productId, requestBody.updateKey, requestBody.updateValue);
            break;
        case event.httpMethod === 'PUT' && event.path === productPutPath || event.operation === 'updateProduct':
            if (event.operation === 'updateProduct') {
                event.body = JSON.stringify(event.body);
            }
            response = await updateProduct(JSON.parse(event.body));
            break;
        case event.httpMethod === 'DELETE' && event.path === productDeletePath || event.operation === 'deleteProduct':
            if (event.operation === 'deleteProduct') {
                event.body = JSON.stringify(event.body);
            }
            response = await deleteProduct(JSON.parse(event.body).productId);
            break;
        default:
            response = buildResponse(501, 'Unknown Method');
    }

    return response;

}

/******** Consulta todos los productos ********/

async function getProducts() {
    const params = {
        TableName: tableName
    }
    const allProducts = await scanDynamoRecords(params, []);
    const body = {
        Operation: 'findAllproducts',
        Message: 'Products Found',
        Products: allProducts
    }
    return buildResponse(200, body);
}

/******** Funcion para consultar por productId ********/

async function getProduct(productId) {

    const params = {
        TableName: tableName,
        Key: {
            'productId': productId
        }
    }

    return await dynamodb.get(params).promise().then((product) => {
        if (!product.Item) {
            const body = {
                Operation: 'findByproductId',
                Message: 'Error Getting Product Not Found',
                Error: `Product with ID ${productId} not found`
            }
            return buildResponse(404, body);
        }
        const body = {
            Operation: 'findByproductId',
            Message: 'Product Found',
            Product: product.Item
        }
        return buildResponse(200, body);
    }).catch((error) => {
        const body = {
            Operation: 'findByproductId',
            Message: 'Error Getting Product',
            Error: error
        }
        return buildResponse(error.statusCode, body);
    });
}

/******** Funcion para guardar un producto ********/

async function saveProduct(requestBody) {
    const params = {
        TableName: tableName,
        Item: requestBody
    }
    return await dynamodb.put(params).promise().then(() => {
        const body = {
            Operation: 'createProduct',
            Message: 'Product Created Successfully',
            Product: requestBody
        }
        return buildResponse(200, body);
    }).catch((error) => {
        const body = {
            Operation: 'createProduct',
            Message: 'Error Saving Product',
            Error: error
        }
        return buildResponse(error.statusCode, body);
    });
}

/******** Funcion para modificar un producto solo un item especifico********/

async function modifyProduct(productId, updateKey, updateValue) {
    const params = {
        TableName: tableName,
        Key: {
            'productId': productId
        },
        UpdateExpression: `set ${updateKey} = :value`,
        ExpressionAttributeValues: {
            ':value': updateValue
        },
        ReturnValues: 'UPDATED_NEW'
    }
    return await dynamodb.update(params).promise().then(() => {
        const body = {
            Operation: 'modifyProduct',
            Message: 'Product Modified Successfully',
            Product: productId
        }
        return buildResponse(200, body);
    }).catch((error) => {
        const body = {
            Operation: 'modifyProduct',
            Message: 'Error Modified Product',
            Error: error
        }
        return buildResponse(error.statusCode, body);
    });
}

/******** Funcion para actualizar un producto completo ********/

async function updateProduct(product) {
    const updateExpressionParts = [];
    const expressionAttributeValues = {};

    Object.entries(product).forEach(([key, value]) => {
        if (key !== 'productId') { // omitimos el atributo 'productId' del update
            updateExpressionParts.push(`${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
        }
    });

    const params = {
        TableName: tableName,
        Key: {
            'productId': product.productId
        },
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW'
    }
    return await dynamodb.update(params).promise().then((data) => {
        const body = {
            Operation: 'updateProduct',
            Message: 'Product Updated Successfully',
            Product: product
        }
        return buildResponse(200, body);
    }).catch((error) => {
        const body = {
            Operation: 'updateProduct',
            Message: 'Error Updating Product',
            Error: error
        }
        return buildResponse(error.statusCode, body);
    });
}

/******** Funcion para eliminar un producto ********/

async function deleteProduct(productId) {
    const params = {
        TableName: tableName,
        Key: {
            'productId': productId
        },
        ReturnValues: 'ALL_OLD'
    }
    return await dynamodb.delete(params).promise().then(() => {
        const body = {
            Operation: 'deleteProduct',
            Message: 'Product Deleted Successfully',
            Product: productId
        }
        return buildResponse(200, body);
    }).catch((error) => {
        const body = {
            Operation: 'deleteProduct',
            Message: 'Error Deleting Product',
            Error: error
        }
        return buildResponse(error.statusCode, body);
    });
}

/******** Funcion para escanear la tabla ********/

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch (error) {
        return error;
    }
}

/******** Funcion para construir la respuesta ********/

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
