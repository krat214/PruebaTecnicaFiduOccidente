# Prueba Técnica FiduOccidente
Creacion de Lambda con API Gateway,  DynamoDb, step function conNodeJS



## Badges
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
## Enunciado

1. Se requiere crear un API Gateway que ofrezca las funcionalidades de:
- createProduct
-  updateProduct
- deleteProduct
Para esto se debe crear una(s) lambda(s) que se integre con el API Gateway.
Y la lambda a su vez debe integrarse con una tabla de DynamoDb en la cual se gestionaran los Productos.
La lambda o lambdas deben tener pruebas unitarias.
Se propone la siguiente estructura JSON para los productos:

{
"productId": 1,
"productName": "Silla"
}

Se deben manejar bien los códigos HTTP y se debe crear un objeto json que represente el estado de cada
ejecución.
El lenguaje para la lambda pueden ser los siguientes:
- NodeJS
- Golang
- Python
2. Se requiere crear una step function que reutilice la(s) lambda(s)
- Crear Producto
- Actualizar Producto
- Eliminar Producto
Cada ejecución debe permitir recibir un objeto JSON con varios objetos que representaran
los productos que se quieran crear, modificar o eliminar. El arreglo de objetos se debera iterar
por medio de un Map.
Se propone la siguiente estructura JSON como input de la step function:

Crear Producto
{
 "operation":"createProduct",
 "products":[
 {
 "productId":1,
 "productName":"Silla"
 },
 {
 "productId":1,
 "productName":"Silla"
 },
 {
 "productId":1,
 "productName":"Silla"
 }
 ]
}

## Documentación

[Solución ](https://linktodocumentation)

Se realizo Api Gateway ApiProducts
Rutas: 
Devolver Todos los  productos : https://3cukkm8fv6.execute-api.us-east-1.amazonaws.com/api/products
Crear producto: https://3cukkm8fv6.execute-api.us-east-1.amazonaws.com/api/createproduct
Actualizar producto: https://3cukkm8fv6.execute-api.us-east-1.amazonaws.com/api/updateproduct
Borrar producto: https://3cukkm8fv6.execute-api.us-east-1.amazonaws.com/api/deleteproduct

Lambda FuntionsProducts  con unitTes realizado con Jest con coverage de 96.29% sin covertura tres lineas de codigo en total.
Comprende de :
- index.js
- folder test(index.spec.js)

Tabla BD 'Products'  en DynamoDB

Maquina de estados MyStateMachine


## ASL de MyStateMachine

```javascript
{
  "StartAt": "DecideOperation",
  "States": {
    "DecideOperation": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.Operation",
          "StringEquals": "createProduct",
          "Next": "CreateProduct"
        },
        {
          "Variable": "$.Operation",
          "StringEquals": "updateProduct",
          "Next": "UpdateProduct"
        },
        {
          "Variable": "$.Operation",
          "StringEquals": "deleteProduct",
          "Next": "DeleteProduct"
        }
      ],
      "Default": "FailState"
    },
    "CreateProduct": {
      "Type": "Map",
      "InputPath": "$.products",
      "ItemsPath": "$",
      "Iterator": {
        "StartAt": "CreateProductLamda",
        "States": {
          "CreateProductLamda": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:751768910717:function:FuntionsProducts",
            "Parameters": {
              "operation": "createProduct",
              "body.$":"$"
            },
            "ResultPath": "$.products",
            "End": true
          }
        }
      },
      "End": true
    },
    "UpdateProduct": {
      "Type": "Map",
      "InputPath": "$.products",
      "ItemsPath": "$",
      "Iterator": {
        "StartAt": "UpdateProductLamda",
        "States": {
          "UpdateProductLamda": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:751768910717:function:FuntionsProducts",
            "Parameters": {
              "operation": "updateProduct",
              "body.$":"$"
            },
            "ResultPath": "$.products",
            "End": true
          }
        }
      },
      "End": true
    },
    "DeleteProduct": {
      "Type": "Map",
      "InputPath": "$.products",
      "ItemsPath": "$",
      "Iterator": {
        "StartAt": "DeleteProductLamda",
        "States": {
          "DeleteProductLamda": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:751768910717:function:FuntionsProducts",
            "Parameters": {
              "operation": "deleteProduct",
              "body.$":"$"
            },
            "ResultPath": "$.products",
            "End": true
          }
        }
      },
      "End": true
    },
    "FailState": {
      "Type": "Fail"
    }
  }
}
```

